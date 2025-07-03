import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import {
  Modal,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Avatar,
  Alert,
  Box,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import EditIcon from "@mui/icons-material/Edit";
import { useUserProfile } from "@/hooks/api/useUserProfile";

const ProfileInfo = () => {
  // Đã khai báo openModal ở dưới, xóa dòng này để tránh trùng lặp
  const [updatedUser, setUpdatedUser] = useState({
    fullName: "",
    email: "",
    role: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
  });
  // Đã khai báo birthDate ở dưới, xóa dòng này để tránh trùng lặp
  // Đã khai báo snackbar ở dưới, xóa dòng này để tránh trùng lặp

  const {
    user,
    setUser,
    loading,
    error,
    userId,
    setUserId,
    initUserId,
    fetchUserProfile,
    updateUserProfile,
  } = useUserProfile();
  const [openModal, setOpenModal] = useState(false);
  // Đã khai báo updatedUser ở dưới, xóa dòng này để tránh trùng lặp
  // Đã khai báo userId ở dưới, xóa dòng này để tránh trùng lặp
  const [birthDate, setBirthDate] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Add custom styles for VIP animations
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      .animate-spin-slow {
        animation: spin 3s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const id = initUserId();
    if (id) {
      setUserId(id);
      fetchUserProfile(id).then((data) => {
        setUpdatedUser(data);
        if (data?.dateOfBirth) setBirthDate(new Date(data.dateOfBirth));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetchUserProfile đã được chuyển vào hook

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newValue) => {
    setBirthDate(newValue);
    setUpdatedUser((prev) => ({
      ...prev,
      dateOfBirth: newValue ? newValue.toISOString().split("T")[0] : "",
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(updatedUser);
      showSnackbar("Cập nhật thông tin thành công", "success");
      handleCloseModal();
    } catch (error) {
      console.error("Failed to update profile:", error);
      showSnackbar(
        error?.response?.data?.message || "Cập nhật thất bại",
        "error"
      );
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>

      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform hover:scale-[1.01] transition-all duration-300">
        {/* Premium Header with Gradient */}
        <div
          className="relative p-8 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #cb1c22 0%, #8B0000 100%)",
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white opacity-10 rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full"></div>
          </div>

          <div className="relative flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Thông tin cá nhân
              </h1>
              <div className="w-20 h-1 bg-white opacity-50 rounded-full"></div>
            </div>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleOpenModal}
              sx={{
                bgcolor: "rgba(255,255,255,0.95)",
                color: "#cb1c22",
                fontWeight: "bold",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  bgcolor: "#fff",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 20px -10px rgba(0,0,0,0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Content with Premium Styling */}
        <div className="p-8 grid md:grid-cols-3 gap-8">
          {/* Avatar Section with Enhanced Design */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg transform hover:translateY(-5px) transition-all duration-300">
              <div className="relative">
                <Avatar
                  sx={{
                    width: 140,
                    height: 140,
                    bgcolor: "#f8f9fa",
                    fontSize: "3.5rem",
                    border: "4px solid white",
                    boxShadow: "0 8px 16px -4px rgba(203,28,34,0.2)",
                  }}
                >
                  <User className="w-20 h-20 text-gray-700" />
                </Avatar>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
              </div>{" "}
              <Typography variant="h5" className="font-bold mt-4 mb-1">
                {user.fullName || "Khách hàng"}
              </Typography>{" "}
              <Typography
                variant="body2"
                className={`px-4 py-1.5 rounded-full font-semibold text-sm ${
                  user.role?.name?.toLowerCase().includes("vip")
                    ? "bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 shadow-lg shadow-yellow-400/30"
                    : user.role?.name?.toLowerCase().includes("admin")
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-gray-100 text-gray-600"
                } transform hover:scale-105 transition-all duration-300`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {user.role?.name?.toLowerCase().includes("vip") && (
                  <span className="text-amber-800">👑</span>
                )}
                {user.role?.name?.toLowerCase().includes("admin") && (
                  <span className="text-purple-200">⚡</span>
                )}
                <span
                  className={
                    user.role?.name?.toLowerCase().includes("vip") ||
                    user.role?.name?.toLowerCase().includes("admin")
                      ? "font-bold uppercase tracking-wide"
                      : ""
                  }
                >
                  {user.role?.name || "Thành viên"}
                </span>
              </Typography>
            </div>
          </div>{" "}
          {/* Info Section with Premium Design */}
          <div className="md:col-span-2 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 border border-gray-100 transform hover:shadow-2xl transition-all duration-300">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-lg mr-3">
                  ℹ️
                </span>
                Chi tiết thông tin
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
            </div>
            <div className="grid gap-6">
              <InfoField icon="👤" label="Họ và tên" value={user.fullName} />
              <InfoField icon="📧" label="Email" value={user.email} />
              <InfoField
                icon="📱"
                label="Số điện thoại"
                value={user.phoneNumber || "Chưa cập nhật"}
              />
              <InfoField
                icon="⚧"
                label="Giới tính"
                value={user.gender || "Chưa cập nhật"}
              />
              <InfoField
                icon="🎂"
                label="Ngày sinh"
                value={
                  user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(8px)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            maxWidth: "32rem",
            bgcolor: "background.paper",
            borderRadius: "16px",
            boxShadow: "0 24px 48px -12px rgba(0,0,0,0.18)",
            p: 4,
            border: "1px solid",
            borderColor: "divider",
            outline: "none",
          }}
        >
          {/* Modal Header */}
          <div className="relative mb-6 pb-6 border-b border-gray-200">
            <Typography
              id="modal-title"
              variant="h5"
              className="font-bold text-center"
              sx={{
                color: "#cb1c22",
                position: "relative",
              }}
            >
              Chỉnh sửa thông tin
            </Typography>
          </div>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="space-y-4">
              <TextField
                fullWidth
                label="Họ và tên"
                name="fullName"
                value={updatedUser?.fullName || ""}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#cb1c22",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#cb1c22",
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                value={updatedUser?.email || ""}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#cb1c22",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#cb1c22",
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Số điện thoại"
                name="phoneNumber"
                value={updatedUser?.phoneNumber || ""}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#cb1c22",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#cb1c22",
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Giới tính"
                name="gender"
                value={updatedUser?.gender || ""}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                select
                SelectProps={{
                  native: true,
                  sx: {
                    "&:focus": {
                      backgroundColor: "transparent",
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#cb1c22",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#cb1c22",
                    },
                  },
                }}
              >
                <option value=""></option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </TextField>

              <DatePicker
                label="Ngày sinh"
                value={birthDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#cb1c22",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#cb1c22",
                        },
                      },
                    }}
                  />
                )}
                inputFormat="dd/MM/yyyy"
              />

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  variant="outlined"
                  onClick={handleCloseModal}
                  sx={{
                    borderColor: "rgba(0, 0, 0, 0.2)",
                    color: "rgb(107, 114, 128)",
                    "&:hover": {
                      borderColor: "rgb(107, 114, 128)",
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  sx={{
                    bgcolor: "#cb1c22",
                    color: "white",
                    boxShadow: "0 4px 10px -3px rgba(203,28,34,0.5)",
                    "&:hover": {
                      bgcolor: "#e62128",
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 15px -3px rgba(203,28,34,0.5)",
                    },
                  }}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </LocalizationProvider>
        </Box>
      </Modal>
    </div>
  );
};

// Reusable Info Field Component
const InfoField = ({ icon, label, value }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md group">
    <div className="flex items-start space-x-4">
      <div className="text-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-2 rounded-lg group-hover:from-red-100 group-hover:to-red-200 transition-all duration-300">
        {icon}
      </div>
      <div className="flex-1">
        <Typography
          variant="subtitle2"
          className="text-gray-500 font-medium mb-2 uppercase tracking-wide text-xs"
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          className="font-semibold text-gray-800 leading-relaxed"
          sx={{
            transition: "all 0.3s ease",
            "&:hover": {
              color: "#cb1c22",
            },
          }}
        >
          {value || "Chưa cập nhật"}
        </Typography>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default ProfileInfo;
