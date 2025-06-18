import React, { useState } from 'react';
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
  Chip,
  Pagination,
  Grid,
  IconButton,
  Collapse
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const OrderLookup = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  
  // Expanded order states
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setOrders([]);
      setCurrentPage(1);
      
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/by-phone/${phoneNumber}`);
      
      if (response.data && Array.isArray(response.data)) {        if (response.data.length > 0) {
          setOrders(response.data);
          // Reset pagination when new search is performed
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

  const handleClearSearch = () => {
    setPhoneNumber('');
    setOrders([]);
    setError(null);
    setCurrentPage(1);
    setExpandedOrders(new Set());
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setExpandedOrders(new Set()); // Collapse all when changing page
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

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
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                endAdornment: phoneNumber && (
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                )
              }}
              sx={{ flex: 1 }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
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
        </Paper>        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Kết quả tra cứu ({orders.length} đơn hàng)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trang {currentPage} / {totalPages}
              </Typography>
            </Box>
            
            <AnimatePresence mode="wait">
              {currentOrders.map((order, index) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card sx={{ mb: 3, boxShadow: 3, overflow: 'hidden' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Đơn hàng #{order.orderId}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={getStatusLabel(order.orderStatus)}
                            color={getStatusColor(order.orderStatus)}
                            sx={{ fontWeight: 'bold' }}
                          />
                          <IconButton 
                            onClick={() => toggleOrderExpansion(order.orderId)}
                            sx={{ 
                              transform: expandedOrders.has(order.orderId) ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s'
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Ngày đặt:</Typography>
                          <Typography sx={{ fontWeight: 500 }}>{order.orderDate}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Dự kiến giao:</Typography>
                          <Typography sx={{ fontWeight: 500 }}>{order.estimatedDelivery}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Tổng tiền:</Typography>
                          <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {order.formattedTotal}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Phương thức:</Typography>
                          <Typography sx={{ fontWeight: 500 }}>{order.paymentMethod}</Typography>
                        </Grid>
                      </Grid>

                      <Collapse in={expandedOrders.has(order.orderId)}>
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Thông tin giao hàng:
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography sx={{ fontWeight: 'bold' }}>
                              {order.shippingInfo.fullName} | {order.shippingInfo.phone}
                            </Typography>
                            <Typography>{order.shippingInfo.address}</Typography>
                          </Paper>
                        </Box>

                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Sản phẩm đã đặt:
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'grey.100' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Sản phẩm</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Biến thể</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Số lượng</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Đơn giá</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thành tiền</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.products.map((product, productIndex) => (
                                <TableRow key={productIndex} hover>
                                  <TableCell>
                                    <Typography sx={{ fontWeight: 500 }}>{product.name}</Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip label={product.variant} size="small" variant="outlined" />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip label={product.quantity} size="small" color="primary" />
                                  </TableCell>
                                  <TableCell align="right">{formatPrice(product.price)}</TableCell>
                                  <TableCell align="right">
                                    <Typography fontWeight="bold" color="primary.main">
                                      {formatPrice(product.total)}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Collapse>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 'bold'
                    }
                  }}
                />
              </Box>
            )}
          </motion.div>
        )}
      </motion.div>
    </Box>
  );
};

export default OrderLookup;