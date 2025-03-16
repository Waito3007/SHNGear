import React, { useState } from "react";
import {
  Drawer,
  Button,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { X } from "lucide-react";
import axios from "axios";

const BrandDrawer = ({ open, onClose }) => {
    const [brand, setBrand] = useState({ name: "", description: "", logo: "" });

<<<<<<< HEAD
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBrand({ ...brand, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://localhost:7107/api/brands", brand);
            console.log("Brand added:", response.data);
            onClose();
        } catch (error) {
            console.error("Failed to add brand:", error);
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{
                    width: 500,
                    p: 3,
                    bgcolor: "white",
                    border: "2px solid black",
                    borderRadius: 3,
                    boxShadow: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                        Thêm thương hiệu
                    </Typography>
                    <IconButton onClick={onClose}>
                        <X size={24} />
                    </IconButton>
                </Box>
                <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Box
                        component="input"
                        placeholder="Tên thương hiệu"
                        name="name"
                        value={brand.name}
                        onChange={handleChange}
                        sx={{
                            width: "100%",
                            p: 1.5,
                            mb: 2,
                            border: "2px solid black",
                            borderRadius: 2,
                            outline: "none",
                        }}
                    />
                    <Box
                        component="input"
                        placeholder="Mô tả"
                        name="description"
                        value={brand.description}
                        onChange={handleChange}
                        sx={{
                            width: "100%",
                            p: 1.5,
                            mb: 2,
                            border: "2px solid black",
                            borderRadius: 2,
                            outline: "none",
                        }}
                    />
                    <Box
                        component="input"
                        placeholder="Logo URL"
                        name="logo"
                        value={brand.logo}
                        onChange={handleChange}
                        sx={{
                            width: "100%",
                            p: 1.5,
                            mb: 2,
                            border: "2px solid black",
                            borderRadius: 2,
                            outline: "none",
                        }}
                    />
                    <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: "black", color: "white", borderRadius: 2 }}>
                        Thêm thương hiệu
                    </Button>
                </form>
            </Box>
        </Drawer>
    );
=======
  // Modal state cho chỉnh sửa thương hiệu
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  // Xử lý đóng modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBrand(null);
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBrand({ ...brand, [name]: value });
  };

  // Xử lý submit thêm thương hiệu
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://localhost:7107/api/brands",
        brand
      );
      console.log("Brand added:", response.data);
      onClose(); // Đóng Drawer sau khi thêm
    } catch (error) {
      console.error("Failed to add brand:", error);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 500,
          p: 3,
          bgcolor: "white",
          border: "2px solid black",
          borderRadius: 3,
          boxShadow: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight="bold">
            Thêm thương hiệu
          </Typography>
          <IconButton onClick={onClose}>
            <X size={24} />
          </IconButton>
        </Box>

        {/* Form thêm thương hiệu */}
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <TextField
            label="Tên thương hiệu"
            fullWidth
            name="name"
            value={brand.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Mô tả"
            fullWidth
            name="description"
            value={brand.description}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Logo URL"
            fullWidth
            name="logo"
            value={brand.logo}
            onChange={handleChange}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 2, bgcolor: "black", color: "white", borderRadius: 2 }}
          >
            Thêm thương hiệu
          </Button>
        </form>
      </Box>

      {/* Modal chỉnh sửa thương hiệu */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>
          {editingBrand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Tên thương hiệu"
            fullWidth
            name="name"
            value={brand.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Mô tả"
            fullWidth
            name="description"
            value={brand.description}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Logo URL"
            fullWidth
            name="logo"
            value={brand.logo}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingBrand ? "Lưu thay đổi" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
>>>>>>> 3c1091f (cập nhật 1 tý)
};

export default BrandDrawer;
