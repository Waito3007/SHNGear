import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

const EditOrder = ({ open, onClose, order, onOrderUpdated }) => {
    const [formData, setFormData] = useState({
        addressId: order?.addressId || '',
        voucherId: order?.voucherId || '',
        orderItems: order?.orderItems || [],
        paymentMethodId: order?.paymentMethodId || 1,
        orderStatus: order?.orderStatus || 'Pending'
    });

    const [addresses, setAddresses] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Fetch addresses, vouchers and products when component mounts
        const fetchData = async () => {
            try {
                const addressesRes = await axios.get('https://localhost:7107/api/addresses');
                const vouchersRes = await axios.get('https://localhost:7107/api/vouchers');
                const productsRes = await axios.get('https://localhost:7107/api/products');
                
                setAddresses(addressesRes.data);
                setVouchers(vouchersRes.data.filter(v => v.isActive && new Date(v.expiryDate) > new Date()));
                setProducts(productsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOrderItemChange = (index, field, value) => {
        const updatedItems = [...formData.orderItems];
        updatedItems[index][field] = value;
        setFormData(prev => ({
            ...prev,
            orderItems: updatedItems
        }));
    };

    const addOrderItem = () => {
        setFormData(prev => ({
            ...prev,
            orderItems: [...prev.orderItems, { productVariantId: '', quantity: 1, price: 0 }]
        }));
    };

    const removeOrderItem = (index) => {
        const updatedItems = formData.orderItems.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            orderItems: updatedItems
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.put(
                `https://localhost:7107/api/orders/${order.id}`,
                formData
            );
            
            onOrderUpdated(response.data);
            onClose();
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Có lỗi xảy ra khi cập nhật đơn hàng');
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: '40%' } }}
        >
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Chỉnh sửa đơn hàng #{order?.id}
                </Typography>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Địa chỉ giao hàng</InputLabel>
                    <Select
                        name="addressId"
                        value={formData.addressId}
                        onChange={handleChange}
                        label="Địa chỉ giao hàng"
                    >
                        {addresses.map(address => (
                            <MenuItem key={address.id} value={address.id}>
                                {address.fullName} - {address.addressLine1}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Voucher</InputLabel>
                    <Select
                        name="voucherId"
                        value={formData.voucherId}
                        onChange={handleChange}
                        label="Voucher"
                    >
                        <MenuItem value="">Không sử dụng voucher</MenuItem>
                        {vouchers.map(voucher => (
                            <MenuItem key={voucher.id} value={voucher.id}>
                                {voucher.code} (Giảm {voucher.discountAmount}đ)
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Sản phẩm
                </Typography>

                {formData.orderItems.map((item, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Sản phẩm</InputLabel>
                            <Select
                                value={item.productVariantId}
                                onChange={(e) => handleOrderItemChange(index, 'productVariantId', e.target.value)}
                                label="Sản phẩm"
                            >
                                {products.flatMap(product => 
                                    product.variants.map(variant => (
                                        <MenuItem key={variant.id} value={variant.id}>
                                            {product.name} - {variant.color} - {variant.storage}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            margin="normal"
                            type="number"
                            label="Số lượng"
                            value={item.quantity}
                            onChange={(e) => handleOrderItemChange(index, 'quantity', parseInt(e.target.value))}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            type="number"
                            label="Đơn giá"
                            value={item.price}
                            onChange={(e) => handleOrderItemChange(index, 'price', parseFloat(e.target.value))}
                        />

                        <Button 
                            variant="outlined" 
                            color="error"
                            onClick={() => removeOrderItem(index)}
                            sx={{ mt: 1 }}
                        >
                            Xóa sản phẩm
                        </Button>
                    </Box>
                ))}

                <Button 
                    variant="outlined" 
                    onClick={addOrderItem}
                    sx={{ mt: 2 }}
                >
                    Thêm sản phẩm
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button 
                        variant="outlined" 
                        onClick={onClose}
                        sx={{ mr: 2 }}
                    >
                        Hủy
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                    >
                        Lưu thay đổi
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default EditOrder;