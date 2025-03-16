import React, { useEffect, useState } from "react";
import { Drawer, Button, Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import { X, Edit, Trash2, Plus } from "lucide-react";
import axios from "axios";

const BrandDrawer = ({ open, onClose }) => {
    const [brands, setBrands] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [brandData, setBrandData] = useState({ name: "", description: "", logo: "" });

    useEffect(() => {
        if (open) {
            fetchBrands();
        }
    }, [open]);

    const fetchBrands = async () => {
        try {
            const response = await axios.get("https://localhost:7107/api/brands");
            setBrands(response.data);
        } catch (error) {
            console.error("Failed to fetch brands:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://localhost:7107/api/brands/${id}`);
            setBrands(brands.filter((brand) => brand.id !== id));
        } catch (error) {
            console.error("Failed to delete brand:", error);
        }
    };

    const handleOpenModal = (brand = null) => {
        setEditingBrand(brand);
        setBrandData(brand ? { ...brand } : { name: "", description: "", logo: "" });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBrandData({ ...brandData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            if (editingBrand) {
                await axios.put(`https://localhost:7107/api/brands/${editingBrand.id}`, brandData);
            } else {
                await axios.post("https://localhost:7107/api/brands", brandData);
            }
            fetchBrands();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save brand:", error);
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
                        Danh sách thương hiệu
                    </Typography>
                    <IconButton onClick={onClose}>
                        <X size={24} />
                    </IconButton>
                </Box>
                <Button onClick={() => handleOpenModal()} variant="contained" sx={{ mb: 2, bgcolor: "black", color: "white", borderRadius: 2 }}>
                    <Plus size={20} style={{ marginRight: 5 }} /> Thêm thương hiệu
                </Button>
                <TableContainer component={Paper} sx={{ flex: 1 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Tên</strong></TableCell>
                                <TableCell><strong>Mô tả</strong></TableCell>
                                <TableCell><strong>Logo</strong></TableCell>
                                <TableCell><strong>Hành động</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {brands.map((brand) => (
                                <TableRow key={brand.id}>
                                    <TableCell>{brand.name}</TableCell>
                                    <TableCell>{brand.description}</TableCell>
                                    <TableCell>
                                        <img src={brand.logo} alt={brand.name} style={{ width: 50, height: 50, objectFit: "contain" }} />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton color="primary" onClick={() => handleOpenModal(brand)}>
                                            <Edit size={20} />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(brand.id)}>
                                            <Trash2 size={20} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Modal thêm/sửa thương hiệu */}
            <Dialog open={modalOpen} onClose={handleCloseModal}>
                <DialogTitle>{editingBrand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}</DialogTitle>
                <DialogContent>
                    <TextField label="Tên thương hiệu" fullWidth name="name" value={brandData.name} onChange={handleChange} margin="normal" />
                    <TextField label="Mô tả" fullWidth name="description" value={brandData.description} onChange={handleChange} margin="normal" />
                    <TextField label="Logo URL" fullWidth name="logo" value={brandData.logo} onChange={handleChange} margin="normal" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="secondary">Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingBrand ? "Lưu thay đổi" : "Thêm mới"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Drawer>
    );
};

export default BrandDrawer;
