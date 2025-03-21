import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedItems = location.state?.selectedItems || []; // Kiểm tra nếu undefined
  const totalAmount = location.state?.totalAmount || 0;
  const voucherCode = location.state?.voucherCode || null;

  const [userId, setUserId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [guestAddress, setGuestAddress] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [voucherId, setVoucherId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = parseInt(decoded.sub, 10);
        if (!Number.isInteger(id)) return;
        setUserId(id);
        fetchAddresses(id);
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
    }

    if (voucherCode) {
      fetchVoucherId(voucherCode);
    }
  }, [voucherCode]);

  const fetchAddresses = async (userId) => {
    try {
      const response = await axios.get(
        `https://localhost:7107/api/Users/${userId}/address`
      );
      setAddress(response.data.address || "Chưa có địa chỉ");
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);
    }
  };

  const fetchVoucherId = async (code) => {
    try {
      console.log(`Fetching voucherId for code: ${code}`);
      const response = await axios.get(
        `https://localhost:7107/api/vouchers/code/${code}`
      );
      console.log("Voucher fetched:", response.data);
      setVoucherId(response.data.id);
    } catch (error) {
      console.error("Lỗi khi lấy voucher:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      alert("Không có sản phẩm nào để đặt hàng.");
      return;
    }

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
        Price: item.productVariant?.discountPrice || 0,
      })),
      voucherId: voucherId ? voucherId : null,
    };

    console.log("Đơn hàng:", orderDto);

    try {
      const response = await axios.post(
        "https://localhost:7107/api/orders",
        orderDto
      );
      alert("Đơn hàng đã được tạo thành công!");
      navigate("/order-success", { state: { orderId: response.data.orderId } });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      console.error("Phản hồi lỗi từ API:", error.response?.data);
      if (error.response && error.response.data && error.response.data.errors) {
        console.error("Chi tiết lỗi xác thực:", error.response.data.errors);
      }
      alert("Lỗi khi tạo đơn hàng, vui lòng thử lại.");
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={4}>
        Đặt hàng
      </Typography>
      {selectedItems.length > 0 ? (
        <List>
          {selectedItems.map((item) => (
            <ListItem key={item.productVariantId}>
              <Avatar
                src={
                  item.productImage ||
                  "https://www.apple.com/v/iphone/home/cb/images/meta/iphone__kqge21l9n26q_og.png"
                }
                alt={item.productName}
                sx={{
                  width: 56,
                  height: 80,
                  border: "1px solid black",
                  borderRadius: 2,
                }}
              />
              <ListItemText
                primary={`${item.productVariant?.color || "Không rõ"} - ${
                  item.productVariant?.storage || "Không rõ"
                }`}
                secondary={`Số lượng: ${item.quantity} - ${
                  (item.productVariant?.discountPrice || 0) * item.quantity
                } VND`}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="h6" color="error">
          ⚠️ Không có sản phẩm nào trong giỏ hàng!
        </Typography>
      )}

      <Typography variant="h6" mt={4}>
        Tổng tiền: {totalAmount.toLocaleString()} VND
      </Typography>

      {isLoggedIn ? (
        <Box mt={4}>
          <Typography variant="h6">Địa chỉ giao hàng</Typography>
          <Typography>{address || "Chưa có địa chỉ"}</Typography>
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

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4 }}
        onClick={handlePlaceOrder}
        disabled={selectedItems.length === 0}
      >
        Đặt hàng ngay
      </Button>
    </Box>
  );
};

export default Checkout;
