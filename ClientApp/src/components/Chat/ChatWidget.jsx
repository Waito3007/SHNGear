import React, { useState } from "react";
import { Badge, Fab, Tooltip } from "@mui/material";
import { Chat, Close } from "@mui/icons-material";
import { useChat } from "@/contexts/ChatContext";
import { jwtDecode } from "jwt-decode";
import GuestInfoModal from "./GuestInfoModal";
import ChatWindow from "./ChatWindow";

const ChatWidget = () => {
  const { isOpen, unreadCount, isInitialized, currentSession, openChat, closeChat } = useChat();
  const [showGuestModal, setShowGuestModal] = useState(false);

  const isLoggedIn = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      const decoded = jwtDecode(token);
      return decoded && decoded.sub;
    } catch {
      return false;
    }
  };

  const handleFabClick = () => {
    if (isOpen) {
      closeChat();
      return;
    }

    // If connected user has session, just open window
    if (isLoggedIn() && isInitialized) {
      openChat();
      return;
    }

    // For guest: check if we already have a session
    if (!isLoggedIn() && currentSession) {
      openChat();
      return;
    }

    // Guest without session: show info modal
    if (!isLoggedIn()) {
      setShowGuestModal(true);
      return;
    }

    openChat();
  };

  const handleGuestModalClose = () => {
    setShowGuestModal(false);
  };

  const handleGuestModalSuccess = () => {
    setShowGuestModal(false);
    openChat();
  };

  return (
    <>
      <Tooltip title="Chat hỗ trợ" placement="left">
        <Fab
          color="primary"
          onClick={handleFabClick}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1299,
            boxShadow: 4,
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {isOpen ? <Close /> : <Chat />}
          </Badge>
        </Fab>
      </Tooltip>

      {isOpen && <ChatWindow onClose={closeChat} />}

      {showGuestModal && (
        <GuestInfoModal
          open={showGuestModal}
          onClose={handleGuestModalClose}
          onSuccess={handleGuestModalSuccess}
        />
      )}
    </>
  );
};

export default ChatWidget;
