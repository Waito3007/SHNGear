import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
  Collapse,
  IconButton,
  Box,
  Chip
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

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
        // Lấy danh sách đơn hàng với thông tin chi tiết sản phẩm
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/orders/user/${userId}/paged`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            params: {
              page: 1,
              pageSize: 10 // Có thể điều chỉnh số lượng đơn hàng hiển thị
            }
          }
        );
        setOrders(response.data.orders);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", err);
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Pending":
        return "warning";
      case "Cancelled":
        return "error";
      case "Paid":
        return "primary";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "6rem auto", padding: "0 1rem" }}>
      <Typography variant="h4" gutterBottom align="center">
        Danh sách đơn hàng của bạn
      </Typography>
      
      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6">Bạn chưa có đơn hàng nào</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Hãy bắt đầu mua sắm ngay để trải nghiệm dịch vụ của chúng tôi!
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ border: "1px solid #e0e0e0", borderRadius: "8px" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell />
                <TableCell sx={{ fontWeight: "bold" }}>Mã đơn hàng</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Ngày đặt</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">Tổng tiền</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => toggleOrderExpand(order.id)}
                      >
                        {expandedOrder === order.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      #{order.id}
                    </TableCell>
                    <TableCell align="right">
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell align="right">
                      {order.totalAmount.toLocaleString('vi-VN')}₫
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={order.orderStatus} 
                        color={getStatusColor(order.orderStatus)}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={expandedOrder === order.id} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            Chi tiết đơn hàng
                          </Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Sản phẩm</TableCell>
                                <TableCell align="right">Đơn giá</TableCell>
                                <TableCell align="center">Số lượng</TableCell>
                                <TableCell align="right">Thành tiền</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.items.map((item) => (
                                <TableRow key={`${order.id}-${item.productVariantId}`}>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                       <img
                                src={
                                    item.productImage.startsWith("http")
                                        ? item.productImage // Ảnh từ API (URL đầy đủ)
                                        : `${process.env.REACT_APP_API_BASE_URL}/${item.productImage}` // Ảnh local trong wwwroot
                                }
                                alt="Product img"
                                className="size-10"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/50"; }}
                            />
                                      <Box>
                                        <Typography variant="subtitle1">{item.productName}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {item.variantColor} - {item.variantStorage}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    {item.price.toLocaleString('vi-VN')}₫
                                  </TableCell>
                                  <TableCell align="center">
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell align="right">
                                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                              Phương thức thanh toán: {order.paymentMethodId === 1 ? "Tiền mặt" : "MoMo"}
                            </Typography>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="body1">
                                <strong>Tổng cộng:</strong> {order.totalAmount.toLocaleString('vi-VN')}₫
                              </Typography>
                              {order.orderStatus === "Pending" && (
                                <Typography variant="body2" color="text.secondary">
                                  Đơn hàng đang chờ xử lý
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default UserOrders;