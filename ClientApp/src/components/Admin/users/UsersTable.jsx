import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, PlusCircle, Pencil, Trash2, Users } from "lucide-react";
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
} from "@mui/material";
import { message } from "antd";

import RoleDrawer from "./RoleDrawer"; // Import nội bộ
import UpdateUserDrawer from "./UpdateUserDrawer";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updateDrawerVisible, setUpdateDrawerVisible] = useState(false);
    const [isModalStatusVisible, setIsModalStatusVisible] = useState(false);
  const [newRole, setNewRole] = useState("");
    const [newStatus, setNewStatus] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [roleDrawerVisible, setRoleDrawerVisible] = useState(false);

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    roleId: "",
  });
  const [openUserModal, setOpenUserModal] = useState(false);

 useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/roles`),
      ]);
      setUsers(usersRes.data);
      setFilteredUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (user) => user.fullName.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.roleId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleOpenUpdateDrawer = (user) => {
  setSelectedUser(user);
  setUpdateDrawerVisible(true);
};

  const handleUpdateRole = async () => {
    if (selectedUser) {
        console.log("Updating role for user:", selectedUser); // Log thông tin người dùng
        console.log("New role ID:", newRole); // Log vai trò mới

        try {
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/users/${selectedUser.id}/role`, { roleId: newRole });
            console.log("Role updated successfully"); // Log khi cập nhật thành công
            setUsers(users.map(user => user.id === selectedUser.id ? { ...user, roleId: newRole } : user));
            setFilteredUsers(filteredUsers.map(user => user.id === selectedUser.id ? { ...user, roleId: newRole } : user));
            alert("Vai trò người dùng đã được cập nhật thành công!");
            handleCloseModal();
        } catch (error) {
            console.error("Error updating user role:", error); // Log lỗi khi cập nhật vai trò
            alert("Lỗi khi cập nhật vai trò người dùng, vui lòng thử lại.");
        }
    }
};


  const handleAddUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.phoneNumber || !newUser.password || !newUser.roleId) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/users`, newUser);
        setUsers([...users, response.data]);
        setFilteredUsers([...filteredUsers, response.data]);
        message.success("Người dùng mới đã được thêm thành công!");

        setOpenUserModal(false);
        setNewUser({
            fullName: "",
            email: "",
            phoneNumber: "",
            password: "",
            roleId: "",
        });
    } catch (error) {
        console.error("Lỗi khi thêm người dùng mới:", error);
        alert("Lỗi khi thêm người dùng mới, vui lòng thử lại.");
    }
  };



  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-100'>Users</h2>
        <div className='flex space-x-3'>
  {/* Add User Button */}
  <button
    className="flex items-center text-sm text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
    onClick={() => setOpenUserModal(true)}
  >
    <PlusCircle size={18} className="mr-2" />
    Thêm người dùng
  </button>

  {/* Role Management Button */}
  <button
    className="flex items-center text-sm text-white bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
    onClick={() => setRoleDrawerVisible(true)}
  >
    <Users size={18} className="mr-2" />
    Quản lý Role
  </button>
</div>
      </div>

      {/* Search Bar */}
      <div className='relative mb-4'>
        <input
          type='text'
          placeholder='Tìm kiếm...'
          className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
          value={searchTerm}
          onChange={handleSearch}
        />
        <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
      </div>

      {/* Users Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-700'>
          <thead>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Tên người dùng</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Email</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Vai trò</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Trạng thái</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Hành động</th>
            </tr>
          </thead>

          <tbody className='divide-y divide-gray-700'>
            {filteredUsers.map((user) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className='px-6 py-3 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 h-10 w-10'>
                      <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                        {user.fullName ? user.fullName.charAt(0) : "?"}
                      </div>
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-100'>{user.fullName}</div>
                    </div>
                  </div>
                </td>

                <td className='px-6 py-3 whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{user.email}</div>
                </td>

                <td className='px-6 py-3 whitespace-nowrap'>
  <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100'>
    {roles.find(r => r.id === user.roleId)?.name || "N/A"}
  </span>
</td>

                <td className="px-6 py-3 whitespace-nowrap">
  <span
    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
      user.isActive ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100"
    }`}
  >
    {user.isActive ? "Active" : "Inactive"}
  </span>
</td>


                <td className='px-6 py-3 whitespace-nowrap text-sm text-gray-300'>
                  <button
  className='text-indigo-400 hover:text-indigo-300 mr-4'
  onClick={() => handleOpenUpdateDrawer(user)}
>
  <Pencil size={18} />
</button>

                  <button
                    className='text-red-400 hover:text-red-300'
                    onClick={() => console.log("Delete", user.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            Cập nhật vai trò người dùng
          </Typography>
          <Select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateRole}
            sx={{ mt: 2 }}
          >
            Cập nhật
          </Button>
        </Box>
      </Modal>



            <Modal open={openUserModal} onClose={() => setOpenUserModal(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" component="h2" textAlign="center">
          Thêm Người Dùng Mới
        </Typography>

        <TextField
          label="Họ và tên"
          variant="outlined"
          fullWidth
          value={newUser.fullName}
          onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
        />

        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />

        <TextField
          label="Số điện thoại"
          type="tel"
          variant="outlined"
          fullWidth
          value={newUser.phoneNumber}
          onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
        />

        <TextField
          label="Mật khẩu"
          type="password"
          variant="outlined"
          fullWidth
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />

        <FormControl fullWidth>
  <Select
    value={newUser.roleId}
    onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
    displayEmpty
  >
    <MenuItem value="" disabled>
      Chọn vai trò
    </MenuItem>
    {roles.map((role) => (
      <MenuItem key={role.id} value={role.id}>
        {role.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>


        <Button
          variant="contained"
          color="primary"
          onClick={handleAddUser}
          fullWidth
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            py: 1.5,
            borderRadius: 2,
          }}
        >
          Thêm Người Dùng
        </Button>
      </Box>
    </Modal>

      <RoleDrawer visible={roleDrawerVisible} onClose={() => setRoleDrawerVisible(false)} />

        <UpdateUserDrawer
  open={updateDrawerVisible}
  onClose={() => setUpdateDrawerVisible(false)}
  user={selectedUser}
  roles={roles}
  onUpdate={(id, updatedData) => {
    setUsers(users.map(user => user.id === id ? { ...user, ...updatedData } : user));
    setFilteredUsers(filteredUsers.map(user => user.id === id ? { ...user, ...updatedData } : user));
  }}
/>
    </motion.div>
  );
};

export default UsersTable;