import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./chatBox.css";

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isGuest, setIsGuest] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.name || decoded.unique_name || "User");
        setUserEmail(decoded.email || "");
        setIsGuest(false);
        console.log("🔍 [Chatbox] User authenticated:", {
          name: decoded.name,
          email: decoded.email,
        });
      } catch (error) {
        console.error("❌ [Chatbox] Error decoding token:", error);
        setIsGuest(true);
      }
    } else {
      setIsGuest(true);
      console.log("🔍 [Chatbox] No token found, user is guest");
    }
  }, []);

  // Initialize SignalR connection
  const initializeConnection = async () => {
    try {
      console.log("🔄 [Chatbox] Initializing SignalR connection...");

      const newConnection = new HubConnectionBuilder()
        .withUrl("/chathub", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();

      // Event handlers
      newConnection.on("ReceiveMessage", (message) => {
        console.log("📨 [Chatbox] Received message:", message);
        setMessages((prev) => [
          ...prev,
          {
            id: message.id,
            senderName: message.senderName,
            message: message.message,
            messageType: message.messageType,
            createdAt: new Date(message.createdAt),
            isFromAdmin: message.isFromAdmin,
            isAutoResponse: message.isAutoResponse,
          },
        ]);
      });

      newConnection.on("AdminTyping", (typing) => {
        console.log("⌨️ [Chatbox] Admin typing:", typing);
        setIsTyping(typing);
      });

      newConnection.on("Error", (error) => {
        console.error("❌ [Chatbox] SignalR error:", error);
        alert(`Lỗi chat: ${error}`);
      });

      newConnection.onreconnecting(() => {
        console.log("🔄 [Chatbox] Reconnecting...");
        setIsConnected(false);
      });

      newConnection.onreconnected(() => {
        console.log("✅ [Chatbox] Reconnected successfully");
        setIsConnected(true);
        if (sessionId) {
          newConnection
            .invoke("JoinChat", sessionId)
            .catch((err) =>
              console.error("❌ [Chatbox] Error rejoining chat:", err)
            );
        }
      });

      newConnection.onclose(() => {
        console.log("🔌 [Chatbox] Connection closed");
        setIsConnected(false);
      });

      await newConnection.start();
      console.log("✅ [Chatbox] SignalR connected successfully");
      setConnection(newConnection);
      setIsConnected(true);
    } catch (error) {
      console.error("❌ [Chatbox] SignalR connection failed:", error);
      setIsConnected(false);
    }
  };

  // Start chat session
  const startChatSession = async () => {
    try {
      setIsLoading(true);
      console.log("🚀 [Chatbox] Starting chat session...");

      let requestData = {};

      if (!isGuest) {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        requestData = {
          userId: parseInt(decoded.sub),
          subject: "Hỗ trợ khách hàng",
        };
      } else {
        if (!userName.trim()) {
          alert("Vui lòng nhập tên của bạn");
          return;
        }
        requestData = {
          guestName: userName,
          guestEmail: userEmail,
          subject: "Hỗ trợ khách hàng",
        };
      }

      console.log("📤 [Chatbox] Sending chat session request:", requestData);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || ""}/api/chat/start-session`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
          },
        }
      );

      console.log("✅ [Chatbox] Chat session created:", response.data);
      setSessionId(response.data.sessionId);
      setChatStarted(true);

      // Join SignalR group
      if (connection) {
        await connection.invoke("JoinChat", response.data.sessionId);
        console.log("👥 [Chatbox] Joined chat group:", response.data.sessionId);
      }

      // Load existing messages
      await loadMessages(response.data.sessionId);
    } catch (error) {
      console.error("❌ [Chatbox] Error starting chat session:", error);
      alert("Không thể khởi tạo phiên chat. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Load chat messages
  const loadMessages = async (sid) => {
    try {
      console.log("📥 [Chatbox] Loading messages for session:", sid);

      const response = await axios.get(
        `${
          process.env.REACT_APP_API_BASE_URL || ""
        }/api/chat/session/${sid}/messages`,
        {
          headers: {
            ...(localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
          },
        }
      );

      console.log("✅ [Chatbox] Messages loaded:", response.data);
      setMessages(
        response.data.map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }))
      );
    } catch (error) {
      console.error("❌ [Chatbox] Error loading messages:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !connection || !sessionId) {
      console.warn("⚠️ [Chatbox] Cannot send message: missing data");
      return;
    }

    try {
      console.log("📤 [Chatbox] Sending message:", newMessage);

      await connection.invoke("SendMessage", sessionId, newMessage, userName);
      setNewMessage("");
      console.log("✅ [Chatbox] Message sent successfully");
    } catch (error) {
      console.error("❌ [Chatbox] Error sending message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Open chatbox
  const openChat = async () => {
    console.log("🎪 [Chatbox] Opening chatbox...");
    setIsOpen(true);

    if (!connection) {
      await initializeConnection();
    }
  };

  // Close chatbox
  const closeChat = async () => {
    console.log("🚪 [Chatbox] Closing chatbox...");
    setIsOpen(false);

    if (connection && sessionId) {
      try {
        await connection.invoke("LeaveChat", sessionId);
        console.log("👋 [Chatbox] Left chat group");
      } catch (error) {
        console.error("❌ [Chatbox] Error leaving chat:", error);
      }
    }
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="chat-button" onClick={openChat}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z"
              fill="white"
            />
            <path
              d="M7 9H17V11H7V9ZM7 12H15V14H7V12ZM7 6H17V8H7V6Z"
              fill="white"
            />
          </svg>
          <span className="chat-badge">💬</span>
        </div>
      )}

      {/* Chatbox */}
      {isOpen && (
        <div className="chatbox">
          {/* Header */}
          <div className="chatbox-header">
            <div className="header-info">
              <div className="header-title">💬 Hỗ trợ SHNGear</div>
              <div className="header-status">
                {isConnected ? (
                  <span className="status-online">🟢 Đang kết nối</span>
                ) : (
                  <span className="status-offline">🔴 Mất kết nối</span>
                )}
              </div>
            </div>
            <button className="close-button" onClick={closeChat}>
              ✕
            </button>
          </div>

          {/* Chat Content */}
          <div className="chatbox-content">
            {!chatStarted ? (
              // Start Chat Form
              <div className="start-chat-form">
                <h3>🎯 Bắt đầu trò chuyện</h3>
                <p>
                  Chào mừng bạn đến với SHNGear! Chúng tôi sẵn sàng hỗ trợ bạn.
                </p>

                {isGuest && (
                  <div className="guest-form">
                    <input
                      type="text"
                      placeholder="Tên của bạn *"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="name-input"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email (tùy chọn)"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="email-input"
                    />
                  </div>
                )}

                <button
                  className="start-chat-button"
                  onClick={startChatSession}
                  disabled={isLoading || !isConnected}
                >
                  {isLoading ? "⏳ Đang khởi tạo..." : "🚀 Bắt đầu chat"}
                </button>
              </div>
            ) : (
              // Messages Area
              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${
                      message.isFromAdmin ? "admin" : "user"
                    } ${message.isAutoResponse ? "auto" : ""}`}
                  >
                    <div className="message-header">
                      <span className="sender-name">
                        {message.isAutoResponse
                          ? "🤖"
                          : message.isFromAdmin
                          ? "👨‍💼"
                          : "👤"}
                        {message.senderName}
                      </span>
                      <span className="message-time">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <div className="message-content">{message.message}</div>
                  </div>
                ))}

                {isTyping && (
                  <div className="typing-indicator">
                    <span>👨‍💼 Nhân viên đang nhập...</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {chatStarted && (
            <div className="chatbox-input">
              <div className="input-container">
                <textarea
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="message-input"
                  rows="1"
                  disabled={!isConnected}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  className="send-button"
                >
                  📤
                </button>
              </div>
              <div className="input-hint">
                Nhấn Enter để gửi, Shift+Enter để xuống dòng
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbox;
