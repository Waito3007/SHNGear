<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, List, ListItem, ListItemText } from "@mui/material";
=======
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
>>>>>>> 3c1091f (cập nhật 1 tý)
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
<<<<<<< HEAD
  const { selectedItems, totalAmount, voucherCode } = location.state || {};
=======
  const selectedItems = location.state?.selectedItems || []; // Kiểm tra nếu undefined
  const totalAmount = location.state?.totalAmount || 0;
  const voucherCode = location.state?.voucherCode || null;

>>>>>>> 3c1091f (cập nhật 1 tý)
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
    country: ""
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
<<<<<<< HEAD
      console.log(`Fetching addresses for userId: ${userId}`);
      const response = await axios.get(`https://localhost:7107/api/address/user/${userId}`);
      console.log("Addresses fetched:", response.data);
      setAddresses(response.data);
=======
      const response = await axios.get(
        `https://localhost:7107/api/Users/${userId}/address`
      );
      setAddress(response.data.address || "Chưa có địa chỉ");
>>>>>>> 3c1091f (cập nhật 1 tý)
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);
    }
  };

  const fetchVoucherId = async (code) => {
    try {
      console.log(`Fetching voucherId for code: ${code}`);
      const response = await axios.get(`https://localhost:7107/api/vouchers/code/${code}`);
      console.log("Voucher fetched:", response.data);
      setVoucherId(response.data.id);
    } catch (error) {
      console.error("Lỗi khi lấy voucher:", error);
    }
  };

  const handlePlaceOrder = async () => {
<<<<<<< HEAD
    if (userId && !selectedAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    let addressId = selectedAddress ? selectedAddress.id : null;

    if (!userId && !addressId) {
      try {
        console.log("Adding guest address:", guestAddress);
        const response = await axios.post("https://localhost:7107/api/address/add", {
          userId: null, // Để null cho khách chưa đăng nhập
          ...guestAddress
        });
        console.log("Guest address added:", response.data);
        addressId = response.data.addressId;
      } catch (error) {
        console.error("Lỗi khi thêm địa chỉ:", error);
        console.error("Phản hồi lỗi từ API:", error.response?.data);
        if (error.response && error.response.data && error.response.data.errors) {
          console.error("Chi tiết lỗi xác thực:", error.response.data.errors);
        }
        alert("Lỗi khi thêm địa chỉ, vui lòng thử lại.");
        return;
      }
    }

    const orderDto = {
      userId: userId || null, // Đảm bảo userId là null nếu không có
      orderDate: new Date().toISOString(),
      totalAmount: totalAmount,
      orderStatus: "Pending",
      addressId: addressId,
      paymentMethodId: 1, // Giả sử PaymentMethodId là 1
      orderItems: selectedItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: item.productVariant.discountPrice,
=======
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
>>>>>>> 3c1091f (cập nhật 1 tý)
      })),
      voucherId: voucherId ? voucherId : null,
    };

    console.log("Đơn hàng:", orderDto);

    try {
<<<<<<< HEAD
      const response = await axios.post("https://localhost:7107/api/orders", orderDto);
      console.log("Order created:", response.data);
=======
      const response = await axios.post(
        "https://localhost:7107/api/orders",
        orderDto
      );
>>>>>>> 3c1091f (cập nhật 1 tý)
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
<<<<<<< HEAD
      <Typography variant="h4" mb={4}>Đặt hàng</Typography>

      {userId ? (
        <>
          <Typography variant="h6">Chọn địa chỉ giao hàng</Typography>
          <List>
            {addresses.map((address) => (
              <ListItem
                key={address.id}
                button
                selected={selectedAddress?.id === address.id}
                onClick={() => setSelectedAddress(address)}
              >
                <ListItemText
                  primary={`${address.fullName} - ${address.phoneNumber}`}
                  secondary={`${address.addressLine1}, ${address.city}, ${address.state}, ${address.country}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <>
          <Typography variant="h6">Nhập địa chỉ giao hàng</Typography>
          <TextField
            label="Họ và tên"
            variant="outlined"
            fullWidth
            value={guestAddress.fullName}
            onChange={(e) => setGuestAddress({ ...guestAddress, fullName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Số điện thoại"
            variant="outlined"
            fullWidth
            value={guestAddress.phoneNumber}
            onChange={(e) => setGuestAddress({ ...guestAddress, phoneNumber: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Địa chỉ"
            variant="outlined"
            fullWidth
            value={guestAddress.addressLine1}
            onChange={(e) => setGuestAddress({ ...guestAddress, addressLine1: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Địa chỉ bổ sung"
            variant="outlined"
            fullWidth
            value={guestAddress.addressLine2}
            onChange={(e) => setGuestAddress({ ...guestAddress, addressLine2: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Thành phố"
            variant="outlined"
            fullWidth
            value={guestAddress.city}
            onChange={(e) => setGuestAddress({ ...guestAddress, city: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Tỉnh/Thành"
            variant="outlined"
            fullWidth
            value={guestAddress.state}
            onChange={(e) => setGuestAddress({ ...guestAddress, state: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Mã bưu điện"
            variant="outlined"
            fullWidth
            value={guestAddress.zipCode}
            onChange={(e) => setGuestAddress({ ...guestAddress, zipCode: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quốc gia"
            variant="outlined"
            fullWidth
            value={guestAddress.country}
            onChange={(e) => setGuestAddress({ ...guestAddress, country: e.target.value })}
            sx={{ mb: 2 }}
          />
        </>
      )}

      <Typography variant="h6" mt={4}>Thông tin đơn hàng</Typography>
      <List>
        {selectedItems.map((item) => (
          <ListItem key={item.productVariantId}>
            <ListItemText
              primary={`${item.productVariant?.color} - ${item.productVariant?.storage}`}
              secondary={`Số lượng: ${item.quantity} - ${item.productVariant?.discountPrice * item.quantity} VND`}
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" mt={2}>Tổng tiền: {totalAmount.toLocaleString()} VND</Typography>

=======
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

>>>>>>> 3c1091f (cập nhật 1 tý)
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4 }}
        onClick={handlePlaceOrder}
<<<<<<< HEAD
=======
        disabled={selectedItems.length === 0}
>>>>>>> 3c1091f (cập nhật 1 tý)
      >
        Đặt hàng ngay
      </Button>
    </Box>
  );
};

export default Checkout;
