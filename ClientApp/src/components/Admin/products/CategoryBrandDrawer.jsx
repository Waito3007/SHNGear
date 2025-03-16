import React, { useState, useEffect } from "react";
import { Drawer, Button, Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { X, Edit, Trash } from "lucide-react";
import axios from "axios";
import CategoryModal from "./CategoryModal";

const CategoryBrandDrawer = ({ open, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("https://localhost:7107/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://localhost:7107/api/categories/${id}`);
            setCategories(categories.filter(category => category.id !== id));
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    const handleOpenModal = (category = null) => {
        setSelectedCategory(category);
        setModalOpen(true);
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box
                sx={{
                    width: 600,
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
                        Danh mục
                    </Typography>
                    <IconButton onClick={onClose}>
                        <X size={24} />
                    </IconButton>
                </Box>
                <Button variant="contained" sx={{ mb: 2, bgcolor: "black", color: "white", borderRadius: 2 }} onClick={() => handleOpenModal()}>
                    Thêm danh mục
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Tên danh mục</b></TableCell>
                                <TableCell><b>Mô tả</b></TableCell>
                                <TableCell><b>Hình ảnh</b></TableCell>
                                <TableCell><b>Hành động</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell><img src={category.image} alt={category.name} width={50} /></TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenModal(category)}>
                                            <Edit size={20} />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(category.id)}>
                                            <Trash size={20} color="red" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <CategoryModal open={modalOpen} onClose={() => setModalOpen(false)} category={selectedCategory} refreshCategories={fetchCategories} />
        </Drawer>
    );
};

export default CategoryBrandDrawer;
