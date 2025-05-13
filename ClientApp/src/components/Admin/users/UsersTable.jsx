import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Search,
  PlusCircle,
  Pencil,
  Trash2,
  Users,
  // User, // Có thể không cần nếu CircleUserRound là default
  ShieldCheck,
  Sparkles,
  Star,
  Award,
  Crown,
  CircleUserRound,
  FilterX,
} from "lucide-react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Pagination,
  Grid,
} from "@mui/material";
import { message } from "antd"; // Đảm bảo đã cài đặt antd và import CSS của nó

import RoleDrawer from "./RoleDrawer"; // Điều chỉnh đường dẫn nếu cần
import UpdateUserDrawer from "./UpdateUserDrawer"; // Điều chỉnh đường dẫn nếu cần
import useDebounce from "utils/useDebounce"; // Điều chỉnh đường dẫn nếu cần

// Hàm lấy icon cho avatar dựa trên vai trò
const getRoleBasedAvatar = (roleName, isActive) => {
  const iconProps = {
    size: 22,
    className: "text-white",
    strokeWidth: isActive ? 2 : 1.5,
  };
  const normalizedRoleName = roleName?.toLowerCase();

  switch (normalizedRoleName) {
    case "admin":
      return <ShieldCheck {...iconProps} />;
    case "vip0":
      return <Sparkles {...iconProps} />;
    case "vip1":
      return <Star {...iconProps} />;
    case "vip2":
      return <Award {...iconProps} />;
    case "vip3":
      return <Crown {...iconProps} />;
    default:
      return <CircleUserRound {...iconProps} />;
  }
};

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleUpdateModalOpen, setIsRoleUpdateModalOpen] = useState(false);
  const [roleForSelectedUser, setRoleForSelectedUser] = useState("");
  const [updateDrawerVisible, setUpdateDrawerVisible] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    roleId: "",
  });
  const [roleDrawerVisible, setRoleDrawerVisible] = useState(false);

  // State cho Phân trang và Bộ lọc mới
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/roles`),
        ]);
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        const errorMessage = err.response?.data?.message || err.message || "Không thể tải dữ liệu.";
        setError(errorMessage);
        message.error(`Lỗi tải dữ liệu: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    let tempUsers = [...users];
    const term = debouncedSearchTerm.toLowerCase();
    if (term) {
      tempUsers = tempUsers.filter(
        (user) =>
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    }
    if (roleFilter !== "All") {
      tempUsers = tempUsers.filter(user => user.roleId === roleFilter);
    }
    if (statusFilter !== "All") {
      const isActiveFilter = statusFilter === "Active";
      tempUsers = tempUsers.filter(user => user.isActive === isActiveFilter);
    }
    return tempUsers;
  }, [users, debouncedSearchTerm, roleFilter, statusFilter]);

  const currentUsers = useMemo(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  }, [filteredUsers, currentPage, usersPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredUsers.length / usersPerPage);
  }, [filteredUsers.length, usersPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, roleFilter, statusFilter, usersPerPage]);

  const handleSearchChange = useCallback((e) => setSearchInput(e.target.value), []);
  const handleRoleFilterChange = useCallback((event) => setRoleFilter(event.target.value), []);
  const handleStatusFilterChange = useCallback((event) => setStatusFilter(event.target.value), []);
  const handlePageChange = useCallback((event, newPage) => setCurrentPage(newPage), []);
  const handleUsersPerPageChange = useCallback((event) => {
    setUsersPerPage(parseInt(event.target.value, 10));
  }, []);
  const handleResetFilters = useCallback(() => {
    setSearchInput("");
    setRoleFilter("All");
    setStatusFilter("All");
    // usersPerPage có thể giữ nguyên hoặc reset về giá trị mặc định nếu muốn
    // setCurrentPage(1); // Đã được xử lý bởi useEffect theo dõi các state filter
    message.info("Đã xóa tất cả bộ lọc.");

}, [setSearchInput, setRoleFilter, setStatusFilter]); // Các setter là stable, có thể dùng mảng rỗng []
  const handleOpenRoleUpdateModal = useCallback((user) => {
    if (!user.isActive && user.roleId !== roles.find(r => r.name.toLowerCase() === 'admin')?.id) { // Admin có thể được sửa role ngay cả khi inactive
        message.warning("Không thể cập nhật vai trò cho người dùng không hoạt động (trừ Admin).");
        // return; // Bỏ comment nếu muốn chặn hoàn toàn
    }
    setSelectedUser(user);
    setRoleForSelectedUser(user.roleId);
    setIsRoleUpdateModalOpen(true);
  }, [roles]);

  const handleCloseRoleUpdateModal = useCallback(() => {
    setIsRoleUpdateModalOpen(false);
    setSelectedUser(null);
    setRoleForSelectedUser("");
  }, []);

  const handleUpdateUserRole = useCallback(async () => {
    if (selectedUser && roleForSelectedUser) {
      try {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/users/${selectedUser.id}/role`,
          { roleId: roleForSelectedUser }
        );
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id
              ? { ...user, roleId: roleForSelectedUser }
              : user
          )
        );
        message.success(`Vai trò của ${selectedUser.fullName} đã được cập nhật!`);
        handleCloseRoleUpdateModal();
      } catch (err) {
        console.error("Error updating user role:", err);
        message.error(`Lỗi cập nhật vai trò: ${err.response?.data?.message || err.message}`);
      }
    }
  }, [selectedUser, roleForSelectedUser, handleCloseRoleUpdateModal]);

  const handleOpenUpdateDrawer = useCallback((user) => {
    setSelectedUser(user);
    setUpdateDrawerVisible(true);
  }, []);

  const handleCloseUpdateDrawer = useCallback(() => {
    setUpdateDrawerVisible(false);
    setSelectedUser(null);
  }, []);

  const handleUserUpdated = useCallback((updatedUserData) => {
    setUsers(prevUsers => prevUsers.map(user => user.id === updatedUserData.id ? { ...user, ...updatedUserData } : user));
    message.success(`Thông tin người dùng ${updatedUserData.fullName} đã được cập nhật!`);
  }, []);

  const handleOpenAddUserModal = useCallback(() => {
    setNewUser({ fullName: "", email: "", phoneNumber: "", password: "", roleId: "" });
    setIsAddUserModalOpen(true);
  }, []);

  const handleCloseAddUserModal = useCallback(() => {
    setIsAddUserModalOpen(false);
  }, []);

  const handleNewUserInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAddNewUser = useCallback(async () => {
    if (!newUser.fullName || !newUser.email || !newUser.phoneNumber || !newUser.password || !newUser.roleId) {
      message.warning("Vui lòng điền đầy đủ thông tin người dùng.");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/users`,
        newUser
      );
      setUsers((prevUsers) => [response.data, ...prevUsers]);
      message.success("Người dùng mới đã được thêm thành công!");
      handleCloseAddUserModal();
    } catch (err) {
      console.error("Lỗi khi thêm người dùng mới:", err);
      message.error(`Lỗi thêm người dùng: ${err.response?.data?.message || err.message}`);
    }
  }, [newUser, handleCloseAddUserModal]);

  const handleOpenRoleDrawer = useCallback(() => setRoleDrawerVisible(true), []);
  const handleCloseRoleDrawer = useCallback(() => setRoleDrawerVisible(false), []);

  const handleDeleteUser = useCallback(async (userId, userName) => {
    message.info(`Chức năng xóa người dùng ID: ${userId} (${userName}) đang được phát triển.`);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)', color: 'white', flexDirection: 'column' }}>
        <CircularProgress color="inherit" size={50} />
        <Typography sx={{ mt: 2, fontSize: '1.1rem' }}>Đang tải danh sách người dùng...</Typography>
      </Box>
    );
  }

  if (error && users.length === 0) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)', color: 'white', flexDirection: 'column', p:3 }}>
            <Alert severity="error" sx={{width: '100%', maxWidth: '600px', '.MuiAlert-message': {fontSize: '1rem'}}}>
                Lỗi tải dữ liệu: {error}. Vui lòng thử lại sau.
            </Alert>
        </Box>
    );
  }

  return (
    <motion.div
      className='bg-gray-800 bg-opacity-70 backdrop-blur-xl shadow-2xl rounded-xl p-4 md:p-6 border border-gray-700 min-h-[calc(100vh-120px)] flex flex-col'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <div className='flex flex-wrap justify-between items-center mb-6 gap-4'>
        <h2 className='text-2xl font-bold text-gray-100 tracking-tight'>Quản lý Người Dùng</h2>
        <div className='flex flex-wrap gap-3'>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlusCircle size={18} />}
            onClick={handleOpenAddUserModal}
            sx={{ bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, textTransform: 'none', fontWeight: 'medium', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
          >
            Thêm người dùng
          </Button>
          <Button
            variant="outlined"
            startIcon={<Users size={18} />}
            onClick={handleOpenRoleDrawer}
            sx={{ color: '#A5B4FC', borderColor: '#4F46E5', '&:hover': { borderColor: '#A5B4FC', bgcolor: 'rgba(79, 70, 229, 0.1)'}, textTransform: 'none', fontWeight: 'medium'  }}
          >
            Quản lý Role
          </Button>
        </div>
      </div>

      <Grid container spacing={{xs: 1.5, md: 2}} alignItems="flex-end" sx={{ mb: 3 }}>
        <Grid item xs={12} md={4} lg={4}>
          <TextField
            label="Tìm kiếm"
            placeholder='Tên hoặc email...'
            value={searchInput}
            onChange={handleSearchChange}
            variant="outlined"
            fullWidth
            InputLabelProps={{ sx: { color: '#9CA3AF', '&.Mui-focused': {color: '#A5B4FC'} } }}
            InputProps={{
              startAdornment: <Search className='text-gray-400 mr-2' size={20} />,
              sx: { borderRadius: '8px', bgcolor: 'rgba(30,41,59,0.7)', input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#A5B4FC', borderWidth: '2px'} }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel sx={{color: '#9CA3AF', '&.Mui-focused': {color: '#A5B4FC'}}}>Vai trò</InputLabel>
            <Select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              label="Vai trò"
              sx={{color: roleFilter === "All" ? '#9CA3AF' : 'white', borderRadius:'8px', bgcolor: 'rgba(30,41,59,0.7)', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#A5B4FC', borderWidth: '2px'}, '& .MuiSvgIcon-root': { color: '#9CA3AF' }}}
              MenuProps={{ PaperProps: { sx: { bgcolor: '#1F2937', color: 'white', borderRadius: '8px', border:'1px solid #374151' }}}}
            >
              <MenuItem value="All" sx={{color: '#9CA3AF', fontStyle:'italic'}}><em>Tất cả vai trò</em></MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id} sx={{ '&:hover': { bgcolor: '#374151'}, '&.Mui-selected': {bgcolor: '#4F46E5!important', fontWeight:'bold'}, '&.Mui-selected:hover':{bgcolor: '#4338CA!important'} }}>{role.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
           <FormControl fullWidth variant="outlined">
            <InputLabel sx={{color: '#9CA3AF', '&.Mui-focused': {color: '#A5B4FC'}}}>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Trạng thái"
              sx={{color: statusFilter === "All" ? '#9CA3AF' : 'white', borderRadius:'8px', bgcolor: 'rgba(30,41,59,0.7)', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#A5B4FC', borderWidth: '2px'}, '& .MuiSvgIcon-root': { color: '#9CA3AF' }}}
              MenuProps={{ PaperProps: { sx: { bgcolor: '#1F2937', color: 'white', borderRadius: '8px', border:'1px solid #374151' }}}}
            >
              <MenuItem value="All" sx={{color: '#9CA3AF', fontStyle:'italic'}}><em>Tất cả trạng thái</em></MenuItem>
              <MenuItem value="Active" sx={{ '&:hover': { bgcolor: '#374151'}, '&.Mui-selected': {bgcolor: 'rgba(16, 185, 129, 0.3)!important', color: '#10B981', fontWeight:'bold'}, '&.Mui-selected:hover':{bgcolor: 'rgba(5, 150, 105, 0.4)!important'} }}>Hoạt động</MenuItem>
              <MenuItem value="Inactive" sx={{ '&:hover': { bgcolor: '#374151'}, '&.Mui-selected': {bgcolor: 'rgba(239, 68, 68, 0.3)!important', color: '#EF4444', fontWeight:'bold'}, '&.Mui-selected:hover':{bgcolor: 'rgba(220, 38, 38, 0.4)!important'} }}>Vô hiệu</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md="auto"> {/* Nút Xóa bộ lọc - tự động co chiều rộng */}
        <Button
            variant="text"
            startIcon={<FilterX size={18} />}
            onClick={handleResetFilters}
            sx={{ 
                color: '#CBD5E1', // text-slate-300
                textTransform: 'none', 
                fontWeight: 'medium',
                padding: {xs: '6px 12px', md:'8px 16px'}, // Điều chỉnh padding cho hợp lý
                height: {md: '56px'}, // Căn chiều cao với TextField và Select
                '&:hover': { bgcolor: 'rgba(79, 70, 229, 0.15)'} 
            }}
        >
            Xóa lọc
        </Button>
    </Grid>
      </Grid>

      <div className='overflow-x-auto custom-scrollbar flex-grow rounded-lg border border-gray-700/50'>
        <table className='min-w-full divide-y divide-gray-600'>
          <thead className="bg-gray-700 bg-opacity-40 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className='px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider'>Người dùng</th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider'>Email & SĐT</th>
              <th className='px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider'>Vai trò</th>
              <th className='px-6 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider'>Trạng thái</th>
              <th className='px-6 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider'>Hành động</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-600'>
            {currentUsers.map((user) => {
              const userRoleName = roles.find(r => r.id === user.roleId)?.name;
              return (
                <motion.tr
                  key={user.id}
                  layout // Thêm layout prop cho AnimatePresence (nếu dùng) hoặc hiệu ứng mượt hơn
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10}}
                  transition={{ duration: 0.3, delay: Math.random() * 0.05 }}
                  className="hover:bg-gray-700/60 transition-colors duration-150"
                >
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-11 w-11'>
                        <div
                          className={`h-full w-full rounded-full bg-gradient-to-br ${
                            user.isActive
                              ? 'from-sky-500 to-indigo-600'
                              : 'from-gray-600 to-gray-700'
                          } flex items-center justify-center shadow-lg border-2 ${user.isActive ? 'border-sky-400/40' : 'border-gray-500/40'}`}
                          title={userRoleName || "Chưa có vai trò"}
                        >
                          {getRoleBasedAvatar(userRoleName, user.isActive)}
                        </div>
                      </div>
                      <div className='ml-4'>
                        <div className={`text-sm font-semibold ${user.isActive ? 'text-gray-100' : 'text-gray-500'}`}>
                          {user.fullName}
                        </div>
                         <div className={`text-xs ${user.isActive ? 'text-gray-400' : 'text-gray-600'}`}>ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className={`text-sm ${user.isActive ? 'text-gray-300' : 'text-gray-500'}`}>{user.email}</div>
                    <div className={`text-xs mt-1 ${user.isActive ? 'text-gray-400' : 'text-gray-600'}`}>{user.phoneNumber}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-md cursor-pointer transition-all duration-150 ease-in-out transform hover:brightness-125
                        ${user.isActive ? (userRoleName?.toLowerCase() === 'admin' ? 'bg-red-600 text-red-100 shadow-md shadow-red-500/30' : 'bg-cyan-600 text-cyan-100 shadow-md shadow-cyan-500/30') 
                                       : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                      onClick={() => handleOpenRoleUpdateModal(user)}
                      title={user.isActive ? `Đổi vai trò: ${userRoleName || "N/A"}` : "Người dùng không hoạt động"}
                    >
                      {userRoleName || "Chưa có"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-md shadow-sm ${
                        user.isActive
                          ? "bg-green-600 text-green-100 shadow-green-500/30"
                          : "bg-rose-600 text-rose-100 shadow-rose-500/30"
                      }`}
                      title={user.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
                    >
                      {user.isActive ? "Hoạt động" : "Vô hiệu"}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center'>
                    <button
                      className='text-indigo-400 hover:text-indigo-300 p-2 rounded-full hover:bg-gray-600/40 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      title="Chỉnh sửa chi tiết người dùng"
                      onClick={() => handleOpenUpdateDrawer(user)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className='text-red-400 hover:text-red-300 p-2 ml-1.5 rounded-full hover:bg-gray-600/40 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500'
                      title="Xóa người dùng"
                      onClick={() => handleDeleteUser(user.id, user.fullName)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && !loading && (
          <Typography sx={{ textAlign: 'center', p: 5, color: 'rgb(156 163 175)', fontStyle: 'italic', mt:2 }}>
            Không tìm thấy người dùng nào phù hợp với bộ lọc hoặc tìm kiếm của bạn.
          </Typography>
        )}
      </div>

      {totalPages > 0 && ( // Chỉ hiển thị pagination nếu có dữ liệu sau khi lọc
        <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, // Stack trên mobile
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2, 
        mt: 'auto', 
        borderTop:'1px solid rgba(75, 85, 99, 0.5)', 
        paddingTop: {xs: '1rem', sm: '0.5rem'}, // Điều chỉnh padding
        gap: { xs: 2, sm: 0 } // Khoảng cách giữa các item trên mobile
    }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
            <Typography sx={{fontSize: '0.875rem', color: '#9CA3AF', whiteSpace: 'nowrap'}}>
                Hiển thị {Math.min((currentPage - 1) * usersPerPage + 1, filteredUsers.length)} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} của {filteredUsers.length}
            </Typography>
            <FormControl size="small" variant="outlined" sx={{ 
                minWidth: 130, 
                '& .MuiOutlinedInput-root': { borderRadius:'8px', bgcolor: 'rgba(30,41,59,0.7)', '& fieldset': { borderColor: '#4B5563' }, '&:hover fieldset': { borderColor: '#4F46E5' }}, 
                '& .MuiSvgIcon-root': { color: '#9CA3AF' },
                '.MuiInputLabel-root': {color: '#9CA3AF'} // Đảm bảo label có màu đúng
            }}>
                <InputLabel id="users-per-page-label">Số mục</InputLabel>
                <Select
                    labelId="users-per-page-label"
                    value={usersPerPage}
                    onChange={handleUsersPerPageChange}
                    label="Số mục"
                    sx={{color: 'white', borderRadius:'8px'}}
                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1F2937', color: 'white', borderRadius: '8px', border:'1px solid #374151' }}}}
                >
                    {[5, 10, 20, 50, 100].map(size => (
                        <MenuItem key={size} value={size} sx={{ '&:hover': { bgcolor: '#374151'}, '&.Mui-selected': {bgcolor: '#4F46E5!important', fontWeight:'bold'}, '&.Mui-selected:hover':{bgcolor: '#4338CA!important'} }}>{size} / trang</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
        <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="small" // Giữ size small cho gọn
            sx={{ /* ... style pagination giữ nguyên ... */ }}
        />
    </Box>
      )}

      {/* Modal cập nhật vai trò (đơn giản) */}
      {selectedUser && (
        <Modal open={isRoleUpdateModalOpen} onClose={handleCloseRoleUpdateModal} aria-labelledby="update-role-modal-title">
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: {xs: '90%', sm: 400}, bgcolor: 'rgba(30, 41, 59, 0.98)', backdropFilter: 'blur(8px)', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2)', p: {xs:2.5, sm:3.5}, borderRadius: '12px', color: '#E5E7EB' }}>
            <Typography id="update-role-modal-title" variant="h6" component="h2" sx={{ color: '#D1D5DB', mb: 2.5, fontWeight:'bold' }}>
              Cập nhật vai trò cho: <span className="text-indigo-400">{selectedUser.fullName}</span>
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="role-select-label" sx={{ color: '#9CA3AF', '&.Mui-focused': {color: '#A5B4FC'} }}>Vai trò mới</InputLabel>
              <Select
                labelId="role-select-label"
                label="Vai trò mới"
                value={roleForSelectedUser}
                onChange={(e) => setRoleForSelectedUser(e.target.value)}
                sx={{ bgcolor: 'rgba(55, 65, 81, 0.7)', color: 'white', '& .MuiSvgIcon-root': { color: '#9CA3AF' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5' }, '.MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#A5B4FC', borderWidth: '2px' }, borderRadius:'8px' }}
                MenuProps={{ PaperProps: { sx: { bgcolor: '#1F2937', color: 'white', borderRadius: '8px', border:'1px solid #374151' }}}}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id} sx={{ '&:hover': { bgcolor: '#374151'}, '&.Mui-selected': {bgcolor: '#4F46E5!important', fontWeight:'bold'}, '&.Mui-selected:hover':{bgcolor: '#4338CA!important'} }}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleUpdateUserRole} sx={{ mt: 3, bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' }, textTransform:'none', fontWeight:'bold', py:1.2, borderRadius:'8px' }} fullWidth>
              Lưu thay đổi vai trò
            </Button>
          </Box>
        </Modal>
      )}

      {/* Modal thêm người dùng mới */}
      <Modal open={isAddUserModalOpen} onClose={handleCloseAddUserModal} aria-labelledby="add-user-modal-title">
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: {xs: '90%', sm: 450}, bgcolor: 'rgba(30, 41, 59, 0.98)', backdropFilter: 'blur(8px)', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2)', p: {xs:2.5, sm:3.5}, borderRadius: '12px', color: '#E5E7EB', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography id="add-user-modal-title" variant="h6" component="h2" textAlign="center" sx={{ color: '#D1D5DB', mb: 1, fontWeight:'bold' }}>
            Thêm Người Dùng Mới
          </Typography>
          {[
            { label: "Họ và tên", name: "fullName", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Số điện thoại", name: "phoneNumber", type: "tel" },
            { label: "Mật khẩu", name: "password", type: "password" },
          ].map(field => (
            <TextField key={field.name} label={field.label} name={field.name} type={field.type} value={newUser[field.name]} onChange={handleNewUserInputChange} variant="outlined" fullWidth 
                       InputLabelProps={{ sx: { color: '#9CA3AF', '&.Mui-focused': {color: '#A5B4FC'} } }} 
                       sx={{ '.MuiInputBase-input': { color: 'white' }, '& .MuiOutlinedInput-root': { borderRadius:'8px', bgcolor: 'rgba(55, 65, 81, 0.7)', '& fieldset': { borderColor: '#4B5563' }, '&:hover fieldset': { borderColor: '#4F46E5' }, '&.Mui-focused fieldset': { borderColor: '#A5B4FC', borderWidth: '2px' }}}} />
          ))}
          <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius:'8px', bgcolor: 'rgba(55, 65, 81, 0.7)', '& fieldset': { borderColor: '#4B5563' }, '&:hover fieldset': { borderColor: '#4F46E5' }, '&.Mui-focused fieldset': { borderColor: '#A5B4FC', borderWidth: '2px'}}, '& .MuiSvgIcon-root': { color: '#9CA3AF' }}}>
            <InputLabel id="add-user-role-label" sx={{ color: '#9CA3AF', '&.Mui-focused': {color: '#A5B4FC'} }}>Vai trò</InputLabel>
            <Select labelId="add-user-role-label" label="Vai trò" name="roleId" value={newUser.roleId} onChange={handleNewUserInputChange} displayEmpty sx={{ color: newUser.roleId ? 'white' : '#9CA3AF', borderRadius:'8px' }} MenuProps={{ PaperProps: { sx: { bgcolor: '#1F2937', color: 'white', borderRadius: '8px', border:'1px solid #374151' }}}}>
              <MenuItem value="" disabled sx={{ color: '#9CA3AF', fontStyle:'italic' }}><em>--- Chọn vai trò ---</em></MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id} sx={{ '&:hover': { bgcolor: '#374151'}, '&.Mui-selected': {bgcolor: '#4F46E5!important', fontWeight:'bold'}, '&.Mui-selected:hover':{bgcolor: '#4338CA!important'} }}>{role.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleAddNewUser} fullWidth sx={{ textTransform: 'none', fontWeight: 'bold', py: 1.5, borderRadius: '8px', bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' }}}>
            Thêm Người Dùng
          </Button>
        </Box>
      </Modal>

      <RoleDrawer visible={roleDrawerVisible} onClose={handleCloseRoleDrawer} roles={roles} setRoles={setRoles} />

      <UpdateUserDrawer
        open={updateDrawerVisible}
        onClose={handleCloseUpdateDrawer}
        user={selectedUser}
        roles={roles}
        onUserUpdated={handleUserUpdated}
      />
    </motion.div>
  );
};

export default UsersTable;