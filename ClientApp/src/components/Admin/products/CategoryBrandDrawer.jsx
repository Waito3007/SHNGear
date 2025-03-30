import React, { useState, useEffect } from "react";
import { Drawer, Button, Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { X, Edit, Trash } from "lucide-react";
import axios from "axios";
import CategoryModal from "./CategoryModal";

const CategoryBrandDrawer = ({ open, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/categories/${categoryToDelete.id}`);
        await fetchCategories();
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
    } catch (error) {
        console.error("Failed to delete category:", error);
    }
};


    const handleOpenModal = (category = null) => {
        setSelectedCategory(category);
        setModalOpen(true);
    };

    const handleOpenDeleteDialog = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
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
                                    <TableCell><img
    src={
        category.image?.startsWith("http")
            ? category.image // Full external URL
            : `${process.env.REACT_APP_API_BASE_URL}${category.image}`
    }
    alt={`${category.name} logo`}
    className="size-10 rounded-full"
    onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://via.placeholder.com/50";
    }}
/></TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenModal(category)}>
                                            <Edit size={20} />
                                        </IconButton>
                                       <IconButton onClick={() => handleOpenDeleteDialog(category)}>
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

                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
    <DialogTitle>Xác nhận xóa</DialogTitle>
    <DialogContent>
        <DialogContentText>
            Bạn có chắc chắn muốn xóa danh mục <b>{categoryToDelete?.name}</b> không? Hành động này không thể hoàn tác.
        </DialogContentText>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Hủy
        </Button>
        <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Xóa
        </Button>
    </DialogActions>
</Dialog>
        </Drawer>
    );
};

export default CategoryBrandDrawer;
