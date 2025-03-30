import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  ListItemAvatar,
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Divider,
  Alert
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    selectedItems = [], 
    totalAmount = 0, 
    voucherCode = "", 
    discountAmount = 0  // Thêm discountAmount từ giỏ hàng
  } = location.state || {};
  
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
  const [paymentMethod, setPaymentMethod] = useState("1"); // 1 = Tiền mặt, 2 = MoMo
  const [momoPaymentType, setMomoPaymentType] = useState("qr"); // qr hoặc card
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [error, setError] = useState(null);
  const [finalAmount, setFinalAmount] = useState(totalAmount);

  useEffect(() => {
    // Xử lý đăng nhập người dùng
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

    // Xử lý voucher nếu có
    if (voucherCode) {
      fetchVoucherId(voucherCode);
    }

    // Lấy danh sách phương thức thanh toán
    fetchPaymentMethods();
  }, [voucherCode]);

  const fetchAddresses = async (userId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/address/user/${userId}`);
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);
      setError("Lỗi khi tải địa chỉ giao hàng");
    }
  };

  const fetchVoucherId = async (code) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/vouchers/code/${code}`);
      setVoucherId(response.data.id);
    } catch (error) {
      console.error("Lỗi khi lấy voucher:", error);
      setError("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/PaymentMethod`);
      // Chỉ lấy phương thức tiền mặt và MoMo (loại bỏ VNPay nếu có)
      const filteredMethods = response.data.filter(method => method.id !== 3);
      setPaymentMethods(filteredMethods);
    } catch (error) {
      console.error("Lỗi khi lấy phương thức thanh toán:", error);
      setError("Lỗi khi tải phương thức thanh toán");
    }
  };

  const handlePlaceOrder = async () => {
    setError(null);

    if (userId && !selectedAddress) {
      setError("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    let addressId = selectedAddress ? selectedAddress.id : null;

    if (!userId && !addressId) {
      // Validate guest address
      if (!guestAddress.fullName || !guestAddress.phoneNumber || !guestAddress.addressLine1 || 
          !guestAddress.city || !guestAddress.state || !guestAddress.country) {
        setError("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/address/add`, {
          userId: null,
          ...guestAddress
        });
        addressId = response.data.addressId;
      } catch (error) {
        console.error("Lỗi khi thêm địa chỉ:", error);
        setError("Lỗi khi thêm địa chỉ, vui lòng thử lại.");
        setIsLoading(false);
        return;
      }
    }

    const orderDto = {
      userId: userId || null,
      orderDate: new Date().toISOString(),
      totalAmount: finalAmount,
      orderStatus: "Pending",
      addressId: addressId,
      paymentMethodId: parseInt(paymentMethod),
      orderItems: selectedItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: item.productDiscountPrice || item.productPrice,
      })),
      voucherId: voucherId || null,
    };

    try {
      setIsLoading(true);
      
      const headers = { 'Content-Type': 'application/json' };
      
      // Thêm header nếu là thanh toán MoMo bằng thẻ
      if (paymentMethod === "2" && momoPaymentType === "card") {
        headers['Payment-Method'] = 'card';
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/orders`, 
        orderDto, 
        { headers }
      );
      
      // Chuyển hướng nếu là thanh toán MoMo
      if (paymentMethod === "2" && response.data.paymentUrl) {
        localStorage.setItem("currentOrder", JSON.stringify({
          orderId: response.data.orderId,
          paymentMethod: paymentMethod
        }));
        
        window.location.href = response.data.paymentUrl;
        return;
      }
      
      // Nếu là thanh toán tiền mặt
      navigate("/order-confirmation", { state: { orderId: response.data.orderId } });
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      setError(error.response?.data?.message || "Lỗi khi tạo đơn hàng, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" mb={4} sx={{ fontWeight: 'bold' }}>
        Thanh toán
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Left column - Delivery and Payment */}
        <Box sx={{ flex: 2 }}>
          {/* Delivery Address */}
          <Box sx={{ mb: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Thông tin giao hàng
            </Typography>
            
            {userId ? (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Chọn địa chỉ giao hàng
                </Typography>
                <RadioGroup
                  value={selectedAddress?.id || ""}
                  onChange={(e) => {
                    const address = addresses.find(a => a.id === parseInt(e.target.value));
                    setSelectedAddress(address);
                  }}
                >
                  {addresses.map((address) => (
                    <Box key={address.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <FormControlLabel
                        value={address.id.toString()}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography><strong>{address.fullName}</strong> - {address.phoneNumber}</Typography>
                            <Typography variant="body2">
                              {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                              {address.city}, {address.state}, {address.country}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </RadioGroup>
              </>
            ) : (
              <>
                <TextField
                  label="Họ và tên"
                  variant="outlined"
                  fullWidth
                  required
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
                  required
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
                  required
                  value={guestAddress.addressLine1}
                  onChange={(e) =>
                    setGuestAddress({ ...guestAddress, addressLine1: e.target.value })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Địa chỉ bổ sung (tùy chọn)"
                  variant="outlined"
                  fullWidth
                  value={guestAddress.addressLine2}
                  onChange={(e) =>
                    setGuestAddress({ ...guestAddress, addressLine2: e.target.value })
                  }
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Thành phố"
                    variant="outlined"
                    fullWidth
                    required
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
                    required
                    value={guestAddress.state}
                    onChange={(e) =>
                      setGuestAddress({ ...guestAddress, state: e.target.value })
                    }
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
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
                    required
                    value={guestAddress.country}
                    onChange={(e) =>
                      setGuestAddress({ ...guestAddress, country: e.target.value })
                    }
                    sx={{ mb: 2 }}
                  />
                </Box>
              </>
            )}
          </Box>

          {/* Payment Method */}
          <Box sx={{ mb: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Phương thức thanh toán
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <Box key={method.id} sx={{ mb: 1, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <FormControlLabel
                    value={method.id.toString()}
                    control={<Radio />}
                    label={
                      <Typography>{method.name}</Typography>
                    }
                    sx={{ marginLeft: 0 }}
                  />
                  {method.id === 2 && paymentMethod === "2" && (
                    <Box sx={{ mt: 1, pl: 4 }}>
                      <RadioGroup
                        value={momoPaymentType}
                        onChange={(e) => setMomoPaymentType(e.target.value)}
                        row
                      >
                        <FormControlLabel
                          value="qr"
                          control={<Radio size="small" />}
                          label="Quét QR Code"
                        />
                        <FormControlLabel
                          value="card"
                          control={<Radio size="small" />}
                          label="Thẻ Visa/MasterCard"
                        />
                      </RadioGroup>
                    </Box>
                  )}
                </Box>
              ))}
            </RadioGroup>

            {paymentMethod === "2" && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {momoPaymentType === "card" 
                  ? "Bạn sẽ được chuyển hướng đến trang thanh toán bằng thẻ Visa/MasterCard" 
                  : "Bạn sẽ được chuyển hướng đến trang thanh toán QR MoMo"}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right column - Order Summary */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Đơn hàng của bạn
            </Typography>
            
            <List sx={{ mb: 2 }}>
              {selectedItems.map((item) => (
                <ListItem key={item.productVariantId} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={item.productImage} 
                      alt={item.productName}
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        mr: 2,
                        borderRadius: '4px',
                      }}
                      variant="square"
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${item.productName}`}
                    secondary={`${item.variantColor} - ${item.variantStorage}`}
                  />
                  <Typography variant="body2">
                    {item.quantity} × {(item.productDiscountPrice || item.productPrice).toLocaleString()}₫
                  </Typography>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Voucher */}
            {voucherCode && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  Mã giảm giá: {voucherCode}
                </Typography>
                <Typography variant="body1" color="success.main">
                  -{discountAmount.toLocaleString()}₫
                </Typography>
              </Box>
            )}

            {/* Order Summary */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tạm tính:</Typography>
                <Typography>{(totalAmount + discountAmount).toLocaleString()}₫</Typography>
              </Box>
              {discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Giảm giá:</Typography>
                  <Typography color="success.main">-{discountAmount.toLocaleString()}₫</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Tổng cộng:</Typography>
                <Typography variant="h6" color="error">
                  {totalAmount.toLocaleString()}₫
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="error"
              fullWidth
              size="large"
              onClick={handlePlaceOrder}
              disabled={isLoading || selectedItems.length === 0}
              sx={{ mt: 2 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : paymentMethod === "2" ? (
                momoPaymentType === "card" ? "Thanh toán bằng thẻ Visa/MasterCard" : "Thanh toán bằng QR MoMo"
              ) : (
                "Thanh toán với Tiền Mặt"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Checkout;