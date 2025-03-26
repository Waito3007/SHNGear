import React, { useState, useEffect } from "react";
import { message } from "antd";
import { Drawer, TextField, Button, Select, MenuItem, FormControlLabel, Switch } from "@mui/material";
import axios from "axios";

const UpdateUserDrawer = ({ open, onClose, user, roles, onUpdate }) => {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    roleId: "",
    isActive: false,
  });

  useEffect(() => {
    if (user) {
      setUserData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        roleId: user.roleId || "",
        isActive: user.isActive || false,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (e) => {
    setUserData({ ...userData, isActive: e.target.checked });
  };

  const handleSave = async () => {
    if (!userData.fullName || !userData.email || !userData.phoneNumber || !userData.roleId) {
      message.warning("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      await axios.put(`https://localhost:7107/api/users/${user.id}`, userData);
      message.success("Cập nhật thông tin thành công!");
      onUpdate(user.id, userData);
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      message.error("Lỗi khi cập nhật, vui lòng thử lại.");
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="w-96 p-5">
        <h2 className="text-xl font-semibold mb-4">Cập nhật người dùng</h2>

        <TextField
          label="Họ và tên"
          name="fullName"
          value={userData.fullName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Số điện thoại"
          name="phoneNumber"
          value={userData.phoneNumber}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Select
          name="roleId"
          value={userData.roleId}
          onChange={handleChange}
          fullWidth
          displayEmpty
          sx={{ mt: 2 }}
        >
          <MenuItem value="" disabled>Chọn vai trò</MenuItem>
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
          ))}
        </Select>

        <FormControlLabel
          control={<Switch checked={userData.isActive} onChange={handleSwitchChange} />}
          label="Kích hoạt tài khoản"
          className="mt-4"
        />

        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={onClose} color="secondary">Hủy</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Lưu</Button>
        </div>
      </div>
    </Drawer>
  );
};

export default UpdateUserDrawer;
