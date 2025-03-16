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
  const [voucherApplied, setVoucherApplied] = useState(false); // Thêm state để kiểm tra voucher đã áp dụng hay chưa
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const id = parseInt(decoded.sub, 10);
          if (!Number.isInteger(id)) return;
          setUserId(id);
          const cartResponse = await axios.get(`https://localhost:7107/api/Cart?userId=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartItems(cartResponse.data);
          setSelectedItems(cartResponse.data); // Chọn tất cả sản phẩm mặc định
          calculateTotalAmount(cartResponse.data);
        } catch (error) {
          console.error("Lỗi khi lấy giỏ hàng:", error);
        }
      }
    };
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const calculateTotalAmount = (items) => {
    const total = items.reduce((sum, item) => sum + item.productVariant.discountPrice * item.quantity, 0);
    setTotalAmount(total);
  };

  const handleRemoveItem = async (id) => {
    const token = localStorage.getItem("token");
    const numericId = Number.isInteger(id) ? id : 0; // Đảm bảo ID là số

    if (token && userId) {
      try {
        await axios.delete(`https://localhost:7107/api/Cart/remove/${numericId}?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedItems = cartItems.filter((item) => item.productVariantId !== numericId);
        setCartItems(updatedItems);
        setSelectedItems(updatedItems);
        calculateTotalAmount(updatedItems);
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
      }
    } else {
      const updatedCart = cartItems.filter((item) => item.productVariantId !== numericId);
      setCartItems(updatedCart);
      setSelectedItems(updatedCart);
      sessionStorage.setItem("cart", JSON.stringify(updatedCart));
      calculateTotalAmount(updatedCart);
    }
  };

  const handleApplyVoucher = async () => {
    if (voucherApplied) {
      alert("Voucher đã được áp dụng.");
      return;
    }
    try {
      const response = await axios.post("https://localhost:7107/api/vouchers/apply", { code: voucherCode, userId });
      setDiscountAmount(response.data.discountAmount);
      setTotalAmount((prevTotal) => Math.max(0, prevTotal - response.data.discountAmount));
      setVoucherApplied(true); // Đánh dấu voucher đã được áp dụng
    } catch (error) {
      console.error("Lỗi khi áp dụng voucher:", error);
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

  const handleIncreaseQuantity = () => {
    const updatedItems = cartItems.map((item) =>
      item.productVariantId === selectedItem.productVariantId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCartItems(updatedItems);
    setSelectedItems(updatedItems);
    calculateTotalAmount(updatedItems);
  };

  const handleDecreaseQuantity = () => {
    const updatedItems = cartItems.map((item) =>
      item.productVariantId === selectedItem.productVariantId
        ? { ...item, quantity: Math.max(0, item.quantity - 1) }
        : item
    ).filter(item => item.quantity > 0);
    setCartItems(updatedItems);
    setSelectedItems(updatedItems);
    calculateTotalAmount(updatedItems);
    if (selectedItem.quantity === 1) {
      setQuantityModalOpen(false);
    }
  };

  const handleSelectItem = (item) => {
    const isSelected = selectedItems.some((selectedItem) => selectedItem.productVariantId === item.productVariantId);
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

      {cartItems.length > 0 ? (
        <List sx={{ height: "100%", overflowY: "auto", px: 1 }}>
          {cartItems.map((item) => (
            <Box
              key={item.productVariantId}
              sx={{
                p: 2,
                border: "1px solid black",
                borderRadius: 2,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                backgroundColor: "#f9f9f9",
              }}
            >
              <Checkbox
                checked={selectedItems.some((selectedItem) => selectedItem.productVariantId === item.productVariantId)}
                onChange={() => handleSelectItem(item)}
              />
              <Avatar
                src={item.productImage || "https://www.apple.com/v/iphone/home/cb/images/meta/iphone__kqge21l9n26q_og.png"}
                alt={item.productName}
                sx={{ width: 100, height: "100%", border: "1px solid black", borderRadius: 2 }}
              />
              <ListItemText
                primary={`${item.productVariant?.color} - ${item.productVariant?.storage}`}
                secondary={
                  <span onClick={() => handleQuantityChange(item)}>
                    Số lượng: {item.quantity} - {item.productVariant?.discountPrice * item.quantity} VND
                  </span>
                }
              />
              <IconButton onClick={() => handleRemoveItem(item.productVariantId)}>
                <Delete color="red" />
              </IconButton>
            </Box>
          ))}
        </List>
      ) : (
        <Typography className="text-center mt-4">Giỏ hàng trống</Typography>
      )}

      {cartItems.length > 0 && (
        <Box className="flex flex-col h-full justify-between">
          <Box className="flex-grow">
            {/* Nội dung khác của trang */}
          </Box>

          <Box className="p-4 border-t flex flex-col gap-2">
            <TextField
              label="Mã Voucher"
              variant="outlined"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              fullWidth
              disabled={voucherApplied} // Vô hiệu hóa khung nhập mã voucher sau khi áp dụng
            />
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}> 
              {voucherApplied ? (
                <Button variant="contained" color="primary" size="small" onClick={handleRemoveVoucher}>
                  Nhập lại Voucher
                </Button>
              ) : (
                <Button variant="contained" color="primary" size="small" onClick={handleApplyVoucher}>
                  Áp dụng
                </Button>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
              <Typography variant="h6">
                Tổng tiền: {totalAmount.toLocaleString()} VND
              </Typography>
              <Button 
                variant="contained" 
                color="error" 
                size="small" // Giảm kích thước button
                sx={{ minWidth: "120px", ml: 1 }} // Giới hạn độ rộng, đẩy sang phải
                onClick={handlePlaceOrder}
              >
                Đặt hàng ngay
              </Button>
            </Box>
          </Box>
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
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="h6">Thay đổi số lượng</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={handleDecreaseQuantity}>
              <Minus />
            </IconButton>
            <Typography>{selectedItem?.quantity}</Typography>
            <IconButton onClick={handleIncreaseQuantity}>
              <Plus />
            </IconButton>
          </Box>
          <Button variant="contained" onClick={() => setQuantityModalOpen(false)}>
            Đóng
          </Button>
        </Box>
      </Modal>
    </Drawer>
  );
};

export default CartDrawer;