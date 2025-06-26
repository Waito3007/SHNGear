import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import "./ChatAdmin.css";

const ChatAdmin = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize SignalR connection
  useEffect(() => {
    initializeConnection();
    loadActiveSessions();

    // Refresh sessions every 30 seconds
    const interval = setInterval(loadActiveSessions, 30000);

    return () => {
      clearInterval(interval);
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  const initializeConnection = async () => {
    try {
      console.log("🔄 [ChatAdmin] Initializing SignalR connection...");

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
        console.log("📨 [ChatAdmin] Received message:", message);

        // Only update if it's for the selected session
        if (
          selectedSession &&
          selectedSession.sessionId === getCurrentSessionId(message)
        ) {
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
        }

        // Refresh sessions to update last activity
        loadActiveSessions();
      });

      newConnection.on("Error", (error) => {
        console.error("❌ [ChatAdmin] SignalR error:", error);
        alert(`Lỗi chat: ${error}`);
      });

      newConnection.onreconnecting(() => {
        console.log("🔄 [ChatAdmin] Reconnecting...");
        setIsConnected(false);
      });

      newConnection.onreconnected(() => {
        console.log("✅ [ChatAdmin] Reconnected successfully");
        setIsConnected(true);
        // Rejoin selected session if any
        if (selectedSession) {
          newConnection
            .invoke("JoinChat", selectedSession.sessionId)
            .catch((err) =>
              console.error("❌ [ChatAdmin] Error rejoining chat:", err)
            );
        }
      });

      newConnection.onclose(() => {
        console.log("🔌 [ChatAdmin] Connection closed");
        setIsConnected(false);
      });

      await newConnection.start();
      console.log("✅ [ChatAdmin] SignalR connected successfully");
      setConnection(newConnection);
      setIsConnected(true);
    } catch (error) {
      console.error("❌ [ChatAdmin] SignalR connection failed:", error);
      setIsConnected(false);
    }
  };

  const getCurrentSessionId = (message) => {
    // This would need to be improved based on your message structure
    return selectedSession?.sessionId;
  };

  const loadActiveSessions = async () => {
    try {
      console.log("📥 [ChatAdmin] Loading active sessions...");

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL || ""}/api/chat/active-sessions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(
        "✅ [ChatAdmin] Active sessions loaded:",
        response.data.length
      );
      setActiveSessions(response.data);
    } catch (error) {
      console.error("❌ [ChatAdmin] Error loading sessions:", error);
    }
  };

  const selectSession = async (session) => {
    try {
      console.log("🎯 [ChatAdmin] Selecting session:", session.sessionId);

      // Leave previous session
      if (selectedSession && connection) {
        await connection.invoke("LeaveChat", selectedSession.sessionId);
      }

      setSelectedSession(session);

      // Join new session
      if (connection) {
        await connection.invoke("JoinChat", session.sessionId);
      }

      // Load messages for this session
      await loadMessages(session.sessionId);
    } catch (error) {
      console.error("❌ [ChatAdmin] Error selecting session:", error);
    }
  };

  const loadMessages = async (sessionId) => {
    try {
      console.log("📥 [ChatAdmin] Loading messages for session:", sessionId);

      const response = await axios.get(
        `${
          process.env.REACT_APP_API_BASE_URL || ""
        }/api/chat/session/${sessionId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("✅ [ChatAdmin] Messages loaded:", response.data.length);
      setMessages(
        response.data.map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }))
      );
    } catch (error) {
      console.error("❌ [ChatAdmin] Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !connection || !selectedSession) {
      console.warn("⚠️ [ChatAdmin] Cannot send message: missing data");
      return;
    }

    try {
      console.log("📤 [ChatAdmin] Sending admin message:", newMessage);

      await connection.invoke(
        "SendMessage",
        selectedSession.sessionId,
        newMessage,
        "Nhân viên hỗ trợ"
      );
      setNewMessage("");
      console.log("✅ [ChatAdmin] Admin message sent successfully");
    } catch (error) {
      console.error("❌ [ChatAdmin] Error sending message:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleString("vi-VN");
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
    return `${Math.floor(diffMins / 1440)} ngày trước`;
  };

  return (
    <div className="chat-admin-container">
      <div className="chat-admin-header">
        <h2>💬 Quản lý Chat Hỗ trợ</h2>
        <div className="connection-status">
          {isConnected ? (
            <span className="status-connected">🟢 Đã kết nối</span>
          ) : (
            <span className="status-disconnected">🔴 Mất kết nối</span>
          )}
        </div>
      </div>

      <div className="chat-admin-content">
        {/* Sessions List */}
        <div className="sessions-panel">
          <div className="sessions-header">
            <h3>📋 Phiên chat đang hoạt động ({activeSessions.length})</h3>
            <button onClick={loadActiveSessions} className="refresh-btn">
              🔄 Làm mới
            </button>
          </div>

          <div className="sessions-list">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className={`session-item ${
                  selectedSession?.id === session.id ? "selected" : ""
                }`}
                onClick={() => selectSession(session)}
              >
                <div className="session-info">
                  <div className="session-user">
                    {session.userName ? (
                      <span>👤 {session.userName}</span>
                    ) : (
                      <span>👥 {session.guestName || "Khách vãng lai"}</span>
                    )}
                  </div>
                  <div className="session-subject">
                    📝 {session.subject || "Hỗ trợ chung"}
                  </div>
                  <div className="session-time">
                    ⏰ {getTimeAgo(session.lastActivity)}
                  </div>
                </div>
                <div className="session-status">
                  <span
                    className={`status-badge ${session.status.toLowerCase()}`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            ))}

            {activeSessions.length === 0 && (
              <div className="no-sessions">
                📭 Không có phiên chat nào đang hoạt động
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          {selectedSession ? (
            <>
              <div className="chat-header">
                <div className="chat-info">
                  <h3>
                    {selectedSession.userName
                      ? `👤 ${selectedSession.userName}`
                      : `👥 ${selectedSession.guestName || "Khách vãng lai"}`}
                  </h3>
                  <p>📧 {selectedSession.guestEmail}</p>
                  <p>
                    🕐 Bắt đầu:{" "}
                    {formatTime(new Date(selectedSession.startTime))}
                  </p>
                </div>
              </div>

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
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <div className="input-container">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn hỗ trợ..."
                    className="message-input"
                    rows="3"
                    disabled={!isConnected}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    className="send-button"
                  >
                    📤 Gửi
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-session-selected">
              <h3>🎯 Chọn một phiên chat để bắt đầu</h3>
              <p>
                Chọn phiên chat từ danh sách bên trái để xem tin nhắn và trả lời
                khách hàng.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatAdmin;
