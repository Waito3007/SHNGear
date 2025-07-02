import { useState, useEffect, useCallback, useRef } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

/**
 * Hook for managing chat functionality
 */
export const useChat = (isAdmin = false) => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://localhost:7107";

  const initializeConnection = useCallback(async () => {
    if (isConnecting || connection) return;

    try {
      setIsConnecting(true);
      setError(null);

      const token = localStorage.getItem("token");
      const hubUrl = isAdmin
        ? `${API_BASE_URL}/chathub?isAdmin=true`
        : `${API_BASE_URL}/chathub`;

      const newConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token,
          transport: 1, // WebSockets
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      newConnection.on("ReceiveMessage", (sessionId, message) => {
        setMessages((prev) => [...prev, { ...message, sessionId }]);
      });

      newConnection.on("UserJoined", (sessionId, userName) => {
        console.log(`User ${userName} joined session ${sessionId}`);
      });

      newConnection.on("UserLeft", (sessionId, userName) => {
        console.log(`User ${userName} left session ${sessionId}`);
      });

      newConnection.on("SessionCreated", (newSessionId) => {
        setSessionId(newSessionId);
      });

      if (isAdmin) {
        newConnection.on("NewSession", (session) => {
          // Handle new session notification for admin
          console.log("New chat session created:", session);
        });

        newConnection.on("SessionEnded", (sessionId) => {
          console.log("Session ended:", sessionId);
        });
      }

      // Start connection
      await newConnection.start();

      setConnection(newConnection);
      setIsConnected(true);
      console.log("Chat connection established");
    } catch (err) {
      console.error("Error connecting to chat:", err);
      setError("Failed to connect to chat");
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, connection, isAdmin, API_BASE_URL]);

  const sendMessage = useCallback(
    async (messageText, targetSessionId = null) => {
      if (!connection || !isConnected || !messageText.trim()) return;

      try {
        const currentSessionId = targetSessionId || sessionId;

        if (isAdmin && targetSessionId) {
          await connection.invoke(
            "SendMessageToSession",
            targetSessionId,
            messageText
          );
        } else {
          await connection.invoke("SendMessage", currentSessionId, messageText);
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
      }
    },
    [connection, isConnected, sessionId, isAdmin]
  );

  const joinSession = useCallback(
    async (sessionIdToJoin) => {
      if (!connection || !isConnected) return;

      try {
        await connection.invoke("JoinSession", sessionIdToJoin);
        setSessionId(sessionIdToJoin);
      } catch (err) {
        console.error("Error joining session:", err);
        setError("Failed to join session");
      }
    },
    [connection, isConnected]
  );

  const leaveSession = useCallback(async () => {
    if (!connection || !isConnected || !sessionId) return;

    try {
      await connection.invoke("LeaveSession", sessionId);
      setSessionId(null);
      setMessages([]);
    } catch (err) {
      console.error("Error leaving session:", err);
      setError("Failed to leave session");
    }
  }, [connection, isConnected, sessionId]);

  const endSession = useCallback(
    async (sessionIdToEnd = sessionId) => {
      if (!connection || !isConnected || !sessionIdToEnd) return;

      try {
        await connection.invoke("EndSession", sessionIdToEnd);
        if (sessionIdToEnd === sessionId) {
          setSessionId(null);
          setMessages([]);
        }
      } catch (err) {
        console.error("Error ending session:", err);
        setError("Failed to end session");
      }
    },
    [connection, isConnected, sessionId]
  );

  const disconnect = useCallback(async () => {
    if (connection) {
      try {
        await connection.stop();
        setConnection(null);
        setIsConnected(false);
        setMessages([]);
        setSessionId(null);
      } catch (err) {
        console.error("Error disconnecting:", err);
      }
    }
  }, [connection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connection && connection.state !== "Disconnected") {
        connection.stop().catch(console.error);
      }
    };
  }, [connection]);

  return {
    connection,
    messages,
    isConnected,
    isConnecting,
    error,
    sessionId,
    initializeConnection,
    sendMessage,
    joinSession,
    leaveSession,
    endSession,
    disconnect,
    setError,
  };
};

/**
 * Hook for admin chat sessions management
 */
export const useAdminChatSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "https://localhost:7107";

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/chat/admin/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }

      const data = await response.json();
      setSessions(data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const getSessionMessages = useCallback(
    async (sessionId) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/chat/admin/sessions/${sessionId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (err) {
        console.error("Error fetching session messages:", err);
        throw err;
      }
    },
    [API_BASE_URL]
  );

  const updateSessionStatus = useCallback(
    async (sessionId, status) => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/chat/admin/sessions/${sessionId}/status`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to update session status: ${response.status}`
          );
        }

        // Update local state
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId ? { ...session, status } : session
          )
        );
      } catch (err) {
        console.error("Error updating session status:", err);
        throw err;
      }
    },
    [API_BASE_URL]
  );

  useEffect(() => {
    fetchSessions();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    getSessionMessages,
    updateSessionStatus,
  };
};

/**
 * Hook for chat message formatting and utilities
 */
export const useChatUtils = () => {
  const formatTime = useCallback((timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
        hour12: false,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "";
    }
  }, []);

  const formatDate = useCallback((timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  }, []);

  const isToday = useCallback((timestamp) => {
    try {
      const messageDate = new Date(timestamp);
      const today = new Date();
      return messageDate.toDateString() === today.toDateString();
    } catch (error) {
      return false;
    }
  }, []);

  const groupMessagesByDate = useCallback(
    (messages) => {
      const grouped = {};

      messages.forEach((message) => {
        const date = formatDate(message.timestamp);
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(message);
      });

      return grouped;
    },
    [formatDate]
  );

  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  return {
    formatTime,
    formatDate,
    isToday,
    groupMessagesByDate,
    generateSessionId,
  };
};

/**
 * Hook for chat typing indicators
 */
export const useTypingIndicator = (connection, sessionId) => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Set up typing event listeners
  useEffect(() => {
    if (!connection) return;

    const handleUserTyping = (userId, userName, sessionId) => {
      setTypingUsers((prev) => {
        const existing = prev.find((user) => user.userId === userId);
        if (!existing) {
          return [...prev, { userId, userName, sessionId }];
        }
        return prev;
      });

      // Remove typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((user) => user.userId !== userId));
      }, 3000);
    };

    const handleUserStoppedTyping = (userId) => {
      setTypingUsers((prev) => prev.filter((user) => user.userId !== userId));
    };

    connection.on("UserTyping", handleUserTyping);
    connection.on("UserStoppedTyping", handleUserStoppedTyping);

    return () => {
      connection.off("UserTyping", handleUserTyping);
      connection.off("UserStoppedTyping", handleUserStoppedTyping);
    };
  }, [connection]);

  const startTyping = useCallback(() => {
    if (!connection || !sessionId) return;

    if (!isTyping) {
      setIsTyping(true);
      connection.invoke("StartTyping", sessionId).catch(console.error);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }, [connection, sessionId, isTyping]);

  const stopTyping = useCallback(() => {
    if (!connection || !sessionId || !isTyping) return;

    setIsTyping(false);
    connection.invoke("StopTyping", sessionId).catch(console.error);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [connection, sessionId, isTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers: typingUsers.filter((user) => user.sessionId === sessionId),
    startTyping,
    stopTyping,
  };
};
