import React from "react";
import { Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  // Ensure string is parsed as UTC (backend stores UTC but may omit 'Z')
  const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
  return dayjs(utcStr).format("HH:mm");
};

const AdminChatMessage = ({ message }) => {
  const isAdmin = message.isFromAdmin;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isAdmin ? "flex-end" : "flex-start",
        marginBottom: 8,
        padding: "0 12px",
      }}
    >
      <div style={{ maxWidth: "70%" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isAdmin ? "flex-end" : "flex-start",
          }}
        >
          <Text type="secondary" style={{ fontSize: 11, marginBottom: 2 }}>
            {message.senderName}
          </Text>
          <div
            style={{
              backgroundColor: isAdmin ? "#1677ff" : "#f0f0f0",
              color: isAdmin ? "#fff" : "#000",
              borderRadius: isAdmin ? "12px 0 12px 12px" : "0 12px 12px 12px",
              padding: "8px 12px",
              wordBreak: "break-word",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {message.content}
          </div>
          <Text type="secondary" style={{ fontSize: 11, marginTop: 2 }}>
            {formatTime(message.sentAt)}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default AdminChatMessage;
