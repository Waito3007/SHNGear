import React, { useEffect, useState } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItemText,
  Avatar,
  Typography,
  Button,
  Box,
  TextField,
  Modal,
  Checkbox,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  X,
  Delete,
  Plus,
  Minus,
  Gift,
  Monitor,
  Activity,
  Wifi,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const CartDrawer = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Update time every second for tech feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);

      try {
        let items = [];
        let id = null;

        if (token) {
          const decoded = jwtDecode(token);
          id = parseInt(decoded.sub, 10);
          setUserId(id);

          // Lấy cả giỏ hàng từ API và session storage nếu có
          const [apiResponse, sessionCart] = await Promise.all([
            axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/Cart?userId=${id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            sessionStorage.getItem("cart"),
          ]);

          items = apiResponse.data;

          // Merge với giỏ hàng từ session nếu có
          if (sessionCart) {
            const sessionItems = JSON.parse(sessionCart);
            const mergedItems = await mergeCartItems(items, sessionItems);
            items = mergedItems;
            sessionStorage.removeItem("cart");
          }
        } else {
          // Chưa đăng nhập: lấy từ session storage
          const sessionCart = sessionStorage.getItem("cart");
          if (sessionCart) {
            const sessionItems = JSON.parse(sessionCart);
            items = await Promise.all(
              sessionItems.map(async (item) => {
                try {
                  const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/Cart/variant-info/${item.productVariantId}`
                  );
                  return {
                    ...item,
                    productName: response.data.productName,
                    productImage: response.data.productImage,
                    variantColor: response.data.variantColor,
                    variantStorage: response.data.variantStorage,
                    productPrice: response.data.price,
                    productDiscountPrice: response.data.discountPrice,
                  };
                } catch (error) {
                  console.error("Error fetching variant info:", error);
                  return {
                    ...item,
                    productName: "Sản phẩm không tên",
                    productImage: "https://via.placeholder.com/100",
                    variantColor: "Không xác định",
                    variantStorage: "Không xác định",
                    productPrice: 0,
                    productDiscountPrice: 0,
                  };
                }
              })
            );
          }
        }

        setCartItems(items);
        setSelectedItems(items);
        calculateTotalAmount(items, discountAmount);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    const mergeCartItems = async (apiItems, sessionItems) => {
      // Gộp các sản phẩm trùng nhau
      const merged = [...apiItems];

      for (const sessionItem of sessionItems) {
        const existingItem = merged.find(
          (item) => item.productVariantId === sessionItem.productVariantId
        );

        if (existingItem) {
          existingItem.quantity += sessionItem.quantity;
        } else {
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/Cart/variant-info/${sessionItem.productVariantId}`
            );
            merged.push({
              ...sessionItem,
              productName: response.data.productName,
              productImage: response.data.productImage,
              variantColor: response.data.variantColor,
              variantStorage: response.data.variantStorage,
              productPrice: response.data.price,
              productDiscountPrice: response.data.discountPrice,
            });
          } catch (error) {
            console.error("Error fetching variant info:", error);
          }
        }
      }

      return merged;
    };

    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  // Sửa lỗi: Cập nhật hàm calculateTotalAmount để nhận discountAmount như một tham số
  const calculateTotalAmount = (items, discount = discountAmount) => {
    const total = items.reduce((sum, item) => {
      const price = item.productDiscountPrice || item.productPrice;
      return sum + price * item.quantity;
    }, 0);

    setOriginalTotal(total);
    setTotalAmount(total - discount); // Áp dụng giảm giá vào tổng tiền
  };

  const handleRemoveItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const numericId = Number(id);

      if (token && userId) {
        await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/api/Cart/remove/${numericId}?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        const sessionCart = sessionStorage.getItem("cart");
        if (sessionCart) {
          const updatedCart = JSON.parse(sessionCart).filter(
            (item) => item.productVariantId !== numericId
          );
          sessionStorage.setItem("cart", JSON.stringify(updatedCart));
        }
      }

      const updatedItems = cartItems.filter(
        (item) => item.productVariantId !== numericId
      );
      setCartItems(updatedItems);
      setSelectedItems(updatedItems);
      calculateTotalAmount(updatedItems);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Sửa lỗi: Cập nhật hàm handleApplyVoucher để tính lại totalAmount
  const handleApplyVoucher = async () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để tận hưởng ưu đãi.");
      return;
    }

    if (voucherApplied) {
      alert("Voucher đã được áp dụng.");
      return;
    }

    setVoucherLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/vouchers/apply`,
        {
          code: voucherCode,
          userId,
        }
      );

      const newDiscountAmount = response.data.discountAmount;
      setDiscountAmount(newDiscountAmount);
      setVoucherApplied(true);

      // Tính toán lại tổng tiền với giá trị giảm giá mới
      calculateTotalAmount(selectedItems, newDiscountAmount);
    } catch (error) {
      console.error("Error applying voucher:", error);
      alert(
        error.response?.data?.message || "Voucher không hợp lệ hoặc đã hết hạn."
      );
    } finally {
      setVoucherLoading(false);
    }
  };

  // Sửa lỗi: Cập nhật hàm handleRemoveVoucher để tính lại totalAmount
  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setDiscountAmount(0);
    setVoucherApplied(false);
    calculateTotalAmount(selectedItems, 0); // Đặt discount = 0
  };

  const handlePlaceOrder = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }
    navigate("/checkout", {
      state: {
        selectedItems,
        totalAmount,
        originalTotal,
        discountAmount,
        voucherCode: voucherApplied ? voucherCode : null,
      },
    });
  };

  const handleQuantityChange = (item) => {
    setSelectedItem(item);
    setQuantityModalOpen(true);
  };

  const updateQuantity = async (newQuantity) => {
    if (!selectedItem) return;

    const updatedItems = cartItems
      .map((item) =>
        item.productVariantId === selectedItem.productVariantId
          ? { ...item, quantity: newQuantity }
          : item
      )
      .filter((item) => item.quantity > 0);

    try {
      const token = localStorage.getItem("token");
      if (token && userId) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/Cart/update`,
          {
            userId,
            productVariantId: selectedItem.productVariantId,
            quantity: newQuantity,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        sessionStorage.setItem("cart", JSON.stringify(updatedItems));
      }

      setCartItems(updatedItems);
      setSelectedItems(updatedItems);
      calculateTotalAmount(updatedItems);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleIncreaseQuantity = () => {
    if (!selectedItem) return;
    const newQuantity = selectedItem.quantity + 1;
    updateQuantity(newQuantity);
  };

  const handleDecreaseQuantity = () => {
    if (!selectedItem) return;
    const newQuantity = Math.max(1, selectedItem.quantity - 1);
    updateQuantity(newQuantity);
  };

  // Sửa lỗi: Cập nhật hàm handleSelectItem để tính lại totalAmount với discountAmount hiện tại
  const handleSelectItem = (item) => {
    const isSelected = selectedItems.some(
      (selectedItem) => selectedItem.productVariantId === item.productVariantId
    );
    const updatedSelectedItems = isSelected
      ? selectedItems.filter(
          (selectedItem) =>
            selectedItem.productVariantId !== item.productVariantId
        )
      : [...selectedItems, item];

    setSelectedItems(updatedSelectedItems);
    calculateTotalAmount(updatedSelectedItems, discountAmount);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 550 },
          p: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          border: "3px solid black",
          boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
          position: "relative",
          overflow: "hidden",
        },
      }}
    >
      {/* Tech Grid Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          zIndex: 0,
        }}
      />

      {/* Tech Corner Indicators */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          width: 16,
          height: 16,
          borderLeft: "2px solid black",
          borderTop: "2px solid black",
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 16,
          height: 16,
          borderRight: "2px solid black",
          borderTop: "2px solid black",
          zIndex: 1,
        }}
      />

      {/* Tech Header */}
      <Box
        sx={{
          position: "relative",
          backgroundColor: "black",
          color: "white",
          p: 3,
          borderBottom: "2px solid black",
          zIndex: 2,
        }}
      >
        {/* Tech pattern background */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "12px 12px",
          }}
        />

        {/* Status Indicators */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                backgroundColor: "#22c55e",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                backgroundColor: "#eab308",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
                animationDelay: "0.5s",
              }}
            />
            <Box
              sx={{
                width: 8,
                height: 8,
                backgroundColor: "#ef4444",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
                animationDelay: "1s",
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Wifi size={16} color="#22c55e" />
            <Monitor size={16} color="white" />
            <Activity size={16} color="#3b82f6" />
          </Box>
        </Box>

        {/* Header Content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ShoppingCart size={24} />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  letterSpacing: "0.1em",
                  fontSize: "1.1rem",
                }}
              >
                GIỎ HÀNG
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.15em",
                }}
              >
                v2.0 CÔNG NGHỆ |{" "}
                {currentTime.toLocaleTimeString("vi-VN", { hour12: false })}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid white",
              },
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        {/* Animated scan line */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
            animation: "pulse 2s infinite",
          }}
        />
      </Box>

      {loading ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          flexGrow={1}
          sx={{ position: "relative", zIndex: 2 }}
        >
          <Box sx={{ position: "relative", mb: 2 }}>
            <CircularProgress
              sx={{
                color: "black",
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                SYS
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              color: "black",
              letterSpacing: "0.1em",
              textAlign: "center",
            }}
          >
            ĐANG TẢI DỮ LIỆU GIỎ HÀNG...
          </Typography>
        </Box>
      ) : cartItems.length > 0 ? (
        <>
          <List
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              px: 2,
              py: 1,
              position: "relative",
              zIndex: 2,
            }}
          >
            {cartItems.map((item, index) => (
              <Box
                key={item.productVariantId}
                sx={{
                  p: 2,
                  border: "2px solid black",
                  borderRadius: 0,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  backgroundColor: "white",
                  boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
                    transform: "translate(-2px, -2px)",
                  },
                }}
              >
                {/* Tech pattern overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 32,
                    height: 32,
                    borderRight: "2px solid rgba(0,0,0,0.1)",
                    borderTop: "2px solid rgba(0,0,0,0.1)",
                    opacity: 0.2,
                  }}
                />

                {/* Item number indicator */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    backgroundColor: "black",
                    color: "white",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </Box>

                <Checkbox
                  checked={selectedItems.some(
                    (selectedItem) =>
                      selectedItem.productVariantId === item.productVariantId
                  )}
                  onChange={() => handleSelectItem(item)}
                  sx={{
                    color: "black",
                    "&.Mui-checked": {
                      color: "black",
                    },
                    "& .MuiSvgIcon-root": {
                      border: "2px solid black",
                      borderRadius: 0,
                    },
                  }}
                />

                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    border: "2px solid black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={
                      item.productImage?.startsWith("http")
                        ? item.productImage
                        : `${process.env.REACT_APP_API_BASE_URL}/${item.productImage}`
                    }
                    alt={item.productName}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      mb: 0.5,
                      color: "black",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.productName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                      fontFamily: "monospace",
                      color: "rgba(0,0,0,0.7)",
                      fontSize: "0.75rem",
                    }}
                  >
                    THÔNG SỐ: {item.variantColor} | {item.variantStorage}
                  </Typography>

                  {item.productDiscountPrice ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: "line-through",
                          color: "rgba(0,0,0,0.5)",
                          fontFamily: "monospace",
                        }}
                      >
                        {(item.productPrice * item.quantity).toLocaleString()}₫
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: "black",
                          backgroundColor: "rgba(0,0,0,0.1)",
                          px: 1,
                          fontFamily: "monospace",
                          border: "1px solid black",
                        }}
                      >
                        {(
                          item.productDiscountPrice * item.quantity
                        ).toLocaleString()}
                        ₫
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: "black",
                        backgroundColor: "rgba(0,0,0,0.1)",
                        px: 1,
                        mb: 1,
                        fontFamily: "monospace",
                        border: "1px solid black",
                        display: "inline-block",
                      }}
                    >
                      {(item.productPrice * item.quantity).toLocaleString()}₫
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                    }}
                    onClick={() => handleQuantityChange(item)}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        color: "black",
                        fontSize: "0.75rem",
                      }}
                    >
                      SỐ LƯỢNG:
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: "black",
                        color: "white",
                        px: 1,
                        py: 0.5,
                        minWidth: 24,
                        textAlign: "center",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontSize: "0.75rem",

                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.8)",
                        },
                      }}
                    >
                      {String(item.quantity).padStart(2, "0")}
                    </Box>
                  </Box>
                </Box>

                <IconButton
                  onClick={() => handleRemoveItem(item.productVariantId)}
                  sx={{
                    color: "black",
                    border: "2px solid black",
                    borderRadius: 0,
                    width: 40,
                    height: 40,
                    "&:hover": {
                      backgroundColor: "black",
                      color: "white",
                    },
                  }}
                >
                  <Delete size={18} />
                </IconButton>
              </Box>
            ))}
          </List>

          {/* Tech Footer Section */}
          <Box
            sx={{
              position: "relative",
              backgroundColor: "white",
              border: "2px solid black",
              borderRadius: 0,
              m: 2,
              overflow: "hidden",
              boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
              zIndex: 2,
            }}
          >
            {/* Tech Grid Background */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "15px 15px",
              }}
            />

            {/* Tech Corner Indicators */}
            <Box
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                width: 12,
                height: 12,
                borderLeft: "2px solid black",
                borderTop: "2px solid black",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 12,
                height: 12,
                borderRight: "2px solid black",
                borderTop: "2px solid black",
              }}
            />

            <Box sx={{ p: 3, position: "relative", zIndex: 1 }}>
              {/* Voucher Section */}
              {userId && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      pb: 2,
                      borderBottom: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        backgroundColor: "black",
                        color: "white",
                        px: 2,
                        py: 1,
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        letterSpacing: "0.1em",
                      }}
                    >
                      <Gift size={16} />
                      VOUCHER
                    </Box>
                    <Box
                      sx={{
                        ml: 2,
                        fontSize: "0.7rem",
                        fontFamily: "monospace",
                        color: "rgba(0,0,0,0.6)",
                      }}
                    >
                      v1.0 HOẠT ĐỘNG
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      placeholder="NHẬP MÃ VOUCHER"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      disabled={voucherApplied}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 0,
                          border: "2px solid black",
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          backgroundColor: voucherApplied
                            ? "rgba(0,0,0,0.05)"
                            : "white",
                          "&:hover": {
                            "& > fieldset": {
                              border: "2px solid black",
                            },
                          },
                          "&.Mui-focused": {
                            "& > fieldset": {
                              border: "2px solid black",
                            },
                          },
                        },
                        "& .MuiInputBase-input": {
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          letterSpacing: "0.05em",
                        },
                        "& .MuiInputBase-input::placeholder": {
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                          opacity: 0.7,
                        },
                      }}
                    />
                    {voucherApplied ? (
                      <Button
                        variant="outlined"
                        onClick={handleRemoveVoucher}
                        sx={{
                          minWidth: "100px",
                          border: "2px solid black",
                          borderRadius: 0,
                          color: "black",
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                          "&:hover": {
                            backgroundColor: "black",
                            color: "white",
                            border: "2px solid black",
                          },
                        }}
                      >
                        XÓA
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleApplyVoucher}
                        disabled={!voucherCode || voucherLoading}
                        sx={{
                          minWidth: "100px",
                          backgroundColor: "black",
                          color: "white",
                          border: "2px solid black",
                          borderRadius: 0,
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                          "&:hover": {
                            backgroundColor: "rgba(0,0,0,0.8)",
                          },
                          "&:disabled": {
                            backgroundColor: "rgba(0,0,0,0.3)",
                            color: "rgba(255,255,255,0.5)",
                          },
                        }}
                      >
                        {voucherLoading ? (
                          <CircularProgress size={16} sx={{ color: "white" }} />
                        ) : (
                          "ÁP DỤNG"
                        )}
                      </Button>
                    )}
                  </Box>

                  {discountAmount > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        p: 2,
                        border: "1px solid rgba(0,0,0,0.2)",
                        backgroundColor: "rgba(0,0,0,0.05)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          color: "black",
                        }}
                      >
                        MÃ ĐÃ QUA SỬ DỤNG:
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          color: "black",
                          backgroundColor: "white",
                          px: 1,
                          py: 0.5,
                          border: "1px solid black",
                        }}
                      >
                        -{discountAmount.toLocaleString()}₫
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      height: "1px",
                      backgroundColor: "black",
                      my: 2,
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "20px",
                        height: "20px",
                        backgroundColor: "white",
                        border: "2px solid black",
                        borderRadius: "50%",
                      }}
                    />
                  </Box>
                </>
              )}

              {/* Calculation Section */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                    py: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      color: "rgba(0,0,0,0.7)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    TẠM TÍNH:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      color: "black",
                    }}
                  >
                    {originalTotal.toLocaleString()}₫
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    border: "2px solid black",
                    backgroundColor: "black",
                    color: "white",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      letterSpacing: "0.1em",
                    }}
                  >
                    TỔNG TIỀN:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                  >
                    {totalAmount.toLocaleString()}₫
                  </Typography>
                </Box>
              </Box>

              {/* Checkout Button */}
              <Button
                fullWidth
                onClick={handlePlaceOrder}
                disabled={selectedItems.length === 0}
                sx={{
                  py: 2,
                  backgroundColor:
                    selectedItems.length === 0 ? "rgba(0,0,0,0.3)" : "black",
                  color: "white",
                  border: "2px solid black",
                  borderRadius: 0,
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  letterSpacing: "0.1em",
                  boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor:
                      selectedItems.length === 0
                        ? "rgba(0,0,0,0.3)"
                        : "rgba(0,0,0,0.8)",
                    boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.3)",
                    transform:
                      selectedItems.length === 0
                        ? "none"
                        : "translate(-2px, -2px)",
                  },
                  "&:disabled": {
                    color: "rgba(255,255,255,0.5)",
                    cursor: "not-allowed",
                  },
                }}
              >
                {selectedItems.length === 0
                  ? "CHỌN SẢN PHẨM ĐỂ TIẾP TỤC"
                  : "THANH TOÁN"}
              </Button>

              {/* Tech Stats Footer */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      backgroundColor: "#22c55e",
                      borderRadius: "50%",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "rgba(0,0,0,0.6)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    GIỎ HÀNG SẴN SÀNG
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.6rem",
                    color: "rgba(0,0,0,0.4)",
                    letterSpacing: "0.05em",
                  }}
                >
                  © SHN GIỎ HÀNG v2.0
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          flexGrow={1}
          textAlign="center"
          p={4}
          sx={{ position: "relative", zIndex: 2 }}
        >
          {/* Tech Empty State */}
          <Box
            sx={{
              position: "relative",
              border: "2px solid black",
              borderRadius: 0,
              p: 4,
              backgroundColor: "white",
              boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
              maxWidth: 400,
              width: "100%",
              overflow: "hidden",
            }}
          >
            {/* Tech Grid Background */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Tech Corner Indicators */}
            <Box
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                width: 12,
                height: 12,
                borderLeft: "2px solid black",
                borderTop: "2px solid black",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 12,
                height: 12,
                borderRight: "2px solid black",
                borderTop: "2px solid black",
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              {/* Status Indicator */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "black",
                    color: "white",
                    px: 3,
                    py: 1,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    letterSpacing: "0.1em",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <ShoppingCart size={16} />
                  HIỆN ĐANG TRỐNG
                </Box>
              </Box>

              {/* Empty Cart Icon */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    border: "2px solid black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.05)",
                  }}
                >
                  <ShoppingCart size={40} color="black" />
                </Box>
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  mb: 2,
                  color: "black",
                  letterSpacing: "0.05em",
                }}
              >
                GIỎ HÀNG TRỐNG
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mb: 3,
                  fontFamily: "monospace",
                  color: "rgba(0,0,0,0.7)",
                  fontSize: "0.8rem",
                  letterSpacing: "0.02em",
                }}
              >
                THÔNG BÁO : KHÔNG CÓ SẢN PHẨM
                <br />
              </Typography>

              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  border: "2px solid black",
                  borderRadius: 0,
                  color: "black",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                  px: 3,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: "black",
                    color: "white",
                    border: "2px solid black",
                  },
                }}
              >
                TIẾP TỤC MUA HÀNG
              </Button>

              {/* System Stats */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 3,
                  pt: 2,
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      backgroundColor: "#eab308",
                      borderRadius: "50%",
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "rgba(0,0,0,0.6)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    CHỜ GIỎ HÀNG
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.6rem",
                    color: "rgba(0,0,0,0.4)",
                    letterSpacing: "0.05em",
                  }}
                >
                  SẢN PHẨM: 00
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <Modal
        open={quantityModalOpen}
        onClose={() => setQuantityModalOpen(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 380,
            backgroundColor: "white",
            border: "3px solid black",
            borderRadius: 0,
            boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)",
            p: 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Tech Grid Background */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.03,
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "15px 15px",
            }}
          />

          {/* Tech Corner Indicators */}
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 12,
              height: 12,
              borderLeft: "2px solid black",
              borderTop: "2px solid black",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 12,
              height: 12,
              borderRight: "2px solid black",
              borderTop: "2px solid black",
            }}
          />

          {/* Header */}
          <Box
            sx={{
              backgroundColor: "black",
              color: "white",
              p: 2,
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  backgroundColor: "white",
                  color: "black",
                  px: 2,
                  py: 1,
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  fontWeight: "bold",
                  letterSpacing: "0.1em",
                }}
              >
                SỐ LƯỢNG
              </Box>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                }}
              >
                v1.0 HOẠT ĐỘNG
              </Typography>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3, position: "relative", zIndex: 1 }}>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontWeight: "bold",
                mb: 3,
                color: "black",
                letterSpacing: "0.05em",
                textAlign: "center",
              }}
            >
              ĐIỀU CHỈNH SỐ LƯỢNG
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                mb: 3,
              }}
            >
              <IconButton
                onClick={() => {
                  const newQuantity = Math.max(1, selectedItem.quantity - 1);
                  setSelectedItem({ ...selectedItem, quantity: newQuantity });
                }}
                disabled={selectedItem?.quantity <= 1}
                sx={{
                  border: "2px solid black",
                  borderRadius: 0,
                  width: 48,
                  height: 48,
                  color: "black",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "black",
                    color: "white",
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(0,0,0,0.1)",
                    color: "rgba(0,0,0,0.3)",
                    border: "2px solid rgba(0,0,0,0.3)",
                  },
                }}
              >
                <Minus size={20} />
              </IconButton>

              <Box
                sx={{
                  backgroundColor: "black",
                  color: "white",
                  px: 3,
                  py: 2,
                  minWidth: 80,
                  textAlign: "center",
                  border: "2px solid black",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {String(selectedItem?.quantity || 0).padStart(2, "0")}
                </Typography>
              </Box>

              <IconButton
                onClick={() => {
                  const newQuantity = selectedItem.quantity + 1;
                  setSelectedItem({ ...selectedItem, quantity: newQuantity });
                }}
                sx={{
                  border: "2px solid black",
                  borderRadius: 0,
                  width: 48,
                  height: 48,
                  color: "black",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "black",
                    color: "white",
                  },
                }}
              >
                <Plus size={20} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setQuantityModalOpen(false)}
                sx={{
                  py: 1.5,
                  border: "2px solid black",
                  borderRadius: 0,
                  color: "black",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.1)",
                    border: "2px solid black",
                  },
                }}
              >
                HUỶ BỎ
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  updateQuantity(selectedItem.quantity);
                  setQuantityModalOpen(false);
                }}
                sx={{
                  py: 1.5,
                  backgroundColor: "black",
                  color: "white",
                  border: "2px solid black",
                  borderRadius: 0,
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.8)",
                  },
                }}
              >
                XÁC NHẬN
              </Button>
            </Box>

            {/* System Info */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 2,
                pt: 2,
                borderTop: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    backgroundColor: "#22c55e",
                    borderRadius: "50%",
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.65rem",
                    color: "rgba(0,0,0,0.6)",
                    letterSpacing: "0.05em",
                  }}
                >
                  HỆ THỐNG SẴN SÀNG
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Drawer>
  );
};

export default CartDrawer;
