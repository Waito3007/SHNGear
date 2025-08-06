import React, { useState, useEffect, useRef } from "react";
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
  Phone,
  Cpu,
  Zap,
  Terminal,
  Wifi,
} from "lucide-react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

// Utility function for formatting time to Vietnam timezone
const formatVietnamTime = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://localhost:7107";

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeConnection = async () => {
    try {
      setIsConnecting(true);

      const token = localStorage.getItem("token");
      const connectionUrl = token
        ? `${API_BASE_URL}/chatHub?access_token=${token}`
        : `${API_BASE_URL}/chatHub`;

      const newConnection = new HubConnectionBuilder()
        .withUrl(connectionUrl, {
          skipNegotiation: false,
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      newConnection.on("NewMessage", (message) => {
        setMessages((prev) => {
          // Remove any temporary messages with same content
          const filteredMessages = prev.filter(
            (m) =>
              !(
                m.isTemporary &&
                m.content === message.content &&
                m.sender === message.sender
              )
          );

          // Check if message already exists to prevent duplicates
          const messageExists = filteredMessages.some(
            (m) =>
              m.id === message.id ||
              (m.content === message.content &&
                m.sender === message.sender &&
                m.sentAt &&
                message.sentAt &&
                Math.abs(new Date(m.sentAt) - new Date(message.sentAt)) < 1000)
          );

          if (messageExists) {
            return filteredMessages;
          }

          return [...filteredMessages, message];
        });
        setIsLoading(false);
      });

      newConnection.on("TypingIndicator", (data) => {
        if (data.isTyping && data.userId !== getCurrentUserId()) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      newConnection.on("ChatEscalated", (session) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            content:
              "Bạn đã được kết nối với nhân viên tư vấn. Vui lòng chờ trong giây lát...",
            type: "Text",
            sender: "System",
            sentAt: new Date().toISOString(),
          },
        ]);
      });

      await newConnection.start();
      setConnection(newConnection);
      console.log("SignalR connected successfully");
    } catch (error) {
      console.error("SignalR connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const createSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/session`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          sessionId: sessionId,
          guestName: !token ? guestName : undefined,
          guestEmail: !token ? guestEmail : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat session");
      }

      const session = await response.json();
      setSessionId(session.sessionId);
      setMessages(session.messages || []);

      // Join SignalR group
      if (connection) {
        await connection.invoke("JoinSession", session.sessionId);
      }

      return session;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      let currentSessionId = sessionId;

      // Create session if not exists
      if (!currentSessionId) {
        const session = await createSession();
        currentSessionId = session.sessionId;
      }

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Add user message to UI immediately with temporary ID
      const tempId = `temp_${Date.now()}`;
      const userMessage = {
        id: tempId,
        content: messageText,
        type: "Text",
        sender: "User",
        sentAt: new Date().toISOString(),
        isTemporary: true,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send typing indicator
      if (connection) {
        await connection.invoke("SendTypingIndicator", currentSessionId, true);
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: messageText,
          sessionId: currentSessionId,
          guestName: !token ? guestName : undefined,
          guestEmail: !token ? guestEmail : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Stop typing indicator
      if (connection) {
        await connection.invoke("SendTypingIndicator", currentSessionId, false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);

      // Remove temporary message and add error message
      setMessages((prev) => {
        const filteredMessages = prev.filter((m) => !m.isTemporary);
        return [
          ...filteredMessages,
          {
            id: Date.now(),
            content:
              "Xin lỗi, có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.",
            type: "Text",
            sender: "System",
            sentAt: new Date().toISOString(),
          },
        ];
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedAction = async (action, data) => {
    switch (action) {
      case "search_phones":
        setInputMessage("Tôi muốn tìm điện thoại");
        break;
      case "search_laptops":
        setInputMessage("Tôi muốn tìm laptop");
        break;
      case "search_headphones":
        setInputMessage("Tôi muốn tìm tai nghe");
        break;
      case "view_promotions":
        setInputMessage("Có khuyến mãi gì không?");
        break;
      case "contact_admin":
        await escalateToAdmin();
        return;
      case "add_to_cart":
        if (data?.productId) {
          // Add to cart logic
          console.log("Add to cart:", data.productId);
        }
        return;
      case "view_product":
        if (data?.productId) {
          window.open(`/products/${data.productId}`, "_blank");
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
      const response = await fetch(
        `${API_BASE_URL}/api/chat/${sessionId}/escalate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "User requested human support",
          }),
        }
      );

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            content: "Đang kết nối bạn với nhân viên tư vấn...",
            type: "Text",
            sender: "System",
            sentAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error escalating to admin:", error);
    }
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return parseInt(payload.sub);
    } catch {
      return null;
    }
  };

  const renderMessage = (message) => {
    const isUser = message.sender === "User";
    const isAI = message.sender === "AI";
    const isSystem = message.sender === "System";

    return (
      <div
        key={message.id}
        className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
            isUser ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          {/* Tech Avatar */}
          <div
            className={`flex-shrink-0 w-8 h-8 border-2 ${
              isUser
                ? "border-black bg-white text-black"
                : isAI
                ? "border-green-600 bg-white text-green-600"
                : "border-yellow-600 bg-white text-yellow-600"
            } flex items-center justify-center font-mono relative`}
          >
            {/* Corner tech elements */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-current opacity-60"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-current opacity-60"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-current opacity-60"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-current opacity-60"></div>

            {isUser ? (
              <User size={14} />
            ) : isAI ? (
              <Bot size={14} />
            ) : (
              <Cpu size={14} />
            )}
          </div>

          {/* Tech Message bubble */}
          <div
            className={`border-2 px-3 py-2 font-mono relative ${
              isUser
                ? "bg-white border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                : isSystem
                ? "bg-white border-yellow-600 text-yellow-600 shadow-[4px_4px_0px_0px_rgba(255,193,7,0.3)]"
                : "bg-white border-green-600 text-green-600 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.3)]"
            }`}
          >
            {/* Tech corner decorations */}
            <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-current opacity-40"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-current opacity-40"></div>

            <div className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
              {message.content}
            </div>

            {/* Tech Product recommendations */}
            {message.metadata?.ProductRecommendations && (
              <div className="mt-3 space-y-2">
                {message.metadata.ProductRecommendations.map(
                  (product, index) => (
                    <div
                      key={index}
                      className="bg-white border border-current rounded p-2 text-xs relative"
                    >
                      {/* Tech grid background */}
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                          backgroundSize: "8px 8px",
                        }}
                      ></div>

                      <div className="flex items-center justify-between relative">
                        <div>
                          <div className="font-bold text-black text-xs font-mono tracking-wider">
                            [{product.name}]
                          </div>
                          <div className="text-current opacity-80 text-xs font-mono">
                            {product.brand} | {product.category}
                          </div>
                          <div className="text-current font-bold text-sm font-mono mt-1">
                            {product.discountPrice ? (
                              <>
                                {(product.discountPrice || 0).toLocaleString()}D
                                <span className="line-through opacity-60 ml-1 text-xs">
                                  {(product.price || 0).toLocaleString()}D
                                </span>
                              </>
                            ) : (
                              `${(product.price || 0).toLocaleString()}D`
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleSuggestedAction("view_product", {
                              productId: product.productId,
                            })
                          }
                          className="text-current hover:text-black border border-current hover:bg-current hover:bg-opacity-20 p-1 transition-all duration-200"
                        >
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Tech Suggested actions */}
            {message.suggestedActions &&
              message.suggestedActions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestedActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleSuggestedAction(action.action, action.data)
                      }
                      className="text-xs bg-white border border-current text-current px-2 py-1 hover:bg-current hover:bg-opacity-20 transition-all duration-200 font-mono tracking-wider"
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              )}

            <div
              className={`text-xs mt-2 font-mono opacity-60 ${
                isUser ? "text-black" : "text-current"
              }`}
            >
              [{formatVietnamTime(message.sentAt)}]
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tech Guest name prompt
  if (
    isOpen &&
    !sessionId &&
    showNamePrompt &&
    !localStorage.getItem("token")
  ) {
    return (
      <div className="fixed bottom-6 right-6 w-80 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] z-[9999] font-mono">
        {/* Tech corner indicators */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-black"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-black"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-black"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-black"></div>

        {/* Tech grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div className="relative p-6">
          {/* Tech Header */}

          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-white text-black border-2 border-black px-3 py-1 font-bold hover:bg-black hover:text-white transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              X ĐÓNG
            </button>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-black mb-2 tracking-wider">
              CHAT
            </h3>
            <div className="h-1 bg-black w-32 mx-auto"></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black mb-2 tracking-wider">
                TÊN NGƯỜI DÙNG
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                className="w-full px-4 py-3 bg-white border-2 border-black text-black font-mono focus:outline-none focus:border-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-2 tracking-wider">
                EMAIL
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Email của bạn..."
                className="w-full px-4 py-3 bg-white border-2 border-black text-black font-mono focus:outline-none focus:border-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && guestName.trim()) {
                    setShowNamePrompt(false);
                    createSession();
                  }
                }}
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => {
                if (guestName.trim()) {
                  setShowNamePrompt(false);
                  createSession();
                }
              }}
              disabled={!guestName.trim()}
              className="flex-1 bg-white text-black border-2 border-black px-4 py-3 font-bold hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] tracking-wider"
            >
              BẮT ĐẦU CHAT
            </button>
            <button
              onClick={() => {
                setGuestName("KHÁCH");
                setShowNamePrompt(false);
                createSession();
              }}
              className="flex-1 bg-black text-white border-2 border-black px-4 py-3 font-bold hover:bg-white hover:text-black transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] tracking-wider"
            >
              BỎ QUA
            </button>
          </div>

          {/* System Stats Footer */}
          <div className="mt-6 pt-4 border-t-2 border-black border-opacity-20">
            <div className="flex justify-between items-center text-xs text-black opacity-60 font-mono">
              <div className="flex space-x-4">
                <span>STATUS: INIT</span>
                <span>VERSION: 2.1.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>SYSTEM.ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tech Chat Widget
  return (
    <>
      {/* Tech Chat button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-white border-2 border-black text-black font-mono relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-105"
          >
            {/* Tech corner indicators */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-black"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-black"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-black"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-black"></div>

            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                backgroundSize: "8px 8px",
              }}
            ></div>

            <div className="relative flex flex-col items-center justify-center">
              <Terminal size={20} />
              <div className="text-xs mt-1 tracking-wider">CHAT</div>
            </div>

            {/* Pulse indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-black animate-pulse"></div>
          </button>
        </div>
      )}

      {/* Tech Chat window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)] z-[9999] transition-all duration-300 flex flex-col font-mono ${
            isMinimized ? "w-80 h-16" : "w-80 h-[500px]"
          } max-h-[80vh]`}
        >
          {/* Tech Header */}
          <div className="bg-white border-b-2 border-black text-black p-4 flex items-center justify-between flex-shrink-0 relative">
            {/* Corner tech elements */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-black"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-black"></div>

            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                backgroundSize: "16px 16px",
              }}
            ></div>

            <div className="flex items-center space-x-3 relative">
              <div className="flex items-center space-x-2">
                <Terminal size={16} />
                <div>
                  <div className="font-bold text-sm tracking-wider">
                    SHNGEAR.AI
                  </div>
                  <div className="text-xs text-green-600 flex items-center space-x-1">
                    <Wifi size={10} />
                    <span>
                      {isConnecting
                        ? "ĐANG KẾT NỐI..."
                        : "ONLINE • PHẢN HỒI NGAY"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 relative">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="bg-white text-black border border-black px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-all duration-200"
              >
                {isMinimized ? "+" : "-"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-white text-black border border-black px-2 py-1 text-xs font-bold hover:bg-black hover:text-white transition-all duration-200"
              >
                X
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Tech Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 bg-white min-h-0 relative">
                {/* Tech grid background */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                ></div>

                {messages.length === 0 && (
                  <div className="text-center text-black text-sm mt-8 relative">
                    <div className="border border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] relative">
                      {/* Corner decorations */}
                      <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-black"></div>
                      <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-black"></div>

                      <Terminal
                        size={32}
                        className="mx-auto mb-3 text-green-600"
                      />
                      <p className="font-mono tracking-wider">
                        XIN CHÀO! TÔI CÓ THỂ GIÚP GÌ CHO BẠN?
                      </p>

                      <div className="mt-4 text-xs text-black opacity-60">
                        [[ SYSTEM READY ]]
                      </div>
                    </div>
                  </div>
                )}

                {messages.map(renderMessage)}

                {isTyping && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm mb-2 font-mono">
                    <div className="flex items-center space-x-2 border border-green-600 bg-white px-3 py-2">
                      <Terminal size={14} />
                      <span className="text-xs tracking-wider">
                        AI ĐANG SOẠN...
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-green-600 animate-pulse"></div>
                        <div
                          className="w-1 h-1 bg-green-600 animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-green-600 animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Tech Input Panel */}
              <div className="p-4 border-t-2 border-black bg-white flex-shrink-0 relative">
                {/* Grid background */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                    backgroundSize: "16px 16px",
                  }}
                ></div>

                <div className="flex items-center space-x-2 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="NHẬP TIN NHẮN..."
                    className="flex-1 px-4 py-3 bg-white border-2 border-black text-black font-mono focus:outline-none focus:border-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] placeholder-black placeholder-opacity-60"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-white text-black border-2 border-black px-4 py-3 font-bold hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>

                {/* Tech Quick actions */}
                {messages.length === 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 relative">
                    <button
                      onClick={() => handleSuggestedAction("search_phones")}
                      className="text-xs bg-white border border-black text-black px-3 py-1 hover:bg-black hover:text-white transition-all duration-200 font-mono tracking-wider"
                    >
                      [ĐIỆN THOẠI]
                    </button>
                    <button
                      onClick={() => handleSuggestedAction("search_laptops")}
                      className="text-xs bg-white border border-black text-black px-3 py-1 hover:bg-black hover:text-white transition-all duration-200 font-mono tracking-wider"
                    >
                      [LAPTOP]
                    </button>
                    <button
                      onClick={() => handleSuggestedAction("view_promotions")}
                      className="text-xs bg-white border border-black text-black px-3 py-1 hover:bg-black hover:text-white transition-all duration-200 font-mono tracking-wider"
                    >
                      [KHUYẾN MÃI]
                    </button>
                  </div>
                )}

                {/* Tech Footer */}
                <div className="mt-3 pt-2 border-t border-black border-opacity-20 relative">
                  <div className="flex justify-between items-center text-xs text-black opacity-60 font-mono">
                    <div className="flex items-center space-x-2">
                      <span>POWERED BY SHN GEAR.AI</span>
                    </div>
                    <div className="flex space-x-2">
                      <span>V2.1.0</span>
                      <span>•</span>
                      <span>ONLINE</span>
                    </div>
                  </div>
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
