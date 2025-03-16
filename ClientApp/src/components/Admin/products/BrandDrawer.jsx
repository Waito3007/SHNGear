import React, { useState, useEffect } from "react";
import { Drawer, Button, Box, Typography, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from "@mui/material";
import { X, Edit, Trash2 } from "lucide-react";
import axios from "axios";

const BrandDrawer = ({ open, onClose }) => {
    const [brand, setBrand] = useState({ name: "", description: "", logo: "" });
    const [brands, setBrands] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBrandId, setSelectedBrandId] = useState(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get("https://localhost:7107/api/brands");
                setBrands(response.data);
            } catch (error) {
                console.error("Failed to fetch brands:", error);
            }
        };
        fetchBrands();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBrand({ ...brand, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`https://localhost:7107/api/brands/${selectedBrandId}`, brand);
                setBrands(brands.map(b => b.id === selectedBrandId ? { ...b, ...brand } : b));
            } else {
                const response = await axios.post("https://localhost:7107/api/brands", brand);
                setBrands([...brands, response.data]);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save brand:", error);
        }
    };

    const handleEdit = (brand) => {
        setBrand(brand);
        setSelectedBrandId(brand.id);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://localhost:7107/api/brands/${id}`);
            setBrands(brands.filter(b => b.id !== id));
        } catch (error) {
            console.error("Failed to delete brand:", error);
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{
                    width: 400,
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
                        {isEditing ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}
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
                        {isEditing ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}
                    </Button>
                </form>
                <Typography variant="h6" fontWeight="bold" mt={4}>
                    Danh sách thương hiệu
                </Typography>
                <List>
                    {brands.map((brand) => (
                        <ListItem key={brand.id}>
                            <ListItemText
                                primary={brand.name}
                                secondary={brand.description}
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => handleEdit(brand)}>
                                    <Edit size={20} />
                                </IconButton>
                                <IconButton edge="end" onClick={() => handleDelete(brand.id)}>
                                    <Trash2 size={20} />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default BrandDrawer;
