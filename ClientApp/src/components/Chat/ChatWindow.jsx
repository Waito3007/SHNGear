import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Close, Send, SupportAgent } from "@mui/icons-material";
import { useChat } from "@/contexts/ChatContext";
import ChatMessage from "./ChatMessage";

const ChatWindow = ({ onClose }) => {
  const { messages, currentSession, sendMessage, isInitialized } = useChat();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 90,
        right: 24,
        width: 360,
        height: 480,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1300,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <SupportAgent />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Hỗ trợ khách hàng
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            {currentSession?.isResolved ? "Đã giải quyết" : "Đang hoạt động"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          py: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        {!isInitialized ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: "center", pt: 6, px: 3 }}>
            <SupportAgent sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Xin chào! Chúng tôi sẵn sàng hỗ trợ bạn.
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ px: 1.5, py: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <InputBase
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentSession?.isResolved ? "Phiên chat đã kết thúc" : "Nhập tin nhắn..."}
          disabled={currentSession?.isResolved}
          multiline
          maxRows={3}
          sx={{ flex: 1, fontSize: 14 }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!text.trim() || currentSession?.isResolved}
          size="small"
        >
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatWindow;
