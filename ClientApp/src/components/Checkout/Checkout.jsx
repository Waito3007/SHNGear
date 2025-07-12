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
  Alert,
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
    discountAmount = 0,
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
  const [paymentMethod, setPaymentMethod] = useState("1"); // 1 = Tiền mặt, 2 = MoMo, 3 = PayPal
  const [momoPaymentType, setMomoPaymentType] = useState("qr");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [error, setError] = useState(null);
  const [finalAmount, setFinalAmount] = useState(totalAmount);

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

    fetchPaymentMethods();
  }, [voucherCode]);

  const fetchAddresses = async (userId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/address/user/${userId}`
      );
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
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/vouchers/code/${code}`
      );
      setVoucherId(response.data.id);
    } catch (error) {
      console.error("Lỗi khi lấy voucher:", error);
      setError("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/PaymentMethod`
      );
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy phương thức thanh toán:", error);
      setError("Lỗi khi tải phương thức thanh toán");
    }
  };

  const removePaidItemsFromCart = async () => {
    if (!userId) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/cart/remove-paid-items?userId=${userId}`
      );
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm đã thanh toán:", error);
    }
  };

  const removeGuestCartItems = () => {
    const sessionCart = sessionStorage.getItem("Cart");
    if (!sessionCart) return;

    const cartItems = JSON.parse(sessionCart) || [];
    const paidProductVariantIds = selectedItems.map(
      (item) => item.productVariantId
    );
    const remainingItems = cartItems.filter(
      (item) => !paidProductVariantIds.includes(item.productVariantId)
    );

    sessionStorage.setItem("Cart", JSON.stringify(remainingItems));
  };
  const handlePlaceOrder = async () => {
    setError(null);

    // Xử lý giỏ hàng cho cả khách và người dùng đã đăng nhập
    if (!userId) {
      removeGuestCartItems();
    } else {
      await removePaidItemsFromCart();
    }

    if (userId && !selectedAddress) {
      setError("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    let addressId = selectedAddress ? selectedAddress.id : null;

    if (!userId && !addressId) {
      if (
        !guestAddress.fullName ||
        !guestAddress.phoneNumber ||
        !guestAddress.addressLine1 ||
        !guestAddress.city ||
        !guestAddress.state ||
        !guestAddress.country
      ) {
        setError("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/address/add`,
          {
            userId: null,
            ...guestAddress,
          }
        );
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

      const headers = { "Content-Type": "application/json" };

      if (paymentMethod === "2" && momoPaymentType === "card") {
        headers["Payment-Method"] = "card";
      }

      // Handle PayPal payment
      if (paymentMethod === "3") {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/paypal/create-order`,
          orderDto,
          { headers }
        );

        if (response.data.approvalUrl) {
          // Lưu thông tin đơn hàng để sử dụng sau khi thanh toán thành công
          localStorage.setItem(
            "currentOrder",
            JSON.stringify({
              orderId: response.data.orderId,
              paymentMethod: paymentMethod,
              orderItems: selectedItems,
              totalAmount: totalAmount,
              discountAmount: discountAmount,
              voucherCode: voucherCode,
              finalAmount: finalAmount,
              paymentMethodName: "PayPal",
            })
          );
          window.location.href = response.data.approvalUrl;
          return;
        }
      }

      // Handle MoMo payment
      else if (paymentMethod === "2") {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/orders`,
          orderDto,
          { headers }
        );

        if (response.data.paymentUrl) {
          localStorage.setItem(
            "currentOrder",
            JSON.stringify({
              orderId: response.data.orderId,
              paymentMethod: paymentMethod,
              orderItems: selectedItems,
              totalAmount: totalAmount,
              discountAmount: discountAmount,
              voucherCode: voucherCode,
              finalAmount: finalAmount,
              paymentMethodName:
                momoPaymentType === "card"
                  ? "MoMo - Thẻ Visa/MasterCard"
                  : "MoMo - QR Code",
            })
          );

          window.location.href = response.data.paymentUrl;
          return;
        }
      }
      // Handle cash payment
      else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/orders`,
          orderDto,
          { headers }
        );
        navigate("/payment-success", {
          state: {
            orderId: response.data.orderId,
            orderItems: selectedItems,
            totalAmount: totalAmount,
            discountAmount: discountAmount,
            voucherCode: voucherCode,
            finalAmount: finalAmount,
            paymentMethodName:
              paymentMethods.find((pm) => pm.id.toString() === paymentMethod)
                ?.name || "Tiền mặt",
          },
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      setError(
        error.response?.data?.message ||
          "Lỗi khi tạo đơn hàng, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, margin: "0 auto" }}>
      <Typography variant="h4" mb={4} sx={{ fontWeight: "bold" }}>
        Thanh toán
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 4 }}>
        <Box sx={{ flex: 2 }}>
          <Box
            sx={{ mb: 4, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
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
                    const address = addresses.find(
                      (a) => a.id === parseInt(e.target.value)
                    );
                    setSelectedAddress(address);
                  }}
                >
                  {addresses.map((address) => (
                    <Box
                      key={address.id}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                      }}
                    >
                      <FormControlLabel
                        value={address.id.toString()}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography>
                              <strong>{address.fullName}</strong> -{" "}
                              {address.phoneNumber}
                            </Typography>
                            <Typography variant="body2">
                              {address.addressLine1},{" "}
                              {address.addressLine2 &&
                                `${address.addressLine2}, `}
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
                    setGuestAddress({
                      ...guestAddress,
                      fullName: e.target.value,
                    })
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
                    setGuestAddress({
                      ...guestAddress,
                      phoneNumber: e.target.value,
                    })
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
                    setGuestAddress({
                      ...guestAddress,
                      addressLine1: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Địa chỉ bổ sung (tùy chọn)"
                  variant="outlined"
                  fullWidth
                  value={guestAddress.addressLine2}
                  onChange={(e) =>
                    setGuestAddress({
                      ...guestAddress,
                      addressLine2: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
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
                      setGuestAddress({
                        ...guestAddress,
                        state: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="Mã bưu điện"
                    variant="outlined"
                    fullWidth
                    value={guestAddress.zipCode}
                    onChange={(e) =>
                      setGuestAddress({
                        ...guestAddress,
                        zipCode: e.target.value,
                      })
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
                      setGuestAddress({
                        ...guestAddress,
                        country: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                </Box>
              </>
            )}
          </Box>

          <Box
            sx={{ mb: 4, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Phương thức thanh toán
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <Box
                  key={method.id}
                  sx={{
                    mb: 1,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                  }}
                >
                  <FormControlLabel
                    value={method.id.toString()}
                    control={<Radio />}
                    label={<Typography>{method.name}</Typography>}
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

            {paymentMethod === "3" && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Bạn sẽ được chuyển hướng đến trang thanh toán PayPal
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Đơn hàng của bạn
            </Typography>

            <List sx={{ mb: 2 }}>
              {selectedItems.map((item) => (
                <ListItem key={item.productVariantId} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <img
                      src={
                        item.productImage.startsWith("http")
                          ? item.productImage
                          : `${process.env.REACT_APP_API_BASE_URL}/${item.productImage}`
                      }
                      alt="Product img"
                      className="size-10"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/50";
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${item.productName}`}
                    secondary={`${item.variantColor} - ${item.variantStorage}`}
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {item.quantity} × 
                      {item.isFlashSale && item.productPrice !== item.productDiscountPrice ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: '4px' }}>
                            {item.productPrice.toLocaleString()}₫
                          </span>
                          <br />
                          <span style={{ color: '#f44336', fontWeight: 'bold' }}>
                            {item.productDiscountPrice.toLocaleString()}₫
                          </span>
                          <span style={{ backgroundColor: '#f44336', color: 'white', fontSize: '10px', padding: '2px 4px', marginLeft: '4px', borderRadius: '2px' }}>
                            FLASH SALE
                          </span>
                        </>
                      ) : item.productDiscountPrice && item.productPrice !== item.productDiscountPrice ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: '4px' }}>
                            {item.productPrice.toLocaleString()}₫
                          </span>
                          <br />
                          <span style={{ color: '#f44336', fontWeight: 'bold' }}>
                            {item.productDiscountPrice.toLocaleString()}₫
                          </span>
                        </>
                      ) : (
                        <span style={{ marginLeft: '4px' }}>
                          {item.productPrice.toLocaleString()}₫
                        </span>
                      )}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

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

            <Box sx={{ mb: 2 }}>
              {/* Tính toán tổng giá gốc và tiết kiệm */}
              {(() => {
                const originalTotal = selectedItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0);
                const currentTotal = selectedItems.reduce((sum, item) => sum + ((item.productDiscountPrice || item.productPrice) * item.quantity), 0);
                const productSavings = originalTotal - currentTotal;
                const finalTotal = currentTotal - discountAmount;
                
                return (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography>Tổng giá gốc:</Typography>
                      <Typography>
                        {originalTotal.toLocaleString()}₫
                      </Typography>
                    </Box>
                    {productSavings > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography>Tiết kiệm từ sản phẩm:</Typography>
                        <Typography color="success.main">
                          -{productSavings.toLocaleString()}₫
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography>Tạm tính:</Typography>
                      <Typography>
                        {currentTotal.toLocaleString()}₫
                      </Typography>
                    </Box>
                    {discountAmount > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography>Giảm giá từ voucher:</Typography>
                        <Typography color="success.main">
                          -{discountAmount.toLocaleString()}₫
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="h6">Tổng cộng:</Typography>
                      <Typography variant="h6" color="error">
                        {finalTotal.toLocaleString()}₫
                      </Typography>
                    </Box>
                    {(productSavings + discountAmount) > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" color="success.main">
                          Tổng tiết kiệm: {(productSavings + discountAmount).toLocaleString()}₫
                        </Typography>
                      </Box>
                    )}
                  </>
                );
              })()}
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
                momoPaymentType === "card" ? (
                  "Thanh toán bằng thẻ Visa/MasterCard"
                ) : (
                  "Thanh toán bằng QR MoMo"
                )
              ) : paymentMethod === "3" ? (
                "Thanh toán bằng PayPal"
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
