import React, { useEffect, useState } from "react";
import { 
  Drawer, 
  IconButton, 
  List, 
  Avatar, 
  Typography, 
  Button, 
  Box, 
  TextField, 
  Modal, 
  Checkbox,
  Chip,
  Divider,
  CircularProgress
} from "@mui/material";
import { X, Delete, Plus, Minus, Gift } from "lucide-react";
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
  const [voucherError, setVoucherError] = useState(""); // Thêm trạng thái lỗi voucher
  const navigate = useNavigate();

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
          
          const [apiResponse, sessionCart] = await Promise.all([
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Cart?userId=${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            sessionStorage.getItem("cart")
          ]);

          items = apiResponse.data;

          if (sessionCart) {
            const sessionItems = JSON.parse(sessionCart);
            const mergedItems = await mergeCartItems(items, sessionItems);
            items = mergedItems;
            sessionStorage.removeItem("cart");
          }
        } else {
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
                    productDiscountPrice: response.data.discountPrice
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

        setCartItems(items);
        setSelectedItems(items);
        calculateTotalAmount(items, 0); // Khởi tạo với discount = 0
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    const mergeCartItems = async (apiItems, sessionItems) => {
      const merged = [...apiItems];
      
      for (const sessionItem of sessionItems) {
        const existingItem = merged.find(item => 
          item.productVariantId === sessionItem.productVariantId);
        
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
              productDiscountPrice: response.data.discountPrice
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

    // Reset trạng thái khi đóng drawer
    return () => {
      setVoucherCode("");
      setDiscountAmount(0);
      setVoucherApplied(false);
      setVoucherError("");
    };
  }, [isOpen]);

  const calculateTotalAmount = (items, discount = discountAmount) => {
    const total = items.reduce((sum, item) => {
      const price = item.productDiscountPrice || item.productPrice;
      return sum + price * item.quantity;
    }, 0);
    
    setOriginalTotal(total);
    setTotalAmount(Math.max(0, total - discount)); // Đảm bảo total không âm
  };

  const handleRemoveItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const numericId = Number(id);

      if (token && userId) {
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/Cart/remove/${numericId}?userId=${userId}`, {
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
      setVoucherError("Vui lòng đăng nhập để sử dụng voucher.");
      return;
    }

    if (voucherApplied) {
      setVoucherError("Voucher đã được áp dụng.");
      return;
    }

    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã voucher.");
      return;
    }

    if (selectedItems.length === 0) {
      setVoucherError("Vui lòng chọn ít nhất một sản phẩm để áp dụng voucher.");
      return;
    }

    setVoucherLoading(true);
    setVoucherError("");
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/vouchers/apply`, { 
        code: voucherCode, 
        userId,
        totalAmount: originalTotal // Gửi tổng tiền để backend kiểm tra điều kiện
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      const newDiscountAmount = response.data.discountAmount || 0;
      setDiscountAmount(newDiscountAmount);
      setVoucherApplied(true);
      calculateTotalAmount(selectedItems, newDiscountAmount);
    } catch (error) {
      console.error("Error applying voucher:", error);
      setVoucherError(error.response?.data?.message || "Voucher không hợp lệ hoặc đã hết hạn.");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setDiscountAmount(0);
    setVoucherApplied(false);
    setVoucherError("");
    calculateTotalAmount(selectedItems, 0);
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
        voucherCode: voucherApplied ? voucherCode : null 
      } 
    });
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
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/Cart/update`, {
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

  const handleSelectItem = (item) => {
    const isSelected = selectedItems.some(
      (selectedItem) => selectedItem.productVariantId === item.productVariantId
    );
    const updatedSelectedItems = isSelected
      ? selectedItems.filter((selectedItem) => selectedItem.productVariantId !== item.productVariantId)
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
          width: { xs: '100%', sm: 500 }, 
          p: 2,
          display: 'flex',
          flexDirection: 'column'
        } 
      }}
    >
      <Box className="flex items-center justify-between p-4 border-b">
        <Typography variant="h6" fontWeight="bold">Giỏ Hàng Của Bạn</Typography>
        <IconButton onClick={onClose}>
          <X />
        </IconButton>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
          <CircularProgress />
        </Box>
      ) : cartItems.length > 0 ? (
        <>
          <List sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
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
                  backgroundColor: "#fff",
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Checkbox
                  checked={selectedItems.some(
                    (selectedItem) => selectedItem.productVariantId === item.productVariantId
                  )}
                  onChange={() => handleSelectItem(item)}
                  color="primary"
                />
                <Avatar
                  variant="rounded"
                  src={item.productImage?.startsWith("http") 
                    ? item.productImage 
                    : `${process.env.REACT_APP_API_BASE_URL}/${item.productImage}`}
                  alt={item.productName}
                  sx={{ width: 80, height: 80 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/80";
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontWeight="medium" sx={{ mb: 0.5 }}>
                    {item.productName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {item.variantColor} - {item.variantStorage}
                  </Typography>
                  {item.productDiscountPrice ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                        {(item.productPrice * item.quantity).toLocaleString()}₫
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="error">
                        {(item.productDiscountPrice * item.quantity).toLocaleString()}₫
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" fontWeight="medium">
                      {(item.productPrice * item.quantity).toLocaleString()}₫
                    </Typography>
                  )}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      mt: 0.5 
                    }}
                    onClick={() => handleQuantityChange(item)}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ cursor: 'pointer' }}
                    >
                      Số lượng: 
                    </Typography>
                    <Chip 
                      label={item.quantity} 
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </Box>
                <IconButton 
                  onClick={() => handleRemoveItem(item.productVariantId)}
                  sx={{ color: 'error.main' }}
                >
                  <Delete size={20} />
                </IconButton>
              </Box>
            ))}
          </List>

          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
            {userId && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Gift size={20} color="#ff6b6b" style={{ marginRight: 8 }} />
                  <Typography variant="subtitle1" fontWeight="medium">
                    Mã giảm giá
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Nhập mã giảm giá"
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value);
                      setVoucherError("");
                    }}
                    disabled={voucherApplied}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                      }
                    }}
                  />
                  {voucherApplied ? (
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={handleRemoveVoucher}
                      sx={{ minWidth: '100px' }}
                    >
                      Hủy
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleApplyVoucher}
                      disabled={!voucherCode || voucherLoading}
                      sx={{ minWidth: '100px' }}
                    >
                      {voucherLoading ? <CircularProgress size={20} /> : 'Áp dụng'}
                    </Button>
                  )}
                </Box>
                {voucherError && (
                  <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {voucherError}
                  </Typography>
                )}
                {discountAmount > 0 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1 
                  }}>
                    <Typography variant="body2">Giảm giá:</Typography>
                    <Typography variant="body2" color="error" fontWeight="medium">
                      -{discountAmount.toLocaleString()}₫
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
              </>
            )}
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1 
            }}>
              <Typography variant="body1">Tạm tính:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {originalTotal.toLocaleString()}₫
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 2 
            }}>
              <Typography variant="h6">Tổng cộng:</Typography>
              <Typography variant="h6" fontWeight="bold" color="error">
                {totalAmount.toLocaleString()}₫
              </Typography>
            </Box>
            
            <Button
              fullWidth
              variant="contained"
              color="error"
              size="large"
              onClick={handlePlaceOrder}
              disabled={selectedItems.length === 0}
              sx={{
                py: 1.5,
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Tiến hành đặt hàng
            </Button>
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
        >
          <Typography variant="h6" gutterBottom>
            Giỏ hàng của bạn đang trống
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={onClose}
          >
            Tiếp tục mua sắm
          </Button>
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
            p: 3,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="h6" fontWeight="medium">
            Điều chỉnh số lượng
          </Typography>
          <Box display="flex" alignItems="center" gap={3}>
            <IconButton 
              onClick={() => {
                const newQuantity = Math.max(1, selectedItem.quantity - 1);
                setSelectedItem({...selectedItem, quantity: newQuantity});
              }}
              disabled={selectedItem?.quantity <= 1}
              sx={{ 
                border: '1px solid #e0e0e0',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <Minus size={20} />
            </IconButton>
            <Typography variant="h5" sx={{ minWidth: 40, textAlign: 'center' }}>
              {selectedItem?.quantity}
            </Typography>
            <IconButton 
              onClick={() => {
                const newQuantity = selectedItem.quantity + 1;
                setSelectedItem({...selectedItem, quantity: newQuantity});
              }}
              sx={{ 
                border: '1px solid #e0e0e0',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <Plus size={20} />
            </IconButton>
          </Box>
          <Box display="flex" gap={2} width="100%">
            <Button 
              variant="outlined" 
              fullWidth
              onClick={() => setQuantityModalOpen(false)}
              sx={{ py: 1 }}
            >
              Hủy
            </Button>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => {
                updateQuantity(selectedItem.quantity);
                setQuantityModalOpen(false);
              }}
              sx={{ py: 1 }}
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