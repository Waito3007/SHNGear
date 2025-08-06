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
  // Add custom styles for tech animations
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      @keyframes pulse-tech {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.05); }
      }
      @keyframes scan-line {
        0% { transform: translateX(-100%); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
      }
      @keyframes glow-border {
        0%, 100% { box-shadow: 0 0 5px rgba(0,0,0,0.1); }
        50% { box-shadow: 0 0 20px rgba(0,0,0,0.3), 0 0 30px rgba(0,0,0,0.1); }
      }
      .tech-grid {
        background-image: 
          linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
        background-size: 20px 20px;
      }
      .scan-line-effect::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(0,0,0,0.8), transparent);
        animation: scan-line 3s infinite;
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
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
      {/* Tech-Style Main Container */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-900 transform hover:scale-[1.01] transition-all duration-500 relative tech-grid">
        {/* Animated corner indicators */}
        <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-black"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-black"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-black"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-black"></div>
        {/* Tech Header */}
        <div className="relative p-8 overflow-hidden border-b-2 border-gray-900 bg-gradient-to-r from-gray-50 via-white to-gray-50 scan-line-effect">
          {/* Circuit pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "60px 60px",
              }}
            ></div>
          </div>

          <div className="relative flex justify-between items-center">
            {" "}
            <div className="flex items-center space-x-4">
              {/* Tech status indicator */}
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-black"></div>
                <div className="text-xs font-mono text-black mt-1">
                  TRỰC TUYẾN
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded border border-black">
                    HỒ SƠ NGƯỜI DÙNG
                  </span>
                  <span className="text-xs font-mono text-gray-600">
                    v2.1.0
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-black mb-2 font-mono tracking-wider">
                  THÔNG TIN CÁ NHÂN
                </h1>
                <div className="flex space-x-1">
                  <div className="w-8 h-1 bg-black rounded-full"></div>
                  <div className="w-4 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-1 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>{" "}
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleOpenModal}
              sx={{
                bgcolor: "#000000",
                color: "#ffffff",
                fontWeight: "bold",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "1px",
                border: "2px solid #000000",
                borderRadius: "8px",
                "&:hover": {
                  bgcolor: "#333333",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 20px -10px rgba(0,0,0,0.5)",
                },
                transition: "all 0.3s ease",
              }}
            >
              CHỈNH SỬA
            </Button>
          </div>
        </div>{" "}
        {/* Tech Content Grid */}
        <div className="p-8 grid lg:grid-cols-3 gap-8">
          {/* Avatar Section - Tech Style */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-black p-6 transform hover:translateY(-5px) transition-all duration-500 relative overflow-hidden">
              {/* Tech overlay pattern */}
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-gray-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-gray-300"></div>

              <div className="flex flex-col items-center relative z-10">
                <div className="relative">
                  {/* Tech frame around avatar */}
                  <div className="absolute -inset-4 border-2 border-dashed border-gray-400 rounded-full animate-pulse"></div>
                  <Avatar
                    sx={{
                      width: 140,
                      height: 140,
                      bgcolor: "#f8f9fa",
                      fontSize: "3.5rem",
                      border: "4px solid #000000",
                      boxShadow:
                        "0 0 20px rgba(0,0,0,0.2), inset 0 0 20px rgba(0,0,0,0.1)",
                    }}
                  >
                    <User className="w-20 h-20 text-black" />
                  </Avatar>
                  {/* Status LED */}
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-black shadow-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                  </div>
                </div>{" "}
                <Typography
                  variant="h5"
                  className="font-bold mt-6 mb-2 font-mono text-black"
                >
                  {user.fullName || "NGƯỜI DÙNG CHƯA XÁC ĐỊNH"}
                </Typography>
                {/* Tech role badge */}
                <div
                  className={`px-4 py-2 rounded-lg font-mono text-sm font-bold border-2 transform hover:scale-105 transition-all duration-300 ${
                    user.role?.name?.toLowerCase().includes("vip")
                      ? "bg-yellow-100 text-black border-yellow-500 shadow-lg shadow-yellow-200"
                      : user.role?.name?.toLowerCase().includes("admin")
                      ? "bg-purple-100 text-black border-purple-500 shadow-lg shadow-purple-200"
                      : "bg-gray-100 text-black border-gray-500"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {user.role?.name?.toLowerCase().includes("vip") && (
                      <span className="text-yellow-600">👑</span>
                    )}
                    {user.role?.name?.toLowerCase().includes("admin") && (
                      <span className="text-purple-600">⚡</span>
                    )}{" "}
                    <span className="uppercase tracking-wider">
                      {user.role?.name || "THÀNH VIÊN"}
                    </span>
                  </div>
                </div>
                {/* Tech stats */}{" "}
                <div className="mt-4 w-full grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-gray-50 border border-gray-300 rounded p-2 text-center">
                    <div className="text-black font-bold">MÃ SỐ</div>
                    <div className="text-gray-600">{user.id || "####"}</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 rounded p-2 text-center">
                    <div className="text-black font-bold">TRẠNG THÁI</div>
                    <div className="text-green-600">HOẠT ĐỘNG</div>
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* Info Section - Tech Console Style */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border-2 border-black transform hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
            {/* Tech header */}
            <div className="mb-6 border-b-2 border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div
                    className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-red-500 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>{" "}
                  <h2 className="text-xl font-bold text-black font-mono tracking-wider ml-4">
                    BẢNG ĐIỀU KHIỂN DỮ LIỆU
                  </h2>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-gray-500">
                  <span>CẬP NHẬT CUỐI:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="mt-2 flex space-x-1">
                <div className="h-1 w-16 bg-black rounded-full"></div>
                <div className="h-1 w-8 bg-gray-400 rounded-full"></div>
                <div className="h-1 w-4 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            {/* Tech data grid */}{" "}
            <div className="grid gap-4">
              <TechInfoField
                icon="👤"
                label="HỌ VÀ TÊN"
                value={user.fullName}
              />
              <TechInfoField
                icon="📧"
                label="ĐỊA CHỈ EMAIL"
                value={user.email}
              />
              <TechInfoField
                icon="📱"
                label="SỐ ĐIỆN THOẠI"
                value={user.phoneNumber || "CHƯA CÓ"}
              />
              <TechInfoField
                icon="⚧"
                label="GIỚI TÍNH"
                value={user.gender || "CHƯA XÁC ĐỊNH"}
              />
              <TechInfoField
                icon="🎂"
                label="NGÀY SINH"
                value={
                  user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                    : "CHƯA THIẾT LẬP"
                }
              />
            </div>
            {/* Tech footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center text-xs font-mono text-gray-500">
              {" "}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>HỆ THỐNG SẴN SÀNG</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>DỮ LIỆU ĐỒNG BỘ</span>
                </div>
              </div>
              <div>© 2025 SHN GEAR</div>
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Tech Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
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
            maxWidth: "36rem",
            bgcolor: "background.paper",
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            border: "2px solid #000000",
            outline: "none",
            overflow: "hidden",
          }}
        >
          {/* Tech Modal Header */}
          <div className="relative p-6 bg-gray-50 border-b-2 border-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>{" "}
                <Typography
                  id="modal-title"
                  variant="h6"
                  className="font-bold font-mono text-black ml-4"
                >
                  CHỈNH SỬA DỮ LIỆU NGƯỜI DÙNG
                </Typography>
              </div>
              <div className="text-xs font-mono text-gray-500">v1.0.0</div>
            </div>
          </div>

          <div className="p-6 bg-white">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {" "}
              <div className="space-y-4">
                <TechTextField
                  fullWidth
                  label="HỌ VÀ TÊN"
                  name="fullName"
                  value={updatedUser?.fullName || ""}
                  onChange={handleInputChange}
                />
                <TechTextField
                  fullWidth
                  label="ĐỊA CHỈ EMAIL"
                  name="email"
                  value={updatedUser?.email || ""}
                  onChange={handleInputChange}
                />
                <TechTextField
                  fullWidth
                  label="SỐ ĐIỆN THOẠI"
                  name="phoneNumber"
                  value={updatedUser?.phoneNumber || ""}
                  onChange={handleInputChange}
                />
                <TechTextField
                  fullWidth
                  label="GIỚI TÍNH"
                  name="gender"
                  value={updatedUser?.gender || ""}
                  onChange={handleInputChange}
                  select
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value=""></option>
                  <option value="Nam">NAM</option>
                  <option value="Nữ">NỮ</option>
                  <option value="Khác">KHÁC</option>
                </TechTextField>
                <DatePicker
                  label="NGÀY SINH"
                  value={birthDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TechTextField {...params} fullWidth />
                  )}
                  inputFormat="dd/MM/yyyy"
                />
                {/* Tech Action Buttons */}{" "}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    variant="outlined"
                    onClick={handleCloseModal}
                    sx={{
                      borderColor: "#000000",
                      color: "#000000",
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      "&:hover": {
                        borderColor: "#333333",
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  >
                    HỦY BỎ
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    sx={{
                      bgcolor: "#000000",
                      color: "#ffffff",
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      "&:hover": {
                        bgcolor: "#333333",
                        transform: "translateY(-1px)",
                        boxShadow: "0 8px 16px -6px rgba(0,0,0,0.5)",
                      },
                    }}
                  >
                    LƯU DỮ LIỆU
                  </Button>
                </div>
              </div>
            </LocalizationProvider>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

// Tech Info Field Component
const TechInfoField = ({ icon, label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300 hover:border-black hover:bg-white transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg group relative overflow-hidden">
    {/* Scan line effect */}
    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

    <div className="flex items-start space-x-4">
      <div className="text-xl bg-white p-3 rounded-lg border-2 border-gray-400 group-hover:border-black transition-all duration-300 flex items-center justify-center min-w-[3rem] min-h-[3rem]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
          <Typography
            variant="subtitle2"
            className="text-gray-600 font-mono font-bold uppercase tracking-wider text-xs"
          >
            {label}
          </Typography>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        <Typography
          variant="body1"
          className="font-mono font-semibold text-black leading-relaxed"
          sx={{
            transition: "all 0.3s ease",
            wordBreak: "break-word",
          }}
        >
          {value || "CHƯA CÓ DỮ LIỆU"}
        </Typography>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-col space-y-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);

// Tech TextField Component
const TechTextField = (props) => (
  <TextField
    {...props}
    variant="outlined"
    sx={{
      "& .MuiOutlinedInput-root": {
        fontFamily: "monospace",
        backgroundColor: "rgba(0,0,0,0.02)",
        "&:hover": {
          backgroundColor: "rgba(0,0,0,0.05)",
        },
        "&.Mui-focused": {
          backgroundColor: "white",
        },
        "& fieldset": {
          borderColor: "#000000",
          borderWidth: "2px",
        },
        "&:hover fieldset": {
          borderColor: "#333333",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#000000",
          borderWidth: "2px",
        },
      },
      "& .MuiInputLabel-root": {
        fontFamily: "monospace",
        fontWeight: "bold",
        color: "#666666",
        "&.Mui-focused": {
          color: "#000000",
        },
      },
    }}
  />
);

// Legacy InfoField Component (keeping for backward compatibility)
const InfoField = ({ icon, label, value }) => (
  <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-red-300 hover:bg-red-50/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg group">
    <div className="flex items-start space-x-4">
      <div className="text-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-2 rounded-lg border border-gray-200 group-hover:from-red-100 group-hover:to-red-200 group-hover:border-red-200 transition-all duration-300">
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
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse border border-red-300"></div>
      </div>
    </div>
  </div>
);

export default ProfileInfo;
