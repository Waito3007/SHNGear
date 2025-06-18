import React, { useState, useEffect, useCallback } from 'react';
import {
    Drawer, Box, Typography, Divider, List, IconButton, Chip, CircularProgress, Grid, Button, ButtonGroup, Alert, Snackbar
} from '@mui/material';
import { Close, PictureAsPdf, InsertDriveFile, Receipt } from '@mui/icons-material';
import axios from 'axios';
import { formatCurrency, formatDate, formatAddress, getStatusColor, getPaymentMethodName } from '../../../utils/FormatInfo'; // Đảm bảo đường dẫn đúng
import OrderDetailItem from './OrderDetailItem';

const OrderDetailDrawer = ({ orderId, open, onClose }) => {
    const [order, setOrder] = useState(null);
    const [variantDetails, setVariantDetails] = useState({}); // Sẽ chứa chi tiết variant cho order hiện tại
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
        // --- Định nghĩa các hàm fetch bên trong useEffect ---
        const performFetchVariantDetails = async (items) => {
            if (!items || items.length === 0) {
                return {}; // Trả về object rỗng nếu không có items
            }
            // Hàm này sẽ fetch các variant chưa có trong cache CỤC BỘ cho lần fetch này
            // Để đơn giản, chúng ta fetch tất cả variant cho order hiện tại mỗi lần
            // Nếu muốn cache toàn cục, logic sẽ phức tạp hơn.
            try {
                const variantIds = items.map((item) => item.variantId).filter(id => id); // Lọc bỏ ID null/undefined

                if (variantIds.length === 0) return {};

                const variantPromises = variantIds.map((id) =>
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/by-variant/${id}`)
                );
                const variantResponses = await Promise.all(variantPromises);

                const newDetails = {};
                variantResponses.forEach((res, index) => {
                    if (res.data) { // Kiểm tra có data trả về không
                       newDetails[variantIds[index]] = res.data;
                    }
                });
                return newDetails;
            } catch (error) {
                console.error('Failed to fetch variant details:', error);
                // Ném lỗi để performFetchOrderDetails bắt được và set fetchError chung
                throw new Error('Lỗi khi tải chi tiết sản phẩm.');
            }
        };

        const performFetchOrderDetails = async () => {
            if (!orderId) return; // Không có orderId thì không làm gì

            setLoading(true);
            setFetchError(null);
            setOrder(null); // Reset order cũ
            setVariantDetails({}); // Reset variant details cũ

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}/details`);
                const fetchedOrderData = response.data;
                setOrder(fetchedOrderData); // Cập nhật order

                if (fetchedOrderData?.items?.length > 0) {
                    const newVariantData = await performFetchVariantDetails(fetchedOrderData.items);
                    setVariantDetails(newVariantData); // Cập nhật variant details cho order này
                }
                // Nếu không có items, variantDetails vẫn là {} (đã reset ở trên)

            } catch (error) {
                console.error('Failed to fetch order details:', error);
                setFetchError(error.message || 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại.');
                setOrder(null); // Đảm bảo reset khi có lỗi
                setVariantDetails({});
            } finally {
                setLoading(false);
            }
        };

        // --- Logic chính của useEffect ---
        if (open && orderId) {
            performFetchOrderDetails();
        } else if (!open) {
            // Reset state khi drawer đóng
            setOrder(null);
            setVariantDetails({});
            setFetchError(null);
            setExporting(false);
            // Không cần gọi setExportStatus ở đây vì nó chỉ liên quan đến thông báo export
        }

    // Mảng phụ thuộc của useEffect này CHỈ NÊN chứa `open` và `orderId`.
    // Các hàm fetch được định nghĩa bên trong nên không cần đưa vào đây.
    }, [open, orderId]);


    // --- Các handlers khác có thể giữ nguyên useCallback vì chúng không gây ra vòng lặp với useEffect chính ---
    const handleExport = useCallback(async (exportType, endpoint, fileExtension, mimeType) => {
        if (!orderId || exporting || !order) { // Thêm kiểm tra !order
            setExportStatus({ open: true, message: 'Không có dữ liệu đơn hàng để xuất.', severity: 'warning' });
            return;
        }

        setExporting(true);
        setExportStatus({ open: false, message: '', severity: 'info' });

        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}/export/${endpoint}`,
                { responseType: 'blob' }
            );
            const blob = new Blob([response.data], { type: mimeType });
            if (blob.size === 0) {
                throw new Error(`Server trả về file ${fileExtension} rỗng.`);
            }
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `HoaDon_${orderId}.${fileExtension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setExportStatus({ open: true, message: `Xuất file ${fileExtension.toUpperCase()} thành công!`, severity: 'success' });
        } catch (error) {
            console.error(`Failed to export ${fileExtension}:`, error);
            let errorMessage = `Xuất file ${fileExtension.toUpperCase()} thất bại.`;
            if (error.response) {
                try {
                    const errorJson = JSON.parse(await error.response.data.text());
                    errorMessage = errorJson.message || errorMessage;
                } catch (parseError) { /* Dùng message mặc định */ }
            } else if (error.message) {
                errorMessage = error.message;
            }
            setExportStatus({ open: true, message: errorMessage, severity: 'error' });
        } finally {
            setExporting(false);
        }
    }, [orderId, exporting, order]); // Thêm order vào dependency để kiểm tra trước khi export

    const handleCloseSnackbar = useCallback((event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setExportStatus(prev => ({ ...prev, open: false }));
    }, []);


    // --- Phần JSX giữ nguyên cấu trúc cũ ---
    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose} // onClose này là prop từ OrdersTable, đã được useCallback
                PaperProps={{
                    sx: { width: { xs: '95%', sm: '70%', md: '50%' }, maxWidth: '700px' },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Header */}
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                        <Typography variant="h6" fontWeight="bold">
                            Chi tiết đơn hàng #{order?.id || orderId}
                        </Typography>
                        <IconButton onClick={onClose} size="small">
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Nút xuất hóa đơn */}
                    <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                            Xuất hóa đơn:
                        </Typography>
                        <ButtonGroup fullWidth variant="outlined" disabled={exporting || !order || loading}>
                            <Button
                                startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <InsertDriveFile />}
                                onClick={() => handleExport('excel', 'excel', 'xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
                                disabled={exporting || !order} // Kiểm tra order trước khi export
                                color="success"
                            >
                                Excel
                            </Button>
                            <Button
                                startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <Receipt />}
                                onClick={() => handleExport('image', 'image', 'png', 'image/png')}
                                disabled={exporting || !order}
                                color="error"
                            >
                                Ảnh
                            </Button>
                            <Button
                                startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf />}
                                onClick={() => handleExport('template', 'template', 'pdf', 'application/pdf')}
                                disabled={exporting || !order}
                                color="primary"
                            >
                                PDF
                            </Button>
                        </ButtonGroup>
                    </Box>
                    <Divider />

                    {/* Content Area */}
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                <CircularProgress />
                            </Box>
                        )}
                        {fetchError && !loading && (
                            <Alert severity="error" sx={{ m: 2 }}>{fetchError}</Alert>
                        )}
                        {!loading && !fetchError && order && (
                            <>
                                {/* Thông tin chung */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                        Thông tin đơn hàng
                                    </Typography>
                                    <Grid container spacing={1.5}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">Mã đơn hàng:</Typography>
                                            <Typography variant="body1" fontWeight="medium">{order.id}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">Ngày đặt:</Typography>
                                            <Typography variant="body1" fontWeight="medium">{formatDate(order.orderDate)}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">Tổng tiền:</Typography>
                                            <Typography variant="body1" fontWeight="medium" color="error">
                                                {formatCurrency(order.totalAmount)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">Thanh toán:</Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                {getPaymentMethodName(order.paymentMethodId)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                                            <Chip
                                                label={order.orderStatus || 'Unknown'}
                                                color={getStatusColor(order.orderStatus)} // getStatusColor cần được định nghĩa hoặc import
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Địa chỉ giao hàng:</Typography>
                                            <Box sx={{ pl: 1 }}>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {order.address?.fullName || 'N/A'} - {order.address?.phoneNumber || 'N/A'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatAddress(order.address)}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Danh sách sản phẩm */}
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                        Sản phẩm ({order.items?.length || 0})
                                    </Typography>
                                    <Divider sx={{ mb: 1 }} />
                                    {order.items?.length > 0 ? (
                                        <List disablePadding>
                                            {order.items.map((item) => (
                                                <OrderDetailItem
                                                    key={item.id || item.variantId}
                                                    item={item}
                                                    variantDetail={variantDetails[item.variantId]}
                                                />
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            Không có sản phẩm trong đơn hàng.
                                        </Typography>
                                    )}
                                </Box>
                            </>
                        )}
                        {!loading && !fetchError && !order && (
                            <Alert severity="warning" sx={{ m: 2 }}>Không tìm thấy thông tin cho đơn hàng này hoặc đơn hàng đã được đóng.</Alert>
                        )}
                    </Box>
                </Box>
            </Drawer>

            <Snackbar
                open={exportStatus.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={exportStatus.severity} sx={{ width: '100%' }} variant="filled">
                    {exportStatus.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default OrderDetailDrawer;