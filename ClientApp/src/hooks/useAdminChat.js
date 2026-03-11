import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSignalR } from "@/contexts/SignalRContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://localhost:7107";

const adminApi = axios.create({ baseURL: API_BASE });
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const useAdminChat = () => {
  const { connectionRef, isConnected } = useSignalR();
  const [sessions, setSessions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [adminUnread, setAdminUnread] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const handlersRegistered = useRef(false);

  // Register hub handlers
  useEffect(() => {
    const conn = connectionRef.current;
    if (!conn || handlersRegistered.current) return;

    conn.on("SessionsSnapshot", (data) => {
      setSessions(data?.items || []);
      setTotalCount(data?.totalCount || 0);
      setAdminUnread(data?.unreadTotal || 0);
    });

    conn.on("SessionCreated", (session) => {
      setSessions((prev) => [session, ...prev]);
      setAdminUnread((c) => c + 1);
    });

    conn.on("ReceiveMessage", (msg) => {
      // Update session list: bump lastMessage + unread
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== msg.sessionId) return s;
          const isUnread = !msg.isFromAdmin;
          return {
            ...s,
            lastMessage: msg.content,
            lastMessageAt: msg.sentAt,
            unreadCount: isUnread
              ? (s.unreadCount || 0) + (activeSessionId === s.id ? 0 : 1)
              : s.unreadCount,
          };
        })
      );

      // If this message belongs to the active session, append to messages
      setActiveSessionId((currentActive) => {
        if (currentActive === msg.sessionId) {
          setActiveMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        return currentActive;
      });

      // Increase global unread if message is from user and not in active session
      if (!msg.isFromAdmin) {
        setActiveSessionId((currentActive) => {
          if (currentActive !== msg.sessionId) {
            setAdminUnread((c) => c + 1);
          }
          return currentActive;
        });
      }
    });

    conn.on("SessionResolved", (sessionId) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, isResolved: true } : s))
      );
    });

    conn.on("MessagesRead", (sessionId) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, unreadCount: 0 } : s))
      );
      setActiveMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    });

    handlersRegistered.current = true;
  }, [connectionRef, isConnected, activeSessionId]);

  const selectSession = useCallback(
    async (sessionId) => {
      setActiveSessionId(sessionId);
      setLoadingHistory(true);
      try {
        const res = await adminApi.get(`/api/chat/sessions/${sessionId}`);
        setActiveMessages(res.data?.messages || []);
        // Mark messages read
        connectionRef.current?.invoke("MarkRead", sessionId).catch(console.error);
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, unreadCount: 0 } : s))
        );
        // Recalculate global unread
        setAdminUnread((prev) => {
          const session = sessions.find((s) => s.id === sessionId);
          return Math.max(0, prev - (session?.unreadCount || 0));
        });
      } catch (err) {
        console.error("[AdminChat] Failed to load session history:", err);
      } finally {
        setLoadingHistory(false);
      }
    },
    [connectionRef, sessions]
  );

  const sendReply = useCallback(
    async (sessionId, content) => {
      if (!content?.trim()) return;
      try {
        await connectionRef.current?.invoke("SendAdminReply", sessionId, { content });
      } catch (err) {
        console.error("[AdminChat] SendAdminReply error:", err);
      }
    },
    [connectionRef]
  );

  const resolveSession = useCallback(
    async (sessionId) => {
      try {
        await connectionRef.current?.invoke("ResolveSession", sessionId);
      } catch (err) {
        console.error("[AdminChat] ResolveSession error:", err);
      }
    },
    [connectionRef]
  );

  const loadSessions = useCallback(
    async (page = 1, resolved = false) => {
      try {
        const res = await adminApi.get(`/api/chat/sessions`, {
          params: { page, pageSize: 50, resolved },
        });
        setSessions(res.data?.items || []);
        setTotalCount(res.data?.totalCount || 0);
        setAdminUnread(res.data?.unreadTotal || 0);
      } catch (err) {
        console.error("[AdminChat] Failed to load sessions:", err);
      }
    },
    []
  );

  return {
    sessions,
    totalCount,
    adminUnread,
    activeSessionId,
    activeMessages,
    loadingHistory,
    selectSession,
    sendReply,
    resolveSession,
    loadSessions,
  };
};

export default useAdminChat;
