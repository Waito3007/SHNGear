import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, TextField, IconButton } from "@mui/material";
import { X } from "lucide-react";
import axios from "axios";

const BrandModal = ({ open, onClose, brand, refreshBrands }) => {
    const [brandData, setBrandData] = useState({ name: "", description: "", logo: "" });

    useEffect(() => {
        if (brand) {
            setBrandData(brand);
        } else {
            setBrandData({ name: "", description: "", logo: "" });
        }
    }, [brand]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBrandData({ ...brandData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (brand) {
                await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/brands/${brand.id}`, brandData);
            } else {
                await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/brands`, brandData);
            }
            refreshBrands();
            onClose();
        } catch (error) {
            console.error("Failed to save brand:", error);
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
                    boxShadow: 24,
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                        {brand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <X size={24} />
                    </IconButton>
                </Box>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Tên thương hiệu"
                        name="name"
                        value={brandData.name}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Mô tả"
                        name="description"
                        value={brandData.description}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Logo URL"
                        name="logo"
                        value={brandData.logo}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: "black", color: "white", borderRadius: 2 }}>
                        {brand ? "Cập nhật" : "Thêm"}
                    </Button>
                </form>
            </Box>
        </Modal>
    );
};

export default BrandModal;
