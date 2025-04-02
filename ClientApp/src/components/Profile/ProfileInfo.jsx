import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { 
  Modal, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
    Snackbar,
  Avatar,
  Alert 
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import EditIcon from '@mui/icons-material/Edit';
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const ProfileInfo = () => {
  const [user, setUser] = useState({ 
    fullName: "", 
    email: "", 
    role: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ ...user });
  const [userId, setUserId] = useState(null);
  const [birthDate, setBirthDate] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = parseInt(decoded.sub, 10);
        if (!Number.isInteger(id)) return;
        setUserId(id);
        fetchUserProfile(id);
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
    }
  }, []);

  const fetchUserProfile = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUser(response.data);
      setUpdatedUser(response.data);
      if (response.data.dateOfBirth) {
        setBirthDate(new Date(response.data.dateOfBirth));
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newValue) => {
    setBirthDate(newValue);
    setUpdatedUser(prev => ({
      ...prev,
      dateOfBirth: newValue ? newValue.toISOString().split('T')[0] : ""
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/profile`,
        updatedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(response.data.user);
      showSnackbar("Cập nhật thông tin thành công", "success");
      handleCloseModal();
    } catch (error) {
      console.error("Failed to update profile:", error);
      showSnackbar(error.response?.data?.message || "Cập nhật thất bại", "error");
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
      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-ưhite p-6 text-black">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={handleOpenModal}
              className="bg-black text-purple-600 hover:bg-gray-100 shadow-md"
            >
              Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* Avatar Section */}
          <div className="md:col-span-1 flex flex-col items-center">
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120,
                bgcolor: 'white',
                fontSize: '3rem'
              }}
              className="border-4 border-white shadow-lg mb-4"
            >
    <User className="w-24 h-24 text-black" />
            </Avatar>
            <Typography variant="h6" className="font-semibold">
              {user.fullName || "Khách hàng"}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {user.role?.name || "Thành viên"}
            </Typography>
          </div>

          {/* Info Section */}
          <div className="md:col-span-2 space-y-4">
            <InfoField label="Họ và tên" value={user.fullName} />
            <InfoField label="Email" value={user.email} />
            <InfoField label="Số điện thoại" value={user.phoneNumber || "Chưa cập nhật"} />
            <InfoField label="Giới tính" value={user.gender || "Chưa cập nhật"} />
            <InfoField 
              label="Ngày sinh" 
              value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : "Chưa cập nhật"} 
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl p-6 outline-none">
          <Typography variant="h6" className="font-bold text-center mb-4 text-purple-600">
            Chỉnh sửa thông tin
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="space-y-4">
              <TextField
                fullWidth
                label="Họ và tên"
                name="fullName"
                value={updatedUser.fullName}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
              />
              
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={updatedUser.email}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
              />
              
              <TextField
                fullWidth
                label="Số điện thoại"
                name="phoneNumber"
                value={updatedUser.phoneNumber}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
              />
              
              <TextField
                fullWidth
                label="Giới tính"
                name="gender"
                value={updatedUser.gender}
                onChange={handleInputChange}
                variant="outlined"
                size="small"
                select
                SelectProps={{ native: true }}
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
                  />
                )}
                inputFormat="dd/MM/yyyy"
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outlined" 
                  onClick={handleCloseModal}
                  className="border-gray-300 text-gray-600 hover:border-gray-400"
                >
                  Hủy
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSaveProfile}
                  className="bg-purple-600 hover:bg-purple-700 shadow-md"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </LocalizationProvider>
        </div>
      </Modal>
    </div>
  );
};

// Reusable Info Field Component
const InfoField = ({ label, value }) => (
  <div className="border-b border-gray-100 pb-3">
    <Typography variant="subtitle2" className="text-gray-500 font-medium">
      {label}
    </Typography>
    <Typography variant="body1" className="font-semibold">
      {value}
    </Typography>
  </div>
);

export default ProfileInfo;