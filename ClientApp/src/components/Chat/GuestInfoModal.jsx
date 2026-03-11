import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { ChatBubbleOutline } from "@mui/icons-material";
import { useChat } from "@/contexts/ChatContext";

const GuestInfoModal = ({ open, onClose, onSuccess }) => {
  const { startGuestSession } = useChat();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { guestName: "", guestEmail: "" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await startGuestSession(data.guestName, data.guestEmail);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ChatBubbleOutline color="primary" />
        <span>Bắt đầu trò chuyện</span>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Vui lòng nhập thông tin để chúng tôi hỗ trợ bạn tốt hơn.
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="guestName"
            control={control}
            rules={{ required: "Vui lòng nhập tên của bạn" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Họ và tên"
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                error={!!errors.guestName}
                helperText={errors.guestName?.message}
              />
            )}
          />
          <Controller
            name="guestEmail"
            control={control}
            rules={{
              required: "Vui lòng nhập email",
              pattern: {
                value: /^[^@]+@[^@]+\.[^@]+$/,
                message: "Email không hợp lệ",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                size="small"
                sx={{ mb: 3 }}
                error={!!errors.guestEmail}
                helperText={errors.guestEmail?.message}
              />
            )}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? "Đang kết nối..." : "Bắt đầu chat"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GuestInfoModal;
