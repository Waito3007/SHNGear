import React, { useEffect, useState } from "react";
import { Drawer, IconButton, List, ListItemText, Avatar, Typography, Button, Box, TextField, Modal, Checkbox } from "@mui/material";
import { X, Delete, Plus, Minus } from "lucide-react";
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    
    try {
      let items = [];
      
      if (token) {
        // Đã đăng nhập: lấy từ API
        const decoded = jwtDecode(token);
        const id = parseInt(decoded.sub, 10);
        const response = await axios.get(`https://localhost:7107/api/Cart?userId=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        items = response.data;
      } else {
        // Chưa đăng nhập: lấy từ session storage
        const sessionCart = sessionStorage.getItem("cart");
        if (sessionCart) {
          const sessionItems = JSON.parse(sessionCart);
          
          // Gọi API variant-info cho từng sản phẩm
          // Trong hàm fetchCart, thay đổi phần map sessionItems như sau:
          items = await Promise.all(
            sessionItems.map(async (item) => {
              try {
                const response = await axios.get(
                  `https://localhost:7107/api/Cart/variant-info/${item.productVariantId}`
                );
                return {
                  ...item,
                  productName: response.data.productName, // Đổi từ ProductName -> productName
                  productImage: response.data.productImage, // Đổi từ ProductImage -> productImage
                  variantColor: response.data.variantColor, // Đổi từ VariantColor -> variantColor
                  variantStorage: response.data.variantStorage, // Đổi từ VariantStorage -> variantStorage
                  productPrice: response.data.price, // Đổi từ Price -> price
                  productDiscountPrice: response.data.discountPrice // Đổi từ DiscountPrice -> discountPrice
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
                  productDiscountPrice: 0
                };
              }
            })
          );
        }
      }
console.log("Items from session storage:", items);
      setCartItems(items);
      setSelectedItems(items);
      calculateTotalAmount(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isOpen) {
    fetchCart();
  }
}, [isOpen]);

  const calculateTotalAmount = (items) => {
    const total = items.reduce((sum, item) => {
      const price = item.productDiscountPrice || item.productPrice;
      return sum + price * item.quantity;
    }, 0);
    setTotalAmount(total - discountAmount);
  };

  const handleRemoveItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const numericId = Number(id);

      if (token && userId) {
        await axios.delete(`https://localhost:7107/api/Cart/remove/${numericId}?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const sessionCart = sessionStorage.getItem("cart");
        if (sessionCart) {
          const updatedCart = JSON.parse(sessionCart).filter(item => item.productVariantId !== numericId);
          sessionStorage.setItem("cart", JSON.stringify(updatedCart));
        }
      }

      const updatedItems = cartItems.filter((item) => item.productVariantId !== numericId);
      setCartItems(updatedItems);
      setSelectedItems(updatedItems);
      calculateTotalAmount(updatedItems);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleApplyVoucher = async () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để tận hưởng ưu đãi.");
      return;
    }

    if (voucherApplied) {
      alert("Voucher đã được áp dụng.");
      return;
    }

    try {
      const response = await axios.post("https://localhost:7107/api/vouchers/apply", { 
        code: voucherCode, 
        userId 
      });
      setDiscountAmount(response.data.discountAmount);
      setVoucherApplied(true);
      calculateTotalAmount(selectedItems);
    } catch (error) {
      console.error("Error applying voucher:", error);
      alert("Voucher không hợp lệ hoặc đã hết hạn.");
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setDiscountAmount(0);
    setVoucherApplied(false);
    calculateTotalAmount(selectedItems);
  };

  const handlePlaceOrder = () => {
    if (selectedItems.length === 0) {
      alert("Chưa chọn sản phẩm nào!");
      return;
    }
    navigate("/checkout", { state: { selectedItems, totalAmount, voucherCode } });
  };

  const handleQuantityChange = (item) => {
    setSelectedItem(item);
    setQuantityModalOpen(true);
  };

  const updateQuantity = async (newQuantity) => {
    if (!selectedItem) return;

    const updatedItems = cartItems.map((item) =>
      item.productVariantId === selectedItem.productVariantId
        ? { ...item, quantity: newQuantity }
        : item
    ).filter(item => item.quantity > 0);

    try {
      const token = localStorage.getItem("token");
      if (token && userId) {
        await axios.put("https://localhost:7107/api/Cart/update", {
          userId,
          productVariantId: selectedItem.productVariantId,
          quantity: newQuantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  const handleSelectItem = (item) => {
    const isSelected = selectedItems.some(
      (selectedItem) => selectedItem.productVariantId === item.productVariantId
    );
    const updatedSelectedItems = isSelected
      ? selectedItems.filter((selectedItem) => selectedItem.productVariantId !== item.productVariantId)
      : [...selectedItems, item];
    setSelectedItems(updatedSelectedItems);
    calculateTotalAmount(updatedSelectedItems);
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose} PaperProps={{ sx: { width: 500, p: 2 } }}>
      <Box className="flex items-center justify-between p-4 border-b">
        <Typography variant="h6">Giỏ Hàng</Typography>
        <IconButton onClick={onClose}>
          <X />
        </IconButton>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography>Đang tải giỏ hàng...</Typography>
        </Box>
      ) : cartItems.length > 0 ? (
        <>
          <List sx={{ height: "100%", overflowY: "auto", px: 1 }}>
            {cartItems.map((item) => (
              <Box
                key={item.productVariantId}
                sx={{
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Checkbox
                  checked={selectedItems.some(
                    (selectedItem) => selectedItem.productVariantId === item.productVariantId
                  )}
                  onChange={() => handleSelectItem(item)}
                />
                <Avatar
                  src={item.productImage || "https://via.placeholder.com/100"}
                  alt={item.productName}
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    border: "1px solid #e0e0e0", 
                    borderRadius: 2 
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/100";
                  }}
                />
                <ListItemText
                  primary={
                    <Typography fontWeight="medium">
                      {item.productName}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {item.variantColor} - {item.variantStorage}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {((item.productDiscountPrice || item.productPrice) * item.quantity).toLocaleString()} VND
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        onClick={() => handleQuantityChange(item)}
                        sx={{ cursor: 'pointer', mt: 0.5 }}
                      >
                        Số lượng: {item.quantity}
                      </Typography>
                    </>
                  }
                />
                <IconButton 
                  onClick={() => handleRemoveItem(item.productVariantId)}
                  sx={{ color: 'error.main' }}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
          </List>

          <Box className="p-4 border-t flex flex-col gap-2">
            <TextField
              label="Mã Voucher"
              variant="outlined"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              fullWidth
              disabled={voucherApplied || !userId}
              size="small"
            />
            <Box sx={{ display: "flex", justifyContent: "flex-start", gap: 1 }}>
              {voucherApplied ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  onClick={handleRemoveVoucher}
                >
                  Xóa Voucher
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  onClick={handleApplyVoucher}
                  disabled={!voucherCode}
                >
                  Áp dụng
                </Button>
              )}
            </Box>
            {discountAmount > 0 && (
              <Typography variant="body2" color="success.main">
                Đã áp dụng giảm: {discountAmount.toLocaleString()} VND
              </Typography>
            )}
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              mt: 2 
            }}>
              <Typography variant="h6">
                Tổng tiền: {totalAmount.toLocaleString()} VND
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="medium"
                sx={{ minWidth: "140px" }}
                onClick={handlePlaceOrder}
              >
                Đặt hàng
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography>Giỏ hàng trống</Typography>
        </Box>
      )}

      <Modal open={quantityModalOpen} onClose={() => setQuantityModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="h6">Thay đổi số lượng</Typography>
          <Box display="flex" alignItems="center" gap={3}>
            <IconButton 
              onClick={handleDecreaseQuantity}
              disabled={selectedItem?.quantity <= 1}
            >
              <Minus />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 30, textAlign: 'center' }}>
              {selectedItem?.quantity}
            </Typography>
            <IconButton onClick={handleIncreaseQuantity}>
              <Plus />
            </IconButton>
          </Box>
          <Box display="flex" gap={2} width="100%">
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => setQuantityModalOpen(false)}
            >
              Hủy
            </Button>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => {
                setQuantityModalOpen(false);
              }}
            >
              Xác nhận
            </Button>
          </Box>
        </Box>
      </Modal>
    </Drawer>
  );
};

export default CartDrawer;