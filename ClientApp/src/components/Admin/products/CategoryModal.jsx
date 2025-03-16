import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button, IconButton } from "@mui/material";
import { X } from "lucide-react";
import axios from "axios";

const CategoryModal = ({ open, onClose, category, refreshCategories }) => {
    const [formData, setFormData] = useState({ name: "", description: "", image: "" });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || "",
                description: category.description || "",
                image: category.image || ""
            });
        } else {
            setFormData({ name: "", description: "", image: "" });
        }
    }, [category]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (category) {
            // Đảm bảo gửi đúng id khi cập nhật
            await axios.put(`https://localhost:7107/api/categories/${category.id}`, {
                id: category.id, // Đảm bảo gửi ID nếu backend yêu cầu
                name: formData.name,
                description: formData.description,
                image: formData.image,
            });
        } else {
            await axios.post("https://localhost:7107/api/categories", formData);
        }
        await refreshCategories(); // Load lại danh sách sau khi cập nhật
        onClose();
    } catch (error) {
        console.error("Failed to save category:", error);
    }
};

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "white",
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 3
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                        {category ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <X size={24} />
                    </IconButton>
                </Box>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Tên danh mục"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Mô tả"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Hình ảnh URL"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: "black", color: "white" }}>
                        {category ? "Cập nhật" : "Thêm"}
                    </Button>
                </form>
            </Box>
        </Modal>
    );
};

export default CategoryModal;
