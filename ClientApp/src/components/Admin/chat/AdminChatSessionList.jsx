import React from "react";
import { Badge, List, Tag, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text } = Typography;

const AdminChatSessionList = ({ sessions, activeSessionId, onSelect, showResolved }) => {
  const filtered = showResolved
    ? sessions.filter((s) => s.isResolved)
    : sessions.filter((s) => !s.isResolved);

  return (
    <List
      dataSource={filtered}
      locale={{ emptyText: showResolved ? "Không có phiên đã giải quyết" : "Chưa có cuộc trò chuyện nào" }}
      renderItem={(session) => {
        const isActive = session.id === activeSessionId;
        const displayName = session.userName || session.guestName || session.guestEmail || "Khách";

        return (
          <List.Item
            onClick={() => onSelect(session.id)}
            style={{
              cursor: "pointer",
              padding: "12px 16px",
              backgroundColor: isActive ? "#e6f4ff" : "transparent",
              borderLeft: isActive ? "3px solid #1677ff" : "3px solid transparent",
              transition: "background-color 0.15s",
            }}
          >
            <List.Item.Meta
              avatar={
                <Badge count={session.unreadCount} size="small" offset={[-2, 2]}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#1677ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 18,
                    }}
                  >
                    <UserOutlined />
                  </div>
                </Badge>
              }
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Text strong={!session.isResolved} ellipsis style={{ maxWidth: 140 }}>
                    {displayName}
                  </Text>
                  {session.isResolved && <Tag color="default" style={{ margin: 0 }}>Đã xong</Tag>}
                  {!session.userId && <Tag color="blue" style={{ margin: 0 }}>Khách</Tag>}
                </div>
              }
              description={
                <div>
                  <Text type="secondary" ellipsis style={{ fontSize: 12, display: "block" }}>
                    {session.lastMessage || "Chưa có tin nhắn"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(session.lastMessageAt.endsWith("Z") ? session.lastMessageAt : session.lastMessageAt + "Z").fromNow()}
                  </Text>
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};

export default AdminChatSessionList;
