import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Grid,
  Alert,
} from "@mui/material";
import { CheckCircle, Search, Home } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Lấy dữ liệu từ state hoặc localStorage
    const stateData = location.state;
    const localStorageData = localStorage.getItem("currentOrder");

    if (stateData) {
      setOrderData(stateData);
    } else if (localStorageData) {
      try {
        const parsedData = JSON.parse(localStorageData);
        setOrderData(parsedData);
        // Xóa dữ liệu khỏi localStorage sau khi sử dụng
        localStorage.removeItem("currentOrder");
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu localStorage:", error);
      }
    }
  }, [location.state]);

  const handleTrackOrder = () => {
    if (orderData?.orderId) {
      navigate(`/order-tracking/${orderData.orderId}`);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (!orderData) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="warning">Không tìm thấy thông tin đơn hàng</Alert>
        <Button variant="contained" onClick={handleGoHome} sx={{ mt: 2 }}>
          Về trang chủ
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: "0 auto" }}>
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />

        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
          Đặt Hàng thành công!
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và sẽ được
          xử lý trong thời gian sớm nhất.
        </Typography>

        <Box sx={{ mb: 4, textAlign: "left" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Thông tin đơn hàng:
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Mã đơn hàng:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                #{orderData.orderId}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Phương thức thanh toán:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                {orderData.paymentMethodName}
              </Typography>
            </Grid>
          </Grid>

          {/* Danh sách sản phẩm */}
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Sản phẩm đã mua:
          </Typography>

          <List sx={{ mb: 3 }}>
            {orderData.orderItems?.map((item, index) => (
              <ListItem key={index} sx={{ px: 0, py: 1 }}>
                <ListItemAvatar>
                  <img
                    src={
                      item.productImage?.startsWith("http")
                        ? item.productImage
                        : `${process.env.REACT_APP_API_BASE_URL}/${item.productImage}`
                    }
                    alt={item.productName}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/60";
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {item.productName}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.variantColor} - {item.variantStorage}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Số lượng: {item.quantity}
                      </Typography>
                    </Box>
                  }
                />
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {(
                    item.productDiscountPrice || item.productPrice
                  )?.toLocaleString()}
                  ₫
                </Typography>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Tổng kết thanh toán */}
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Tạm tính:</Typography>
              <Typography>
                {(
                  (orderData.totalAmount || 0) + (orderData.discountAmount || 0)
                ).toLocaleString()}
                ₫
              </Typography>
            </Box>

            {orderData.discountAmount > 0 && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>
                    Mã giảm giá ({orderData.voucherCode}):
                  </Typography>
                  <Typography color="success.main">
                    -{orderData.discountAmount.toLocaleString()}₫
                  </Typography>
                </Box>
              </>
            )}

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Tổng cộng:
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "error.main" }}
              >
                {(
                  orderData.finalAmount ||
                  orderData.totalAmount ||
                  0
                ).toLocaleString()}
                ₫
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="outlined"
            startIcon={<Search />}
            onClick={handleTrackOrder}
            size="large"
          >
            Tra cứu đơn hàng
          </Button>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            size="large"
          >
            Về trang chủ
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Bạn sẽ nhận được email xác nhận đơn hàng trong ít phút.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PaymentSuccess;
