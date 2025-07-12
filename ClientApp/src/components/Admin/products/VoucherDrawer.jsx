import React, { useState, useEffect } from "react";
import { Drawer,Chip, Button, Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, TextField, Switch } from "@mui/material";
import { X, Edit, Trash2, Plus } from "lucide-react";
import axios from "axios";

const VoucherDrawer = ({ open, onClose }) => {
    const [vouchers, setVouchers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState(null);
    const [voucher, setVoucher] = useState({ 
        code: "", 
        discountAmount: "", 
        expiryDate: "", 
        isActive: true,
        minimumOrderAmount: 0,
        maxUsageCount: 1
    });

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/vouchers`);
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
        
        // Validation
        if (!voucher.code.trim()) {
            alert("Mã voucher không được để trống!");
            return;
        }
        
        if (voucher.discountAmount <= 0) {
            alert("Số tiền giảm giá phải lớn hơn 0!");
            return;
        }
        
        if (voucher.minimumOrderAmount < 0) {
            alert("Đơn hàng tối thiểu không được âm!");
            return;
        }
        
        if (voucher.maxUsageCount <= 0) {
            alert("Số lần sử dụng tối đa phải lớn hơn 0!");
            return;
        }
        
        if (!voucher.expiryDate) {
            alert("Vui lòng chọn ngày hết hạn!");
            return;
        }
        
        if (new Date(voucher.expiryDate) <= new Date()) {
            alert("Ngày hết hạn phải lớn hơn ngày hiện tại!");
            return;
        }

        try {
            if (isEditing) {
                await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/vouchers/${selectedVoucherId}`, voucher);
                setIsEditing(false);
                setSelectedVoucherId(null);
                alert("Cập nhật voucher thành công!");
            } else {
                await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/vouchers`, voucher);
                alert("Thêm voucher thành công!");
            }
            fetchVouchers();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save voucher:", error);
            alert(error.response?.data?.Message || "Có lỗi xảy ra khi lưu voucher!");
        }
    };

    const handleEdit = (voucher) => {
        setVoucher(voucher);
        setIsEditing(true);
        setSelectedVoucherId(voucher.id);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
            return;
        }
        
        try {
            await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/vouchers/${id}`);
            fetchVouchers();
            alert("Xóa voucher thành công!");
        } catch (error) {
            console.error("Failed to delete voucher:", error);
            alert(error.response?.data?.Message || "Có lỗi xảy ra khi xóa voucher!");
        }
    };

    const handleOpenModal = () => {
        setIsEditing(false);
        setVoucher({ 
            code: "", 
            discountAmount: "", 
            expiryDate: "", 
            isActive: true,
            minimumOrderAmount: 0,
            maxUsageCount: 1
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 800, p: 3, bgcolor: "white", height: "100%" }}>
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
                                <TableCell sx={{ color: "white" }}>Đơn hàng tối thiểu</TableCell>
                                <TableCell sx={{ color: "white" }}>Số lần sử dụng</TableCell>
                                <TableCell sx={{ color: "white" }}>Hạn Sử Dụng</TableCell>
                                <TableCell sx={{ color: "white" }}>Trạng Thái</TableCell>
                                <TableCell sx={{ color: "white" }}>Hành Động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vouchers.map((voucher) => (
                                <TableRow key={voucher.id}>
                                    <TableCell>{voucher.code}</TableCell>
                                    <TableCell>{voucher.discountAmount.toLocaleString('vi-VN')}đ</TableCell>
                                    <TableCell>{voucher.minimumOrderAmount.toLocaleString('vi-VN')}đ</TableCell>
                                    <TableCell>{voucher.maxUsageCount}</TableCell>
                                    <TableCell>{new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={voucher.isActive ? "Đang hoạt động" : "Tắt"}
                                            color={voucher.isActive ? "success" : "error"}
                                            sx={{ fontWeight: "bold", color: "white" }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEdit(voucher)}><Edit size={18} color="blue" /></IconButton>
                                        <IconButton onClick={() => handleDelete(voucher.id)}><Trash2 size={18} color="red" /></IconButton>
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
                        label="Đơn hàng tối thiểu" 
                        name="minimumOrderAmount" 
                        type="number" 
                        value={voucher.minimumOrderAmount} 
                        onChange={handleChange} 
                        sx={{ mb: 2 }} 
                    />
                    <TextField 
                        fullWidth 
                        label="Số lần sử dụng tối đa" 
                        name="maxUsageCount" 
                        type="number" 
                        value={voucher.maxUsageCount} 
                        onChange={handleChange} 
                        sx={{ mb: 2 }} 
                    />
                    <TextField
                        fullWidth
                        label="Ngày hết hạn"
                        name="expiryDate"
                        type="date"
                        value={voucher.expiryDate}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
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
