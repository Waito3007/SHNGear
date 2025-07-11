import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  User,
  Bot,
  AlertCircle,
  Clock,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

// Import timezone test utilities for debugging
import {
  testTimezoneFormatting,
  compareTimezones,
} from "../../utils/timezoneTest";

// Utility functions for formatting time to Vietnam timezone (UTC+7)
const formatVietnamTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    // Format with Vietnam timezone
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
};

const formatVietnamDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();

    // Convert to Vietnam timezone for comparison
    const vietnamDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const vietnamNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );

    // Check if it's today
    if (vietnamDate.toDateString() === vietnamNow.toDateString()) {
      return formatVietnamTime(dateString);
    }

    // Check if it's yesterday
    const yesterday = new Date(vietnamNow);
    yesterday.setDate(yesterday.getDate() - 1);
    if (vietnamDate.toDateString() === yesterday.toDateString()) {
      return `Hôm qua ${formatVietnamTime(dateString)}`;
    }

    // Format as date with time
    return date.toLocaleDateString("vi-VN", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// Format for session list (shorter format)
const formatSessionTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();

    // Convert to Vietnam timezone
    const vietnamDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const vietnamNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );

    // If today, show only time
    if (vietnamDate.toDateString() === vietnamNow.toDateString()) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
        hour12: false,
      });
    }

    // If this week, show day and time
    const diffTime = vietnamNow - vietnamDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return date.toLocaleDateString("vi-VN", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
        hour12: false,
      });
    }

    // Older than a week, show date
    return date.toLocaleDateString("vi-VN", {
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch (error) {
    console.error("Error formatting session time:", error);
    return "";
  }
};

const AdminChatDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connection, setConnection] = useState(null);
  const [connectionReady, setConnectionReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notification, setNotification] = useState(null);
  const messagesEndRef = useRef(null);
  const selectedSessionRef = useRef(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://localhost:7107";

  useEffect(() => {
    initializeConnection();
    fetchSessions();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => {
      clearInterval(interval);
      // Cleanup SignalR connection
      if (connection) {
        connection.stop().catch(console.error);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup connection when component unmounts
  useEffect(() => {
    return () => {
      if (connection && connection.state !== "Disconnected") {
        connection.stop().catch(console.error);
      }
    };
  }, [connection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ensure connection is ready before using it
  useEffect(() => {
    if (connection && connection.state === "Connected") {
      console.log("🔥 ADMIN: Connection is ready for use");
    }
  }, [connection]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeConnection = async () => {
    try {
      // Cleanup existing connection first
      if (connection) {
        console.log("🔥 ADMIN: Cleaning up existing connection");
        await connection.stop();
        setConnection(null);
        setConnectionReady(false);
      }

      const token = localStorage.getItem("token");

      const newConnection = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/chatHub?access_token=${token}`, {
          skipNegotiation: false,
          accessTokenFactory: () => token,
          headers: {}
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(LogLevel.Information)
        .build();

      // Handle connection errors
      newConnection.onclose((error) => {
        console.log("🔥 ADMIN: SignalR connection closed:", error);
        if (error) {
          console.error("🔥 ADMIN: Connection closed with error:", error);
        }
      });

      newConnection.onreconnecting((error) => {
        console.log("🔥 ADMIN: SignalR reconnecting:", error);
      });

      newConnection.onreconnected((connectionId) => {
        console.log("🔥 ADMIN: SignalR reconnected:", connectionId);
        // Rejoin admin group after reconnection
        newConnection.invoke("JoinAdminGroup").catch(console.error);
        // Rejoin session group if session is selected
        if (selectedSessionRef.current) {
          const sessionIdentifier =
            selectedSessionRef.current.sessionId ||
            selectedSessionRef.current.id;
          newConnection
            .invoke("JoinSession", sessionIdentifier)
            .catch(console.error);
        }
      });

      // Set up event handlers
      newConnection.on("NewMessage", (message) => {
        console.log("🔥 ADMIN: Received new message:", message); // Enhanced debug log
        const currentSession = selectedSessionRef.current;
        console.log("🔥 ADMIN: Current selected session:", currentSession?.id);
        console.log("🔥 ADMIN: Message session ID:", message.chatSessionId);

        // If this message is for the currently selected session, add it to messages
        if (currentSession && message.chatSessionId === currentSession.id) {
          console.log("🔥 ADMIN: Adding message to current session");
          setMessages((prev) => {
            // Check for duplicates
            const messageExists = prev.some((m) => m.id === message.id);
            if (messageExists) {
              console.log("🔥 ADMIN: Message already exists, skipping");
              return prev;
            }
            console.log("🔥 ADMIN: Adding new message to state");
            const newMessages = [...prev, message];
            // Auto-scroll to bottom when new message arrives
            setTimeout(() => {
              const messagesContainer = document.querySelector(
                ".messages-container"
              );
              if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
              }
            }, 100);
            return newMessages;
          });
        } else {
          console.log(
            "🔥 ADMIN: Message not for current session or no session selected"
          );
        }

        // Always show notification for new user messages to admin
        if (message.sender === "User") {
          const senderName = message.senderUser?.fullName || "Guest User";
          const notificationMsg = `New message from ${senderName}: ${message.content.substring(
            0,
            50
          )}${message.content.length > 50 ? "..." : ""}`;
          console.log("🔥 ADMIN: Showing notification:", notificationMsg);
          showNotification(notificationMsg);
        }

        // Update session list to reflect new activity (but don't fetch if message added to current session)
        if (!currentSession || message.chatSessionId !== currentSession.id) {
          console.log("🔥 ADMIN: Refreshing sessions list");
          fetchSessions();
        }
      });

      newConnection.on("NewChatSession", (session) => {
        // Show notification for new chat session
        showNotification(
          `New chat session from ${
            session.user?.fullName || session.guestName || "Guest"
          }`
        );
        fetchSessions();
      });

      newConnection.on("ChatEscalated", (session) => {
        // Show notification for new escalated chat
        showNotification(
          `New chat escalated from ${
            session.user?.fullName || session.guestName || "Guest"
          }`
        );
        fetchSessions();
      });

      await newConnection.start();
      console.log("🔥 ADMIN: SignalR connection started successfully");

      // Join admin group
      try {
        await newConnection.invoke("JoinAdminGroup");
        console.log("🔥 ADMIN: Successfully joined admin group");
      } catch (joinError) {
        console.error("🔥 ADMIN: Failed to join admin group:", joinError);
        // Continue anyway, might be an auth issue
      }

      setConnection(newConnection);
      setConnectionReady(true);
      console.log("🔥 ADMIN: SignalR setup complete");
    } catch (error) {
      console.error("🔥 ADMIN: SignalR connection failed:", error);
      setConnectionReady(false);
      // Retry connection after 5 seconds
      setTimeout(() => {
        console.log("🔥 ADMIN: Retrying SignalR connection...");
        initializeConnection();
      }, 5000);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found for admin authentication");
        return;
      }

      console.log(
        "Fetching sessions with token:",
        token.substring(0, 20) + "..."
      );

      const response = await fetch(`${API_BASE_URL}/api/chat/admin/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Sessions response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Sessions fetched successfully:", data);
        setSessions(data);
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to fetch sessions:",
          response.status,
          response.statusText,
          errorText
        );
        if (response.status === 401) {
          console.error("Unauthorized - check admin token and role");
        }
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSession = async (session) => {
    console.log("Selecting session:", session);
    setSelectedSession(session);
    selectedSessionRef.current = session; // Update ref for real-time message handling

    try {
      const token = localStorage.getItem("token");
      // Use sessionId or fallback to id
      const sessionIdentifier = session.sessionId || session.id;
      console.log("Fetching messages for session:", sessionIdentifier);

      const response = await fetch(
        `${API_BASE_URL}/api/chat/session/${sessionIdentifier}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Session messages response status:", response.status);

      if (response.ok) {
        const sessionData = await response.json();
        console.log("Session data received:", sessionData);
        console.log("Messages count:", sessionData.messages?.length || 0);
        setMessages(sessionData.messages || []);

        // Join session group for real-time updates
        if (connection && connection.state === "Connected") {
          try {
            await connection.invoke("JoinSession", sessionIdentifier);
            console.log("Joined session group:", sessionIdentifier);
          } catch (joinError) {
            console.error("Failed to join session group:", joinError);
          }
        } else {
          console.warn("Cannot join session group - connection not ready");
        }
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to fetch session messages:",
          response.status,
          response.statusText,
          errorText
        );
      }
    } catch (error) {
      console.error("Error fetching session messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const token = localStorage.getItem("token");
      const sessionIdentifier = selectedSession.sessionId || selectedSession.id;
      const response = await fetch(
        `${API_BASE_URL}/api/chat/${sessionIdentifier}/admin-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: messageText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Don't add message here - let SignalR handle it to avoid duplicates
    } catch (error) {
      console.error("Error sending admin message:", error);
      // Add error handling
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: "Lỗi khi gửi tin nhắn. Vui lòng thử lại.",
          type: "Text",
          sender: "System",
          sentAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const showNotification = (message) => {
    // Fallback notification if browser notifications fail
    try {
      if (
        typeof window !== "undefined" &&
        window.Notification &&
        Notification.permission === "granted"
      ) {
        new Notification("SHN-Gear Chat", {
          body: message,
          icon: "/favicon.ico",
        });
      } else {
        // Fallback to console notification
        console.log("📢 NOTIFICATION:", message);
      }
    } catch (error) {
      console.warn("Browser notification failed:", error);
      console.log("📢 NOTIFICATION (fallback):", message);
    }

    // Always show in-app notification
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  // Debug function to test connection
  const debugConnection = () => {
    console.log("🔍 DEBUG CONNECTION STATUS:");
    console.log("Connection:", connection);
    console.log("Connection state:", connection?.state);
    console.log("Connection ready:", connectionReady);
    console.log("Selected session:", selectedSessionRef.current);

    // Test timezone formatting
    console.log("🕐 TESTING TIMEZONE FORMATTING:");
    testTimezoneFormatting();

    // Test with sample message timestamp
    if (messages.length > 0) {
      const sampleMessage = messages[0];
      console.log("Sample message timestamp:", sampleMessage.sentAt);
      compareTimezones(sampleMessage.sentAt);
    }

    if (connection && connection.state === "Connected") {
      console.log("✅ Connection is active");
      // Test sending a ping to admin group
      connection
        .invoke("JoinAdminGroup")
        .then(() => console.log("✅ Successfully rejoined admin group"))
        .catch((err) => console.error("❌ Failed to rejoin admin group:", err));
    } else {
      console.log("❌ Connection not ready");
    }
  };

  const getSessionStatus = (session) => {
    if (session.status === "Escalated") return "escalated";
    if (session.requiresHumanSupport) return "needs-attention";
    return "active";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "escalated":
        return "text-red-500";
      case "needs-attention":
        return "text-orange-500";
      default:
        return "text-green-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "escalated":
        return <AlertCircle size={16} />;
      case "needs-attention":
        return <Clock size={16} />;
      default:
        return <CheckCircle size={16} />;
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      searchTerm === "" ||
      (session.user?.fullName || session.guestName || "Guest")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || getSessionStatus(session) === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-100 font-medium">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-900 text-gray-100 flex-col md:flex-row">
      {/* Sessions List */}
      <div className="w-full md:w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">
              Chat Dashboard
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={debugConnection}
                className="p-2 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-700 transition-colors"
                title="Debug Connection"
              >
                🔍
              </button>
              <button
                onClick={fetchSessions}
                className="p-2 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-700 transition-colors"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm khách hàng..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="escalated">Đã chuyển</option>
              <option value="needs-attention">Cần chú ý</option>
              <option value="active">Hoạt động</option>
            </select>
          </div>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {isLoading ? (
            <div className="text-center text-gray-400 mt-8">
              <RefreshCw
                size={24}
                className="mx-auto mb-4 text-gray-600 animate-spin"
              />
              <p>Đang tải...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
              <p>Không có cuộc trò chuyện nào</p>
              <button
                onClick={fetchSessions}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                Tải lại
              </button>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const status = getSessionStatus(session);
              const lastMessage =
                session.messages && session.messages.length > 0
                  ? session.messages[session.messages.length - 1]
                  : null;

              return (
                <div
                  key={session.id}
                  onClick={() => selectSession(session)}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                    selectedSession?.id === session.id
                      ? "bg-blue-800 border-blue-600"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <User
                          size={16}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <span className="font-medium text-gray-100 truncate">
                          {session.user?.fullName ||
                            session.guestName ||
                            "Guest"}
                        </span>
                        <div
                          className={`flex items-center space-x-1 ${getStatusColor(
                            status
                          )}`}
                        >
                          {getStatusIcon(status)}
                        </div>
                      </div>

                      {lastMessage && (
                        <p className="text-sm text-gray-400 truncate mt-1">
                          {lastMessage.sender === "AI" && (
                            <Bot size={12} className="inline mr-1" />
                          )}
                          {lastMessage.content}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatSessionTime(session.lastActivityAt)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            session.type === "AI"
                              ? "bg-green-800 text-green-200 border border-green-600"
                              : "bg-blue-800 text-blue-200 border border-blue-600"
                          }`}
                        >
                          {session.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-100">
                    {selectedSession.user?.fullName ||
                      selectedSession.guestName ||
                      "Guest"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {(selectedSession.user?.email ||
                      selectedSession.guestEmail) && (
                      <>
                        Email:{" "}
                        {selectedSession.user?.email ||
                          selectedSession.guestEmail}{" "}
                        •{" "}
                      </>
                    )}
                    Session: {selectedSession.sessionId} • Type:{" "}
                    {selectedSession.type} • Started:{" "}
                    {formatVietnamDate(selectedSession.createdAt)} (UTC+7)
                  </p>
                </div>
                <div
                  className={`flex items-center space-x-2 ${getStatusColor(
                    getSessionStatus(selectedSession)
                  )}`}
                >
                  {getStatusIcon(getSessionStatus(selectedSession))}
                  <span className="text-sm font-medium text-gray-100">
                    {getSessionStatus(selectedSession)
                      .replace("-", " ")
                      .toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <MessageSquare
                      size={48}
                      className="mx-auto mb-4 text-gray-600"
                    />
                    <p>Chưa có tin nhắn nào</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isAdmin = message.sender === "Admin";
                  const isUser = message.sender === "User";
                  const isAI = message.sender === "AI";
                  const isSystem = message.sender === "System";

                  return (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${
                        isAdmin ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${
                          isAdmin ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isAdmin
                              ? "bg-purple-500"
                              : isUser
                              ? "bg-blue-500"
                              : isAI
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        >
                          {isAdmin ? (
                            "👨‍💼"
                          ) : isUser ? (
                            <User size={16} color="white" />
                          ) : isAI ? (
                            <Bot size={16} color="white" />
                          ) : (
                            "🔔"
                          )}
                        </div>

                        {/* Message bubble */}
                        <div
                          className={`rounded-lg px-4 py-3 shadow-lg border ${
                            isAdmin
                              ? "bg-purple-600 text-white border-purple-500"
                              : isUser
                              ? "bg-blue-600 text-white border-blue-500"
                              : isSystem
                              ? "bg-gray-700 text-white border-gray-600"
                              : "bg-green-600 text-white border-green-500"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm font-semibold leading-relaxed">
                            {message.content}
                          </div>

                          {/* AI info */}
                          {message.aiConfidenceScore && (
                            <div
                              className={`text-xs mt-2 font-medium ${
                                isAdmin
                                  ? "text-purple-200"
                                  : isUser
                                  ? "text-blue-200"
                                  : isSystem
                                  ? "text-gray-300"
                                  : "text-green-200"
                              }`}
                            >
                              Confidence:{" "}
                              {(message.aiConfidenceScore * 100).toFixed(0)}%
                              {message.aiIntent &&
                                ` • Intent: ${message.aiIntent}`}
                            </div>
                          )}

                          <div
                            className={`text-xs mt-2 font-medium ${
                              isAdmin
                                ? "text-purple-200"
                                : isUser
                                ? "text-blue-200"
                                : isSystem
                                ? "text-gray-300"
                                : "text-green-200"
                            }`}
                          >
                            {formatVietnamTime(message.sentAt)} (UTC+7)
                            {message.senderUser &&
                              ` • ${message.senderUser.fullName}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-600 disabled:text-gray-400 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-300">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-medium mb-2 text-gray-200">
                Chọn cuộc trò chuyện
              </h3>
              <p className="text-gray-400">
                Chọn một cuộc trò chuyện từ danh sách để bắt đầu hỗ trợ khách
                hàng
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-md shadow-lg z-50 max-w-sm">
          <p className="text-sm">{notification}</p>
        </div>
      )}
    </div>
  );
};

export default AdminChatDashboard;
