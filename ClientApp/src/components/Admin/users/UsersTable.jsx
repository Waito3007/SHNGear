import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, PlusCircle, Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import { Modal, Box, Typography, Button, Select, MenuItem } from "@mui/material";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openDeleteRoleModal, setOpenDeleteRoleModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    roleId: "",
  });
  const [openUserModal, setOpenUserModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://localhost:7107/api/users");
            console.log("Fetched users:", response.data); // Log dữ liệu người dùng
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error); // Log lỗi khi tải người dùng
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get("https://localhost:7107/api/roles");
            console.log("Fetched roles:", response.data); // Log dữ liệu vai trò
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error); // Log lỗi khi tải vai trò
            setError(error.message);
        }
    };

    fetchUsers();
    fetchRoles();
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

  const handleUpdateRole = async () => {
    if (selectedUser) {
        console.log("Updating role for user:", selectedUser); // Log thông tin người dùng
        console.log("New role ID:", newRole); // Log vai trò mới

        try {
            await axios.put(`https://localhost:7107/api/users/${selectedUser.id}/role`, { roleId: newRole });
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

  const handleAddRole = async () => {
    console.log("Adding new role:", newRoleName); // Log tên vai trò mới

    if (!newRoleName.trim()) {
        alert("Tên vai trò không được để trống.");
        return;
    }

    try {
        const response = await axios.post("https://localhost:7107/api/roles", { name: newRoleName });
        console.log("New role added:", response.data); // Log vai trò mới được thêm
        setRoles([...roles, response.data]);
        alert("Vai trò mới đã được thêm thành công!");
        setOpenRoleModal(false);
        setNewRoleName("");
    } catch (error) {
        console.error("Error adding new role:", error); // Log lỗi khi thêm vai trò
        alert("Lỗi khi thêm vai trò mới, vui lòng thử lại.");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.phoneNumber || !newUser.password || !newUser.roleId) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    try {
        const response = await axios.post("https://localhost:7107/api/users", newUser);
        setUsers([...users, response.data]);
        setFilteredUsers([...filteredUsers, response.data]);
        alert("Người dùng mới đã được thêm thành công!");
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

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vai trò này?")) {
        return;
    }

    try {
        await axios.delete(`https://localhost:7107/api/roles/${roleId}`);
        console.log("Role deleted successfully:", roleId); // Log vai trò đã xóa
        setRoles(roles.filter((role) => role.id !== roleId));
        alert("Vai trò đã được xóa thành công!");
    } catch (error) {
        console.error("Error deleting role:", error); // Log lỗi khi xóa vai trò
        alert("Lỗi khi xóa vai trò, vui lòng thử lại.");
    }
};

const handleOpenDeleteRoleModal = (role) => {
    setRoleToDelete(role);
    setOpenDeleteRoleModal(true);
};

const handleCloseDeleteRoleModal = () => {
    setRoleToDelete(null);
    setOpenDeleteRoleModal(false);
};

const handleConfirmDeleteRole = async () => {
    if (!roleToDelete) {
        alert("Vui lòng chọn vai trò để xóa.");
        return;
    }

    try {
        await axios.delete(`https://localhost:7107/api/roles/${roleToDelete.id}`);
        console.log("Role deleted successfully:", roleToDelete.id); // Log vai trò đã xóa
        setRoles(roles.filter((role) => role.id !== roleToDelete.id));
        alert(`Vai trò "${roleToDelete.name}" đã được xóa thành công!`);
        handleCloseDeleteRoleModal();
    } catch (error) {
        console.error("Error deleting role:", error); // Log lỗi khi xóa vai trò
        alert("Lỗi khi xóa vai trò, vui lòng thử lại.");
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
            Add User
          </button>
          {/* Add Role Button */}
          <button
            className="flex items-center text-sm text-white bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg"
            onClick={() => setOpenRoleModal(true)}
          >
            <PlusCircle size={18} className="mr-2" />
            Add Role
          </button>

          {/* Delete Role Button */}
          <button
            className="flex items-center text-sm text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg"
            onClick={() => handleOpenDeleteRoleModal(null)}
          >
            <Trash2 size={18} className="mr-2" />
            Delete Role
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
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Name</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Email</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Role</th>
            
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Actions</th>
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
                <td className='px-6 py-4 whitespace-nowrap'>
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

                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-300'>{user.email}</div>
                </td>

                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100'>
                    {user.role ? user.role.name : "N/A"}
                  </span>
                </td>

                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "Active"
                        ? "bg-green-800 text-green-100"
                        : "bg-red-800 text-red-100"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                  <button
                    className='text-indigo-400 hover:text-indigo-300 mr-4'
                    onClick={() => handleOpenModal(user)}
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

      <Modal open={openRoleModal} onClose={() => setOpenRoleModal(false)}>
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
                Thêm Vai Trò Mới
            </Typography>
            <input
                type="text"
                placeholder="Tên vai trò"
                className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mt-2"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddRole}
                sx={{ mt: 2 }}
            >
                Thêm Vai Trò
            </Button>
        </Box>
      </Modal>

      <Modal open={openUserModal} onClose={() => setOpenUserModal(false)}>
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
                Thêm Người Dùng Mới
            </Typography>
            <input
                type="text"
                placeholder="Họ và tên"
                className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mt-2"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
            />
            <input
                type="email"
                placeholder="Email"
                className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mt-2"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <input
                type="text"
                placeholder="Số điện thoại"
                className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mt-2"
                value={newUser.phoneNumber}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
            />
            <input
                type="password"
                placeholder="Mật khẩu"
                className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mt-2"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <Select
                value={newUser.roleId}
                onChange={(e) => setNewUser({ ...newUser, roleId: e.target.value })}
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
                onClick={handleAddUser}
                sx={{ mt: 2 }}
            >
                Thêm Người Dùng
            </Button>
        </Box>
      </Modal>

      <Modal open={openDeleteRoleModal} onClose={handleCloseDeleteRoleModal}>
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
                Xóa Vai Trò
            </Typography>
            <Typography sx={{ mt: 2 }}>
                Chọn vai trò bạn muốn xóa:
            </Typography>
            <Select
                value={roleToDelete?.id || ""}
                onChange={(e) => {
                    const selectedRole = roles.find((role) => role.id === e.target.value);
                    setRoleToDelete(selectedRole);
                }}
                fullWidth
                sx={{ mt: 2 }}
            >
                {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                        {role.name}
                    </MenuItem>
                ))}
            </Select>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={handleCloseDeleteRoleModal}>
                    Hủy
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleConfirmDeleteRole}
                    disabled={!roleToDelete} // Vô hiệu hóa nút nếu chưa chọn vai trò
                >
                    Xóa
                </Button>
            </Box>
        </Box>
      </Modal>
    </motion.div>
  );
};

export default UsersTable;