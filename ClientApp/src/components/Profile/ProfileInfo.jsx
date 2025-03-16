import { useState, useEffect } from "react";
import { Modal, Box, TextField, Button, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import React from "react";

const ProfileInfo = () => {
  const [user, setUser] = useState({ fullName: "", email: "", role: "" });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ fullName: "", email: "" });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 📌 Lấy thông tin user từ API
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token từ localStorage
      const response = await axios.get("https://localhost:7107/api/Auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Dữ liệu api trả về:", response.data);
      setUser(response.data);
      setUpdatedUser({ fullName: response.data.fullName, email: response.data.email });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📌 Hiển thị Modal chỉnh sửa thông tin
  const handleOpenModal = () => {
    setEditMode(true);
    setOpenModal(true);
  };

  // 📌 Đóng Modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // 📌 Cập nhật dữ liệu khi nhập vào TextField
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  // 📌 Gửi API cập nhật thông tin người dùng
  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://localhost:7107/api/Auth/profile",
        { fullName: updatedUser.fullName, email: updatedUser.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(updatedUser);
      handleCloseModal();
      //reload trang
      window.location.reload();
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin user:", error);
    }
  };

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 3 }} />;

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: "6rem 2rem",
        padding: 3,
        boxShadow: 3,
        border: "2px solid black",
        borderRadius: "16px",
        bgcolor: "white",
        textAlign: "center",
      }}
    >
      <Typography variant="h5" fontWeight="bold" mb={2}>Thông tin cá nhân</Typography>
      <Box sx={{ textAlign: "left",border: "2px solid black", padding: "8px 16px", borderRadius: "8px", backgroundColor: "#f5f5f5", mb: 1 }}>
        <Typography variant="subtitle2" color="gray">Họ và tên</Typography>
        <Typography variant="body1">{user.fullName||"Khách Hàng"}</Typography>
      </Box>
      <Box sx={{ textAlign: "left",border: "2px solid black", padding: "8px 16px", borderRadius: "8px", backgroundColor: "#f5f5f5", mb: 1 }}>
        <Typography variant="subtitle2" color="gray">Email</Typography>
        <Typography variant="body1">{user.email}</Typography>
      </Box>
      <Box sx={{ textAlign: "left",border: "2px solid black", padding: "8px 16px", borderRadius: "8px", backgroundColor: "#f5f5f5", mb: 2 }}>
        <Typography variant="subtitle2" color="gray">Hạng Thành Viên</Typography>
        <Typography variant="body1">{user.role}</Typography>
      </Box>
      <Button variant="contained" color="error" fullWidth onClick={handleOpenModal} sx={{ borderRadius: "8px",height:"50px" }}>
        Chỉnh sửa
      </Button>

      {/* Modal Chỉnh Sửa Thông Tin */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: "16px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" textAlign="center" mb={2} fontWeight="bold">Chỉnh sửa thông tin</Typography>
          <TextField fullWidth label="Họ và tên" name="fullName" value={updatedUser.fullName} onChange={handleInputChange} margin="normal" sx={{ borderRadius: "8px" }} />
          <TextField fullWidth label="Email" name="email" value={updatedUser.email} onChange={handleInputChange} margin="normal" sx={{ borderRadius: "8px" }} />
          <Button variant="contained" color="error" fullWidth onClick={handleSaveProfile} sx={{ mt: 2, borderRadius: "8px" }}>
            Lưu thay đổi
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ProfileInfo;
