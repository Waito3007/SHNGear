import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Drawer, Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import OrderItem from './OrderItem'; // Import component OrderItem

// Hàm khởi tạo state ban đầu an toàn hơn
const getInitialFormData = (order) => ({
    addressId: order?.addressId || '',
    voucherId: order?.voucherId || '',
    orderItems: order?.orderItems || [],
    paymentMethodId: order?.paymentMethodId || 1,
    orderStatus: order?.orderStatus || 'Pending'
});

const EditOrder = ({ open, onClose, order, onOrderUpdated }) => {
    const [formData, setFormData] = useState(() => getInitialFormData(order));
    const [addresses, setAddresses] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false); // State cho việc tải dữ liệu
    const [fetchError, setFetchError] = useState(null); // State cho lỗi fetch dữ liệu
    const [submitError, setSubmitError] = useState(null); // State cho lỗi submit

    // Cập nhật lại form data khi prop `order` thay đổi
    useEffect(() => {
        setFormData(getInitialFormData(order));
    }, [order]);

    // Fetch dữ liệu khi component được mở lần đầu hoặc khi `open` là true
    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                setLoading(true);
                setFetchError(null); // Reset lỗi trước khi fetch
                try {
                    // Dùng Promise.all để fetch song song
                    const [addressesRes, vouchersRes, productsRes] = await Promise.all([
                        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/addresses`),
                        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/vouchers`),
                        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products`)
                    ]);

                    setAddresses(addressesRes.data);
                    // Lọc voucher hiệu lực ngay khi nhận dữ liệu
                    setVouchers(vouchersRes.data.filter(v => v.isActive && new Date(v.expiryDate) > new Date()));
                    setProducts(productsRes.data);

                } catch (error) {
                    console.error('Error fetching data:', error);
                    setFetchError('Không thể tải dữ liệu cần thiết. Vui lòng thử lại.'); // Thông báo lỗi thân thiện
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
             // Reset state khi đóng Drawer để lần mở sau không bị ảnh hưởng
             setLoading(false);
             setFetchError(null);
             setSubmitError(null);
             // Không reset form data ở đây vì có thể người dùng muốn giữ lại thay đổi chưa lưu
        }
    }, [open]); // Chỉ fetch khi `open` thay đổi (và là true)

    // Memoize các options cho Select để tránh tính toán lại không cần thiết
    const addressOptions = useMemo(() => addresses.map(address => (
        <MenuItem key={address.id} value={address.id}>
            {address.fullName} - {address.addressLine1}
        </MenuItem>
    )), [addresses]);

    const voucherOptions = useMemo(() => vouchers.map(voucher => (
        <MenuItem key={voucher.id} value={voucher.id}>
            {voucher.code} (Giảm {voucher.discountAmount}đ)
        </MenuItem>
    )), [vouchers]);

    const productVariantOptions = useMemo(() => products.flatMap(product =>
        product.variants.map(variant => (
            <MenuItem key={variant.id} value={variant.id}>
                {product.name} - {variant.color} - {variant.storage}
            </MenuItem>
        ))
    ), [products]);

    // Sử dụng useCallback cho các handler để tối ưu (đặc biệt khi truyền xuống component con)
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleOrderItemChange = useCallback((index, field, value) => {
        setFormData(prev => {
            const updatedItems = [...prev.orderItems];
            updatedItems[index] = { ...updatedItems[index], [field]: value }; // Cập nhật item đúng cách
            return { ...prev, orderItems: updatedItems };
        });
    }, []);

    const addOrderItem = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            orderItems: [...prev.orderItems, { productVariantId: '', quantity: 1, price: 0 }]
        }));
    }, []);

    const removeOrderItem = useCallback((index) => {
        setFormData(prev => ({
            ...prev,
            orderItems: prev.orderItems.filter((_, i) => i !== index)
        }));
    }, []);

    const handleSubmit = useCallback(async () => {
        setSubmitError(null); // Reset lỗi trước khi submit
        try {
            // Có thể thêm validation cho formData ở đây trước khi gửi
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/api/orders/${order.id}`,
                formData
            );
            onOrderUpdated(response.data);
            onClose(); // Đóng Drawer sau khi thành công
        } catch (error) {
            console.error('Error updating order:', error);
            // Hiển thị lỗi thân thiện hơn alert
            setSubmitError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đơn hàng. Vui lòng thử lại.');
        }
    }, [formData, order?.id, onOrderUpdated, onClose]); // Thêm dependencies cho useCallback

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: '50%', maxWidth: '600px' } }} // Tăng chiều rộng một chút
        >
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    Chỉnh sửa đơn hàng #{order?.id}
                </Typography>

                {/* Hiển thị loading hoặc lỗi fetch */}
                {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
                {fetchError && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}
                {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

                {/* Chỉ hiển thị form khi không loading và không có lỗi fetch */}
                {!loading && !fetchError && (
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}> {/* Cho phép scroll nội dung form */}
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Địa chỉ giao hàng</InputLabel>
                            <Select name="addressId" value={formData.addressId} onChange={handleChange} label="Địa chỉ giao hàng">
                                {addressOptions}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Voucher</InputLabel>
                            <Select name="voucherId" value={formData.voucherId} onChange={handleChange} label="Voucher">
                                <MenuItem value=""><em>Không sử dụng voucher</em></MenuItem>
                                {voucherOptions}
                            </Select>
                        </FormControl>

                         {/* Thêm các trường khác nếu cần, ví dụ: Trạng thái đơn hàng */}
                         <FormControl fullWidth margin="normal">
                             <InputLabel>Trạng thái đơn hàng</InputLabel>
                             <Select name="orderStatus" value={formData.orderStatus} onChange={handleChange} label="Trạng thái đơn hàng">
                                 <MenuItem value="Pending">Chờ xử lý</MenuItem>
                                 <MenuItem value="Processing">Đang xử lý</MenuItem>
                                 <MenuItem value="Shipped">Đã giao hàng</MenuItem>
                                 <MenuItem value="Delivered">Đã nhận</MenuItem>
                                 <MenuItem value="Cancelled">Đã hủy</MenuItem>
                                 {/* Thêm các trạng thái khác nếu có */}
                             </Select>
                         </FormControl>


                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                            Sản phẩm
                        </Typography>

                        {formData.orderItems.map((item, index) => (
                            // Sử dụng component OrderItem
                            <OrderItem
                                key={index} // Lưu ý: dùng index làm key không lý tưởng nếu list có thể sắp xếp lại/xóa giữa chừng. Nếu item có ID duy nhất, nên dùng item.id
                                item={item}
                                index={index}
                                productVariantOptions={productVariantOptions}
                                onChange={handleOrderItemChange}
                                onRemove={removeOrderItem}
                            />
                        ))}

                        <Button variant="outlined" onClick={addOrderItem} sx={{ mt: 1, mb: 2 }}>
                            Thêm sản phẩm
                        </Button>
                    </Box>
                )}

                {/* Phần footer cố định */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                    <Button variant="outlined" onClick={onClose} sx={{ mr: 2 }}>
                        Hủy
                    </Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading || !!fetchError}> {/* Disable nút Lưu khi đang load hoặc có lỗi fetch */}
                        Lưu thay đổi
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default EditOrder;