import React, { useState, useEffect } from "react";
import { Drawer, Button, Box, Typography, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from "@mui/material";
import { X, Edit, Trash2 } from "lucide-react";
import axios from "axios";

const VoucherDrawer = ({ open, onClose }) => {
    const [voucher, setVoucher] = useState({ code: "", discountAmount: "", expiryDate: "", isActive: true });
    const [vouchers, setVouchers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState(null);

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
            setVoucher({ code: "", discountAmount: "", expiryDate: "", isActive: true });
            onClose();
        } catch (error) {
            console.error("Failed to save voucher:", error);
        }
    };

    const handleEdit = (voucher) => {
        setVoucher(voucher);
        setIsEditing(true);
        setSelectedVoucherId(voucher.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://localhost:7107/api/vouchers/${id}`);
            fetchVouchers();
        } catch (error) {
            console.error("Failed to delete voucher:", error);
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
                        {isEditing ? "Chỉnh sửa Voucher" : "Thêm Voucher"}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <X size={24} />
                    </IconButton>
                </Box>
                <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Box
                        component="input"
                        placeholder="Mã Voucher"
                        name="code"
                        value={voucher.code}
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
                        placeholder="Số tiền giảm giá"
                        name="discountAmount"
                        type="number"
                        value={voucher.discountAmount}
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
                        placeholder="Ngày hết hạn"
                        name="expiryDate"
                        type="date"
                        value={voucher.expiryDate}
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
                        type="checkbox"
                        name="isActive"
                        checked={voucher.isActive}
                        onChange={(e) => setVoucher({ ...voucher, isActive: e.target.checked })}
                        sx={{
                            mb: 2,
                        }}
                    />
                    <Typography variant="body2">Kích hoạt</Typography>
                    <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: "black", color: "white", borderRadius: 2 }}>
                        {isEditing ? "Cập nhật Voucher" : "Thêm Voucher"}
                    </Button>
                </form>
                <Typography variant="h6" fontWeight="bold" mt={4}>
                    Danh sách Voucher
                </Typography>
                <List>
                    {vouchers.map((voucher) => (
                        <ListItem key={voucher.id}>
                            <ListItemText
                                primary={voucher.code}
                                secondary={`Giảm giá: ${voucher.discountAmount} - Hết hạn: ${voucher.expiryDate}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={() => handleEdit(voucher)}>
                                    <Edit size={20} />
                                </IconButton>
                                <IconButton edge="end" onClick={() => handleDelete(voucher.id)}>
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

export default VoucherDrawer;