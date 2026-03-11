import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSignalR } from "./SignalRContext";

const ChatContext = createContext(null);

const GUEST_SESSION_KEY = "chat_guest_sessionId";

export const ChatProvider = ({ children }) => {
  const { connectionRef, isConnected } = useSignalR();
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [guestInfo, setGuestInfo] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const handlersRegistered = useRef(false);

  // Register hub event handlers once connection is available
  useEffect(() => {
    const conn = connectionRef.current;
    if (!conn || handlersRegistered.current) return;

    conn.on("ChatInitialized", (history) => {
      setCurrentSession(history?.session || null);
      setMessages(history?.messages || []);
      setIsInitialized(true);
    });

    conn.on("ReceiveMessage", (msg) => {
      // Only handle messages for current session
      setCurrentSession((prev) => {
        if (!prev || msg.sessionId !== prev.id) return prev;
        return prev;
      });
      setMessages((prev) => {
        // Deduplicate by id
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Increment unread only when window is closed and message is from admin
      if (msg.isFromAdmin) {
        setIsOpen((open) => {
          if (!open) setUnreadCount((c) => c + 1);
          return open;
        });
      }
    });

    conn.on("MessagesRead", (_sessionId) => {
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    });

    conn.on("SessionResolved", (_sessionId) => {
      setCurrentSession((prev) => prev ? { ...prev, isResolved: true } : prev);
    });

    conn.on("Error", (msg) => {
      console.warn("[Chat] Hub error:", msg);
    });

    handlersRegistered.current = true;
  }, [connectionRef, isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-rejoin guest session on reconnect
  useEffect(() => {
    if (!isConnected) return;
    const savedSessionId = sessionStorage.getItem(GUEST_SESSION_KEY);
    if (savedSessionId && !isInitialized) {
      connectionRef.current
        ?.invoke("RejoinGuestSession", parseInt(savedSessionId))
        .catch(console.error);
    }
  }, [isConnected, isInitialized, connectionRef]);

  const startGuestSession = useCallback(
    async (guestName, guestEmail) => {
      setGuestInfo({ guestName, guestEmail });
      try {
        await connectionRef.current?.invoke("StartGuestSession", { guestName, guestEmail });
      } catch (err) {
        console.error("[Chat] StartGuestSession error:", err);
      }
    },
    [connectionRef]
  );

  // Persist guest sessionId when session is set
  useEffect(() => {
    if (currentSession?.id && !currentSession?.userId) {
      sessionStorage.setItem(GUEST_SESSION_KEY, String(currentSession.id));
    }
  }, [currentSession]);

  const sendMessage = useCallback(
    async (content) => {
      if (!content?.trim()) return;
      try {
        await connectionRef.current?.invoke("SendMessage", { content });
      } catch (err) {
        console.error("[Chat] SendMessage error:", err);
      }
    },
    [connectionRef]
  );

  const markRead = useCallback(
    async (sessionId) => {
      try {
        await connectionRef.current?.invoke("MarkRead", sessionId);
        setUnreadCount(0);
      } catch (err) {
        console.error("[Chat] MarkRead error:", err);
      }
    },
    [connectionRef]
  );

  const openChat = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
    if (currentSession?.id) {
      markRead(currentSession.id);
    }
  }, [currentSession, markRead]);

  const closeChat = useCallback(() => setIsOpen(false), []);

  return (
    <ChatContext.Provider
      value={{
        currentSession,
        messages,
        isOpen,
        unreadCount,
        guestInfo,
        isInitialized,
        startGuestSession,
        sendMessage,
        markRead,
        openChat,
        closeChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
