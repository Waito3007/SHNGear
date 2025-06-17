import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { motion } from 'framer-motion';

const OrderLookup = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setOrders([]);
      
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/by-phone/${phoneNumber}`);
      
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          setOrders(response.data);
        } else {
          setError('Không tìm thấy đơn hàng nào với số điện thoại này');
        }
      } else {
        setError('Dữ liệu trả về không hợp lệ');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tra cứu đơn hàng. Vui lòng thử lại sau.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pending': return 'Chờ xác nhận';
      case 'Processing': return 'Đã xác nhận';
      case 'Shipped': return 'Đang vận chuyển';
      case 'Delivered': return 'Đã giao hàng';
      case 'Cancelled': return 'Đã hủy';
      case 'Paid': return 'Đã thanh toán';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Shipped': return 'info';
      case 'Processing': return 'warning';
      case 'Cancelled': return 'error';
      case 'Paid': return 'success';
      default: return 'default';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Tra cứu đơn hàng
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={3}>
            <TextField
              fullWidth
              label="Nhập số điện thoại"
              variant="outlined"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ví dụ: 0778706084"
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
              }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: 56, px: 4, minWidth: 150 }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Đang tìm...' : 'Tra cứu'}
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Kết quả tra cứu ({orders.length} đơn hàng)
            </Typography>
            
            {orders.map((order) => (
              <Card key={order.orderId} sx={{ mb: 4, boxShadow: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Đơn hàng #{order.orderId}
                    </Typography>
                    <Chip 
                      label={getStatusLabel(order.orderStatus)}
                      color={getStatusColor(order.orderStatus)}
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Ngày đặt:</Typography>
                      <Typography>{order.orderDate}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Dự kiến giao:</Typography>
                      <Typography>{order.estimatedDelivery}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Tổng tiền:</Typography>
                      <Typography sx={{ fontWeight: 'bold' }}>{order.formattedTotal}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phương thức:</Typography>
                      <Typography>{order.paymentMethod}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Thông tin giao hàng:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      <Typography>
                        <strong>{order.shippingInfo.fullName}</strong> | {order.shippingInfo.phone}
                      </Typography>
                      <Typography sx={{ mb: 1 }}>{order.shippingInfo.address}</Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Sản phẩm đã đặt:
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Sản phẩm</TableCell>
                          <TableCell align="center">Biến thể</TableCell>
                          <TableCell align="right">Số lượng</TableCell>
                          <TableCell align="right">Đơn giá</TableCell>
                          <TableCell align="right">Thành tiền</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.products.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography>{product.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={product.variant} size="small" />
                            </TableCell>
                            <TableCell align="right">{product.quantity}</TableCell>
                            <TableCell align="right">{formatPrice(product.price)}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight="bold">
                                {formatPrice(product.total)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </motion.div>
    </Box>
  );
};

export default OrderLookup;