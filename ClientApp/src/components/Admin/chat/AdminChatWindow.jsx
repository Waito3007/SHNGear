import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Typography, Spin, Empty, Popconfirm } from "antd";
import { CheckCircleOutlined, SendOutlined } from "@ant-design/icons";
import AdminChatMessage from "./AdminChatMessage";

const { Text } = Typography;
const { TextArea } = Input;

const AdminChatWindow = ({ sessionId, messages, session, loadingHistory, onSendReply, onResolve }) => {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !sessionId) return;
    setText("");
    onSendReply(sessionId, trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sessionId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 16 }}>
        <Empty description="Chọn một cuộc trò chuyện để bắt đầu" />
      </div>
    );
  }

  const displayName = session?.userName || session?.guestName || session?.guestEmail || "Khách";
  const isResolved = session?.isResolved;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Chat header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fafafa",
        }}
      >
        <div>
          <Text strong>{displayName}</Text>
          {session?.guestEmail && (
            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
              {session.guestEmail}
            </Text>
          )}
          {isResolved && (
            <Text type="success" style={{ marginLeft: 8, fontSize: 12 }}>
              ✓ Đã giải quyết
            </Text>
          )}
        </div>
        {!isResolved && (
          <Popconfirm
            title="Đánh dấu phiên chat này là đã giải quyết?"
            onConfirm={() => onResolve(sessionId)}
            okText="Xác nhận"
            cancelText="Huỷ"
          >
            <Button icon={<CheckCircleOutlined />} size="small" type="text">
              Giải quyết
            </Button>
          </Popconfirm>
        )}
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        {loadingHistory ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}>
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <Empty description="Chưa có tin nhắn" style={{ paddingTop: 32 }} />
        ) : (
          messages.map((msg) => <AdminChatMessage key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
        }}
      >
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isResolved ? "Phiên chat đã kết thúc" : "Nhập phản hồi... (Enter để gửi)"}
          disabled={isResolved}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!text.trim() || isResolved}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
};

export default AdminChatWindow;
