import React, { useState, useEffect } from "react";
import { Drawer, Button, Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { X, Edit, Trash } from "lucide-react";
import axios from "axios";
import BrandModal from "./BrandModal";


const BrandDrawer = ({ open, onClose }) => {
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/brands`);
            setBrands(response.data);
        } catch (error) {
            console.error("Failed to fetch brands:", error);
        }
    };

    const handleConfirmDelete = async () => {
    if (!brandToDelete) return;

    try {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/brands/${brandToDelete.id}`);
        await fetchBrands();
        setDeleteDialogOpen(false);
        setBrandToDelete(null);
    } catch (error) {
        console.error("Failed to delete brand:", error);
    }
};


    const handleOpenModal = (brand = null) => {
        setSelectedBrand(brand);
        setModalOpen(true);
    };

    const handleOpenDeleteDialog = (brand) => {
    setBrandToDelete(brand);
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
                        Thương hiệu
                    </Typography>
                    <IconButton onClick={onClose}>
                        <X size={24} />
                    </IconButton>
                </Box>
                <Button variant="contained" sx={{ mb: 2, bgcolor: "black", color: "white", borderRadius: 2 }} onClick={() => handleOpenModal()}>
                    Thêm thương hiệu
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Tên thương hiệu</b></TableCell>
                                <TableCell><b>Mô tả</b></TableCell>
                                <TableCell><b>Logo</b></TableCell>
                                <TableCell><b>Hành động</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {brands.map((brand) => (
                                <TableRow key={brand.id}>
                                    <TableCell>{brand.name}</TableCell>
                                    <TableCell>{brand.description}</TableCell>
                                    <TableCell><img src={brand.logo} alt={brand.name} width={50} /></TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenModal(brand)}>
                                            <Edit size={20} />
                                        </IconButton>
                                        <IconButton onClick={() => handleOpenDeleteDialog(brand)}>
                                            <Trash size={20} color="red" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <BrandModal open={modalOpen} onClose={() => setModalOpen(false)} brand={selectedBrand} refreshBrands={fetchBrands} />

             <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
    <DialogTitle>Xác nhận xóa</DialogTitle>
    <DialogContent>
        <DialogContentText>
            Bạn có chắc chắn muốn xóa danh mục <b>{brandToDelete?.name}</b> không? Hành động này không thể hoàn tác.
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

export default BrandDrawer;