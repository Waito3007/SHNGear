import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Container, Stack } from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
          console.error("No order ID provided");
          return;
        }

        const response = await fetch(`/api/Order/${orderId}`);
        if (!response.ok) throw new Error("Failed to fetch order details");

        const data = await response.json();
        setOrderDetails(data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location]);

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Typography>Đang tải thông tin đơn hàng...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "background.paper",
          }}
        >
          {/* Icon thành công */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircleOutlineIcon
              sx={{ fontSize: 80, color: "success.main", mb: 2 }}
            />
          </motion.div>

          {/* Tiêu đề */}
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Thanh toán thành công!
          </Typography>

          {/* Thông báo */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và sẽ được
            xử lý trong thời gian sớm nhất.
          </Typography>

          {/* Chi tiết đơn hàng giả lập */}
          <Box
            sx={{
              width: "100%",
              p: 2,
              mb: 3,
              borderRadius: 1,
              backgroundColor: "grey.100",
              textAlign: "left",
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Thông tin đơn hàng:
            </Typography>
            {orderDetails && (
              <>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Mã đơn hàng: #{orderDetails.id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Tổng tiền:{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(orderDetails.totalAmount)}
                </Typography>
                <Typography variant="body2">
                  Trạng thái:{" "}
                  {orderDetails.orderStatus === "Paid"
                    ? "Đã thanh toán"
                    : orderDetails.orderStatus}
                </Typography>
              </>
            )}
          </Box>

          {/* Nút hành động */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ width: "100%", justifyContent: "center" }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<SearchIcon />}
                onClick={() => navigate("/order-lookup")}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                Tra cứu đơn hàng
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/")}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                Về trang chủ
              </Button>
            </motion.div>
          </Stack>

          {/* Thông báo phụ */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
            Bạn sẽ nhận được email xác nhận đơn hàng trong ít phút.
          </Typography>
        </Box>
      </motion.div>
    </Container>
  );
};

export default PaymentSuccess;
