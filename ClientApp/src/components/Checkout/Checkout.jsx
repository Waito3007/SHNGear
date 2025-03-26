import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItems, totalAmount, voucherCode } = location.state || {};
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
  const [paymentMethod, setPaymentMethod] = useState("1"); // 1: Tiền mặt, 2: MoMo
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);

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

    // Load payment methods
    fetchPaymentMethods();
  }, [voucherCode]);

  const fetchAddresses = async (userId) => {
    try {
      const response = await axios.get(`https://localhost:7107/api/address/user/${userId}`);
      setAddresses(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);
    }
  };

  const fetchVoucherId = async (code) => {
    try {
      const response = await axios.get(`https://localhost:7107/api/vouchers/code/${code}`);
      setVoucherId(response.data.id);
    } catch (error) {
      console.error("Lỗi khi lấy voucher:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get("https://localhost:7107/api/PaymentMethod");
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy phương thức thanh toán:", error);
    }
  };

  const handlePlaceOrder = async () => {
    if (userId && !selectedAddress) {
      alert("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    let addressId = selectedAddress ? selectedAddress.id : null;

    if (!userId && !addressId) {
      try {
        setIsLoading(true);
        const response = await axios.post("https://localhost:7107/api/address/add", {
          userId: null,
          ...guestAddress
        });
        addressId = response.data.addressId;
      } catch (error) {
        console.error("Lỗi khi thêm địa chỉ:", error);
        alert("Lỗi khi thêm địa chỉ, vui lòng thử lại.");
        setIsLoading(false);
        return;
      }
    }

    const orderDto = {
      userId: userId || null,
      orderDate: new Date().toISOString(),
      totalAmount: totalAmount,
      orderStatus: "Pending",
      addressId: addressId,
      paymentMethodId: parseInt(paymentMethod),
      orderItems: selectedItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: item.productVariant.discountPrice,
      })),
      voucherId: voucherId || null,
    };

    try {
      setIsLoading(true);
      const response = await axios.post("https://localhost:7107/api/orders", orderDto);
      
      // Xử lý thanh toán MoMo
      if (paymentMethod === "2" && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
        return;
      }
      
      // Xử lý thanh toán tiền mặt
      navigate("/order-success", { state: { orderId: response.data.orderId } });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      alert(error.response?.data?.message || "Lỗi khi tạo đơn hàng, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={4}>
        Đặt hàng
      </Typography>

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
            onChange={(e) =>
              setGuestAddress({ ...guestAddress, fullName: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Số điện thoại"
            variant="outlined"
            fullWidth
            value={guestAddress.phoneNumber}
            onChange={(e) =>
              setGuestAddress({ ...guestAddress, phoneNumber: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Địa chỉ"
            variant="outlined"
            fullWidth
            value={guestAddress.addressLine1}
            onChange={(e) =>
              setGuestAddress({ ...guestAddress, addressLine1: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Địa chỉ bổ sung"
            variant="outlined"
            fullWidth
            value={guestAddress.addressLine2}
            onChange={(e) =>
              setGuestAddress({ ...guestAddress, addressLine2: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Thành phố"
            variant="outlined"
            fullWidth
            value={guestAddress.city}
            onChange={(e) =>
              setGuestAddress({ ...guestAddress, city: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Tỉnh/Thành"
            variant="outlined"
            fullWidth
            value={guestAddress.state}
            onChange={(e) =>
              setGuestAddress({ ...guestAddress, state: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Mã bưu điện"
            variant="outlined"
            fullWidth
            value={guestAddress.zipCode}
            onChange={(e) =>
              setGuestAddress({ ...guestAddress, zipCode: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quốc gia"
            variant="outlined"
            fullWidth
            value={guestAddress.country}
            onChange={(e) =>
              setGuestAddress({ ...guestAddress, country: e.target.value })
            }
            sx={{ mb: 2 }}
          />
        </>
      )}

      <Typography variant="h6" mt={4}>Phương thức thanh toán</Typography>
      <RadioGroup
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        {paymentMethods.map((method) => (
          <FormControlLabel
            key={method.id}
            value={method.id.toString()}
            control={<Radio />}
            label={method.name}
          />
        ))}
      </RadioGroup>

      {paymentMethod === "2" && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Bạn sẽ được chuyển hướng đến trang thanh toán MoMo sau khi xác nhận đơn hàng
        </Typography>
      )}

      <Typography variant="h6" mt={4}>Thông tin đơn hàng</Typography>
      <List>
        {selectedItems.map((item) => (
          <ListItem key={item.productVariantId}>
            <ListItemText
              primary={`${item.productVariant?.color} - ${item.productVariant?.storage}`}
              secondary={`Số lượng: ${item.quantity} - ${(item.productVariant?.discountPrice * item.quantity).toLocaleString()} VND`}
            />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" mt={2}>
        Tổng tiền: {totalAmount.toLocaleString()} VND
      </Typography>
      <Typography variant="h6" mt={2}>
        Tổng tiền: {totalAmount.toLocaleString()} VND
      </Typography>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4 }}
        onClick={handlePlaceOrder}
        disabled={isLoading}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : paymentMethod === "2" ? (
          "Thanh toán với MoMo"
        ) : (
          "Đặt hàng ngay"
        )}
      </Button>
    </Box>
  );
};

export default Checkout;
