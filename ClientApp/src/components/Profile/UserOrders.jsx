import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Typography,
  CircularProgress,
  Avatar,
  Collapse,
  IconButton,
  Box,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  Pagination,
  Stack,
  Alert,
  Container
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  ShoppingCart,
  LocalShipping,
  Payment,
  CheckCircle,
  Cancel,
  AccessTime,
  Receipt
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
    // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ordersPerPage] = useState(6);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.sub) {
          setUserId(decodedToken.sub);
        } else {
          console.error("Không tìm thấy userId trong token!");
        }
      } catch (err) {
        console.error("Lỗi khi decode token:", err);
      }
    }
  }, []);
  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/orders/user/${userId}/paged`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            params: {
              page: currentPage,
              pageSize: ordersPerPage
            }
          }
        );
        
        // Handle different response structures
        if (response.data) {
          if (response.data.orders) {
            // Paginated response
            setOrders(response.data.orders);
            setTotalPages(response.data.totalPages || 1);
            setTotalOrders(response.data.totalCount || response.data.orders.length);
          } else if (Array.isArray(response.data)) {
            // Direct array response
            setOrders(response.data);
            setTotalPages(1);
            setTotalOrders(response.data.length);
          } else {
            setOrders([]);
            setTotalPages(1);
            setTotalOrders(0);
          }
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", err);
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, currentPage, ordersPerPage]);
  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setExpandedOrder(null); // Close expanded order when changing page
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      case "paid":
        return "primary";
      case "processing":
        return "info";
      case "shipped":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle />;
      case "pending":
        return <AccessTime />;
      case "cancelled":
        return <Cancel />;
      case "paid":
        return <Payment />;
      case "processing":
        return <Receipt />;
      case "shipped":
        return <LocalShipping />;
      default:
        return <ShoppingCart />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "Đã giao hàng";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      case "paid":
        return "Đã thanh toán";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang vận chuyển";
      default:
        return status || "Không xác định";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Đang tải danh sách đơn hàng...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6">{error}</Typography>
          <Typography variant="body2">
            Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.
          </Typography>
        </Alert>
      </Container>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Lịch sử đơn hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi và quản lý tất cả đơn hàng của bạn
        </Typography>
      </Box>

      {/* Summary Stats */}
      {orders.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="primary.main">
                {totalOrders}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng đơn hàng
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="success.main">
                {Array.isArray(orders) ? orders.filter(o => o.orderStatus?.toLowerCase() === 'delivered').length : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã giao hàng
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" color="warning.main">
                {Array.isArray(orders) ? orders.filter(o => o.orderStatus?.toLowerCase() === 'pending').length : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đang xử lý
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Orders List */}
      {!Array.isArray(orders) || orders.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Bạn chưa có đơn hàng nào
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Hãy bắt đầu mua sắm ngay để trải nghiệm dịch vụ của chúng tôi!
          </Typography>
          <Button variant="contained" size="large">
            Bắt đầu mua sắm
          </Button>
        </Card>
      ) : (
        <>
          {/* Orders Cards */}
          <Stack spacing={2} sx={{ mb: 4 }}>
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{ overflow: 'hidden', '&:hover': { boxShadow: 4 } }}>
                    <CardContent sx={{ p: 0 }}>
                      {/* Order Header */}
                      <Box
                        sx={{
                          p: 3,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => toggleOrderExpand(order.id)}
                      >
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item>
                            <IconButton size="small">
                              {expandedOrder === order.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                              Đơn hàng #{order.id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Đặt hàng ngày {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Chip
                              icon={getStatusIcon(order.orderStatus)}
                              label={getStatusLabel(order.orderStatus)}
                              color={getStatusColor(order.orderStatus)}
                              variant="outlined"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Grid>
                          <Grid item>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              {formatCurrency(order.totalAmount)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Order Details */}
                      <Collapse in={expandedOrder === order.id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                            Chi tiết đơn hàng
                          </Typography>
                          
                          {/* Order Items */}
                          <Stack spacing={2} sx={{ mb: 3 }}>
                            {Array.isArray(order.items) && order.items.map((item, index) => (
                              <Card key={`${order.id}-${item.productVariantId || index}`} variant="outlined">
                                <CardContent sx={{ p: 2 }}>
                                  <Grid container spacing={2} alignItems="center">
                                    <Grid item>
                                      <Avatar
                                        src={
                                          item.productImage?.startsWith("http")
                                            ? item.productImage
                                            : item.productImage
                                            ? `${process.env.REACT_APP_API_BASE_URL}/${item.productImage}`
                                            : null
                                        }
                                        sx={{ width: 64, height: 64 }}
                                        variant="rounded"
                                        alt={item.productName}
                                      >
                                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                          <rect width="64" height="64" fill="#f5f5f5"/>
                                          <path d="M32 20c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="#ccc"/>
                                          <path d="M16 48h32l-4-12H20l-4 12z" fill="#ccc"/>
                                        </svg>
                                      </Avatar>
                                    </Grid>
                                    <Grid item xs>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {item.productName}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {item.variantColor && item.variantStorage 
                                          ? `${item.variantColor} - ${item.variantStorage}`
                                          : 'Phiên bản tiêu chuẩn'
                                        }
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Số lượng: {item.quantity}
                                      </Typography>
                                    </Grid>
                                    <Grid item>
                                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(item.price)}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" align="right">
                                        Thành tiền: {formatCurrency(item.price * item.quantity)}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>

                          {/* Order Summary */}
                          <Divider sx={{ my: 2 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Phương thức thanh toán:</strong>
                              </Typography>
                              <Chip
                                icon={<Payment />}
                                label={order.paymentMethodId === 1 ? "Tiền mặt" : "Thanh toán online"}
                                variant="outlined"
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                  Tổng cộng: {formatCurrency(order.totalAmount)}
                                </Typography>
                                {order.orderStatus?.toLowerCase() === "pending" && (
                                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                                    Đơn hàng đang chờ xử lý
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Stack>

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
        </>
      )}
    </Container>
  );
};

export default UserOrders;