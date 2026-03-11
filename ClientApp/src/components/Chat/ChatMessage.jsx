import React from "react";
import { Box, Typography } from "@mui/material";
import { SupportAgent } from "@mui/icons-material";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  // Ensure string is parsed as UTC (backend stores UTC but may omit 'Z')
  const utcStr = dateStr.endsWith("Z") ? dateStr : dateStr + "Z";
  const d = new Date(utcStr);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const ChatMessage = ({ message }) => {
  const isAdmin = message.isFromAdmin;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isAdmin ? "flex-start" : "flex-end",
        mb: 1,
        px: 1,
      }}
    >
      {isAdmin && (
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 1,
            flexShrink: 0,
            mt: "2px",
          }}
        >
          <SupportAgent sx={{ fontSize: 16, color: "white" }} />
        </Box>
      )}
      <Box sx={{ maxWidth: "75%" }}>
        <Box
          sx={{
            bgcolor: isAdmin ? "grey.100" : "primary.main",
            color: isAdmin ? "text.primary" : "white",
            borderRadius: isAdmin ? "0 12px 12px 12px" : "12px 0 12px 12px",
            px: 1.5,
            py: 1,
            wordBreak: "break-word",
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
            {message.content}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: "text.disabled", mt: 0.25, display: "block", textAlign: isAdmin ? "left" : "right" }}
        >
          {formatTime(message.sentAt)}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;
