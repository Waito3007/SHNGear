import React, { useState, useEffect } from "react";
import { Drawer,Chip, Button, Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, TextField, Switch } from "@mui/material";
import { X, Edit, Trash2, Plus } from "lucide-react";
import axios from "axios";

const VoucherDrawer = ({ open, onClose }) => {
    const [vouchers, setVouchers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState(null);
    const [voucher, setVoucher] = useState({ code: "", discountAmount: "", expiryDate: "", isActive: true });

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const response = await axios.get("https://localhost:7107/api/vouchers");
            setVouchers(response.data);
        } catch (error) {
            console.error("Failed to fetch vouchers:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVoucher({ ...voucher, [name]: value });
    };

    const handleToggleActive = (e) => {
        setVoucher({ ...voucher, isActive: e.target.checked });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`https://localhost:7107/api/vouchers/${selectedVoucherId}`, voucher);
                setIsEditing(false);
                setSelectedVoucherId(null);
            } else {
                await axios.post("https://localhost:7107/api/vouchers", voucher);
            }
            fetchVouchers();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save voucher:", error);
        }
    };

    const handleEdit = (voucher) => {
        setVoucher(voucher);
        setIsEditing(true);
        setSelectedVoucherId(voucher.id);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://localhost:7107/api/vouchers/${id}`);
            fetchVouchers();
        } catch (error) {
            console.error("Failed to delete voucher:", error);
        }
    };

    const handleOpenModal = () => {
        setIsEditing(false);
        setVoucher({ code: "", discountAmount: "", expiryDate: "", isActive: true });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 600, p: 3, bgcolor: "white", height: "100%" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">Xem Voucher</Typography>
                    <IconButton onClick={onClose}><X size={24} /></IconButton>
                </Box>
                <Button onClick={handleOpenModal} variant="contained" sx={{ bgcolor: "black", color: "white", mb: 2 }}>
                    <Plus size={18} /> Thêm Voucher
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: "black" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white" }}>Mã Voucher</TableCell>
                                <TableCell sx={{ color: "white" }}>Giảm Giá</TableCell>
                                <TableCell sx={{ color: "white" }}>Hạn Sử Dụng</TableCell>
                                <TableCell sx={{ color: "white" }}>Trạng Thái</TableCell>
                                <TableCell sx={{ color: "white" }}>Hành Động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vouchers.map((voucher) => (
                                <TableRow key={voucher.id}>
                                    <TableCell>{voucher.code}</TableCell>
                                    <TableCell>{voucher.discountAmount}</TableCell>
                                    <TableCell>{voucher.expiryDate}</TableCell>
                        <TableCell>
                            <Chip
                                label={voucher.isActive ? "Đang hoạt động" : "Tắt"}
                                color={voucher.isActive ? "success" : "error"}
                                sx={{ fontWeight: "bold", color: "white" }}
                            />
                        </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEdit(voucher)}><Edit size={18} /></IconButton>
                                        <IconButton onClick={() => handleDelete(voucher.id)}><Trash2 size={18} /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Modal thêm & sửa Voucher */}
            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "white",
                    border: "2px solid black",
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    width: 400
                }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>{isEditing ? "Chỉnh sửa Voucher" : "Thêm Voucher"}</Typography>
                    <TextField fullWidth label="Mã Voucher" name="code" value={voucher.code} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField fullWidth label="Số tiền giảm giá" name="discountAmount" type="number" value={voucher.discountAmount} onChange={handleChange} sx={{ mb: 2 }} />
                    <TextField
                        fullWidth
                        label="Ngày hết hạn"
                        name="expiryDate"
                        type="date"
                        value={voucher.expiryDate}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }} // Fix lỗi chữ bị đè
                    />
                    <Box display="flex" alignItems="center" mb={2}>
                        <Typography variant="body2">Kích hoạt</Typography>
                        <Switch checked={voucher.isActive} onChange={handleToggleActive} />
                    </Box>
                    <Button fullWidth onClick={handleSubmit} variant="contained" sx={{ bgcolor: "black", color: "white" }}>
                        {isEditing ? "Cập nhật Voucher" : "Thêm Voucher"}
                    </Button>
                </Box>
            </Modal>
        </Drawer>
    );
};

export default VoucherDrawer;
