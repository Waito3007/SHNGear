import React, { useState } from "react";
import { Drawer, Button, Box, Typography, IconButton } from "@mui/material";
import { X } from "lucide-react";
import axios from "axios";

const BrandDrawer = ({ open, onClose }) => {
    const [brand, setBrand] = useState({ name: "", description: "", logo: "" });

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
};

export default BrandDrawer;
