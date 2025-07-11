import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User, 
  ShoppingCart,
  ExternalLink,
  Phone
} from 'lucide-react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

// Utility function for formatting time to Vietnam timezone
const formatVietnamTime = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost:7107';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !connection && !isConnecting) {
      initializeConnection();
    }
  }, [isOpen]);

  // Cleanup connection on unmount
  useEffect(() => {
    return () => {
      if (connection) {
        connection.stop().catch(console.error);
      }
    };
  }, [connection]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConnection = async () => {
    try {
      setIsConnecting(true);
      
      const token = localStorage.getItem('token');
      const connectionUrl = token 
        ? `${API_BASE_URL}/chatHub?access_token=${token}`
        : `${API_BASE_URL}/chatHub`;
      
      const newConnection = new HubConnectionBuilder()
        .withUrl(connectionUrl, {
          skipNegotiation: false,
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      newConnection.on('NewMessage', (message) => {
        setMessages(prev => {
          // Remove any temporary messages with same content
          const filteredMessages = prev.filter(m => 
            !(m.isTemporary && m.content === message.content && m.sender === message.sender)
          );
          
          // Check if message already exists to prevent duplicates
          const messageExists = filteredMessages.some(m => m.id === message.id || 
            (m.content === message.content && 
             m.sender === message.sender && 
             m.sentAt && message.sentAt &&
             Math.abs(new Date(m.sentAt) - new Date(message.sentAt)) < 1000)
          );
          
          if (messageExists) {
            return filteredMessages;
          }
          
          return [...filteredMessages, message];
        });
        setIsLoading(false);
      });

      newConnection.on('TypingIndicator', (data) => {
        if (data.isTyping && data.userId !== getCurrentUserId()) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      newConnection.on('ChatEscalated', (session) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: 'Bạn đã được kết nối với nhân viên tư vấn. Vui lòng chờ trong giây lát...',
          type: 'Text',
          sender: 'System',
          sentAt: new Date().toISOString()
        }]);
      });

      await newConnection.start();
      setConnection(newConnection);
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('SignalR connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const createSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: sessionId,
          guestName: !token ? guestName : undefined,
          guestEmail: !token ? guestEmail : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create chat session');
      }

      const session = await response.json();
      setSessionId(session.sessionId);
      setMessages(session.messages || []);

      // Join SignalR group
      if (connection) {
        await connection.invoke('JoinSession', session.sessionId);
      }

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      let currentSessionId = sessionId;
      
      // Create session if not exists
      if (!currentSessionId) {
        const session = await createSession();
        currentSessionId = session.sessionId;
      }

      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Add user message to UI immediately with temporary ID
      const tempId = `temp_${Date.now()}`;
      const userMessage = {
        id: tempId,
        content: messageText,
        type: 'Text',
        sender: 'User',
        sentAt: new Date().toISOString(),
        isTemporary: true
      };
      setMessages(prev => [...prev, userMessage]);

      // Send typing indicator
      if (connection) {
        await connection.invoke('SendTypingIndicator', currentSessionId, true);
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: messageText,
          sessionId: currentSessionId,
          guestName: !token ? guestName : undefined,
          guestEmail: !token ? guestEmail : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Stop typing indicator
      if (connection) {
        await connection.invoke('SendTypingIndicator', currentSessionId, false);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      // Remove temporary message and add error message
      setMessages(prev => {
        const filteredMessages = prev.filter(m => !m.isTemporary);
        return [...filteredMessages, {
          id: Date.now(),
          content: 'Xin lỗi, có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.',
          type: 'Text',
          sender: 'System',
          sentAt: new Date().toISOString()
        }];
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedAction = async (action, data) => {
    switch (action) {
      case 'search_phones':
        setInputMessage('Tôi muốn tìm điện thoại');
        break;
      case 'search_laptops':
        setInputMessage('Tôi muốn tìm laptop');
        break;
      case 'search_headphones':
        setInputMessage('Tôi muốn tìm tai nghe');
        break;
      case 'view_promotions':
        setInputMessage('Có khuyến mãi gì không?');
        break;
      case 'contact_admin':
        await escalateToAdmin();
        return;
      case 'add_to_cart':
        if (data?.productId) {
          // Add to cart logic
          console.log('Add to cart:', data.productId);
        }
        return;
      case 'view_product':
        if (data?.productId) {
          window.open(`/products/${data.productId}`, '_blank');
        }
        return;
      default:
        return;
    }
    
    // Auto send the message
    setTimeout(() => sendMessage(), 100);
  };

  const escalateToAdmin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${sessionId}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'User requested human support'
        })
      });

      if (response.ok) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: 'Đang kết nối bạn với nhân viên tư vấn...',
          type: 'Text',
          sender: 'System',
          sentAt: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error escalating to admin:', error);
    }
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return parseInt(payload.sub);
    } catch {
      return null;
    }
  };

  const renderMessage = (message) => {
    const isUser = message.sender === 'User';
    const isAI = message.sender === 'AI';
    const isSystem = message.sender === 'System';

    return (
      <div key={message.id} className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500' : isAI ? 'bg-green-500' : 'bg-gray-400'
          }`}>
            {isUser ? <User size={16} color="white" /> : 
             isAI ? <Bot size={16} color="white" /> : 
             <MessageCircle size={16} color="white" />}
          </div>

          {/* Message bubble */}
          <div className={`rounded-lg px-3 py-2 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : isSystem 
                ? 'bg-gray-100 text-gray-800 border border-gray-200'
                : 'bg-white text-gray-800 border border-gray-200'
          }`}>
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            
            {/* Product recommendations */}
            {message.metadata?.ProductRecommendations && (
              <div className="mt-2 space-y-2">
                {message.metadata.ProductRecommendations.map((product, index) => (
                  <div key={index} className="bg-gray-50 rounded p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-gray-600">{product.brand} - {product.category}</div>
                        <div className="text-blue-600 font-medium">
                          {product.discountPrice ? (
                            <>
                              {(product.discountPrice || 0).toLocaleString()}đ 
                              <span className="line-through text-gray-400 ml-1">
                                {(product.price || 0).toLocaleString()}đ
                              </span>
                            </>
                          ) : (
                            `${(product.price || 0).toLocaleString()}đ`
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSuggestedAction('view_product', { productId: product.productId })}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested actions */}
            {message.suggestedActions && message.suggestedActions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {message.suggestedActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedAction(action.action, action.data)}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            )}

            <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatVietnamTime(message.sentAt)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Guest name prompt
  if (isOpen && !sessionId && showNamePrompt && !localStorage.getItem('token')) {
    return (
      <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border z-[9999]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Chào mừng đến SHN-Gear!</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Để chúng tôi hỗ trợ bạn tốt hơn, vui lòng cho biết thông tin của bạn:
          </p>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Nhập tên của bạn..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
          />
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="Email của bạn (tùy chọn)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && guestName.trim()) {
                setShowNamePrompt(false);
                createSession();
              }
            }}
          />
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (guestName.trim()) {
                  setShowNamePrompt(false);
                  createSession();
                }
              }}
              disabled={!guestName.trim()}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Bắt đầu chat
            </button>
            <button
              onClick={() => {
                setGuestName('Khách');
                setShowNamePrompt(false);
                createSession();
              }}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
            >
              Bỏ qua
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main chat widget
  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-[9999] hover:scale-110"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border z-[9999] transition-all duration-300 flex flex-col ${
          isMinimized ? 'w-80 h-14' : 'w-80 h-[500px]'
        } max-h-[80vh]`}>
          {/* Header */}
          <div className="bg-blue-500 text-white p-4 rounded-t-xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Bot size={20} />
              <div>
                <div className="font-semibold text-sm">SHN-Gear Assistant</div>
                <div className="text-xs text-blue-100">
                  {isConnecting ? 'Đang kết nối...' : 'Online • Phản hồi ngay'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-blue-100 hover:text-white p-1 rounded hover:bg-blue-600 transition-colors"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-100 hover:text-white p-1 rounded hover:bg-blue-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm mt-8">
                    <Bot size={32} className="mx-auto mb-2 text-gray-400" />
                    <p>Xin chào! Tôi có thể giúp gì cho bạn?</p>
                  </div>
                )}
                
                {messages.map(renderMessage)}
                
                {isTyping && (
                  <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
                    <Bot size={16} />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white rounded-b-xl flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
                
                {/* Quick actions */}
                {messages.length === 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSuggestedAction('search_phones')}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      📱 Điện thoại
                    </button>
                    <button
                      onClick={() => handleSuggestedAction('search_laptops')}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      💻 Laptop
                    </button>
                    <button
                      onClick={() => handleSuggestedAction('view_promotions')}
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      🎉 Khuyến mãi
                    </button>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-2 text-center">
                  Powered by SHN-Gear AI
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
