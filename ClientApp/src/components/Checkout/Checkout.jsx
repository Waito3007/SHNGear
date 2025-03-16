import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Avatar } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItems, totalAmount, voucherCode } = location.state;
  const [userId, setUserId] = useState(null);
  const [address, setAddress] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = parseInt(decoded.sub, 10);
        if (!Number.isInteger(id)) return;
        setUserId(id);
        setIsLoggedIn(true);
        fetchUserAddress(id);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    }
  }, []);

  const fetchUserAddress = async (userId) => {
    try {
      const response = await axios.get(`https://localhost:7107/api/Users/${userId}/address`);
      setAddress(response.data.address);
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ người dùng:", error);
    }
  };

  const handlePlaceOrder = async () => {
    const orderDto = {
      UserId: userId,
      OrderDate: new Date(),
      TotalAmount: totalAmount,
      OrderStatus: "Pending",
      AddressId: isLoggedIn ? address.id : null,
      GuestAddress: isLoggedIn ? null : guestAddress,
      PaymentMethodId: 1, // Giả sử phương thức thanh toán là 1
      OrderItems: selectedItems.map((item) => ({
        ProductVariantId: item.productVariantId,
        Quantity: item.quantity,
        Price: item.productVariant.discountPrice,
      })),
      VoucherId: voucherCode ? voucherCode.id : null,
    };

    try {
      const response = await axios.post("https://localhost:7107/api/orders", orderDto);
      alert("Đơn hàng đã được tạo thành công!");
      navigate("/order-success", { state: { orderId: response.data.OrderId } });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      alert("Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={4}>
        Đặt hàng
      </Typography>
      <List>
        {selectedItems.map((item) => (
          <ListItem key={item.productVariantId}>
            <Avatar
              src={item.productImage || "https://www.apple.com/v/iphone/home/cb/images/meta/iphone__kqge21l9n26q_og.png"}
              alt={item.productName}
              sx={{ width: 56, height: 80, border: "1px solid black", borderRadius: 2 }}
            />
            <ListItemText
              primary={`${item.productVariant?.color} - ${item.productVariant?.storage}`}
              secondary={`Số lượng: ${item.quantity} - ${item.productVariant?.discountPrice * item.quantity} VND`}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" mt={4}>
        Tổng tiền: {totalAmount.toLocaleString()} VND
      </Typography>
      {isLoggedIn ? (
        <Box mt={4}>
          <Typography variant="h6">Địa chỉ giao hàng</Typography>
          <Typography>{address}</Typography>
        </Box>
      ) : (
        <Box mt={4}>
          <Typography variant="h6">Địa chỉ giao hàng (Khách)</Typography>
          <TextField
            label="Địa chỉ"
            variant="outlined"
            value={guestAddress}
            onChange={(e) => setGuestAddress(e.target.value)}
            fullWidth
          />
        </Box>
      )}
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }} onClick={handlePlaceOrder}>
        Đặt hàng ngay
      </Button>
    </Box>
  );
};

export default Checkout;