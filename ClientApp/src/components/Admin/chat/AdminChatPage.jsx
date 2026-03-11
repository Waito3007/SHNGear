import React, { useEffect, useState } from "react";
import { Badge, Layout, Switch, Typography } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import useAdminChat from "@/hooks/useAdminChat";
import AdminChatSessionList from "./AdminChatSessionList";
import AdminChatWindow from "./AdminChatWindow";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminChatPage = () => {
  const {
    sessions,
    adminUnread,
    activeSessionId,
    activeMessages,
    loadingHistory,
    selectSession,
    sendReply,
    resolveSession,
    loadSessions,
  } = useAdminChat();

  const [showResolved, setShowResolved] = useState(false);

  // Fallback: load sessions via REST if SignalR snapshot hasn't arrived
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessions.length === 0) {
        loadSessions(1, showResolved);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadSessions(1, showResolved);
  }, [showResolved]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  return (
    <Layout style={{ height: "calc(100vh - 64px)", background: "#fff" }}>
      <Sider
        width={300}
        style={{
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sider header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge count={adminUnread} size="small">
              <MessageOutlined style={{ fontSize: 20 }} />
            </Badge>
            <Title level={5} style={{ margin: 0 }}>
              Hộp thư
            </Title>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Đã xong</Text>
            <Switch
              size="small"
              checked={showResolved}
              onChange={setShowResolved}
            />
          </div>
        </div>

        {/* Session list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <AdminChatSessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelect={selectSession}
            showResolved={showResolved}
          />
        </div>
      </Sider>

      <Content style={{ overflow: "hidden" }}>
        <AdminChatWindow
          sessionId={activeSessionId}
          session={activeSession}
          messages={activeMessages}
          loadingHistory={loadingHistory}
          onSendReply={sendReply}
          onResolve={resolveSession}
        />
      </Content>
    </Layout>
  );
};

export default AdminChatPage;
