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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      
      try {
        let items = [];
        
        if (token) {
          const decoded = jwtDecode(token);
          const id = parseInt(decoded.sub, 10);
          if (Number.isInteger(id)) {
            setUserId(id);
            const cartResponse = await axios.get(`https://localhost:7107/api/Cart?userId=${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            items = cartResponse.data;
          }
        } else {
          const sessionCart = sessionStorage.getItem("cart");
          if (sessionCart) {
            const parsedCart = JSON.parse(sessionCart);
            items = parsedCart;
          }
        }
        console.log("Fetched cart items:", items);
        setCartItems(items);
        setSelectedItems(items); // Select all items by default
        calculateTotalAmount(items);
      } catch (error) {
        console.error("Error fetching cart:", error);
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
    setTotalAmount(total);
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
      alert("Please login to use vouchers");
      return;
    }

    if (voucherApplied) {
      alert("Voucher already applied");
      return;
    }

    try {
      const response = await axios.post("https://localhost:7107/api/vouchers/apply", { 
        code: voucherCode, 
        userId 
      });
      setDiscountAmount(response.data.discountAmount);
      setTotalAmount((prevTotal) => Math.max(0, prevTotal - response.data.discountAmount));
      setVoucherApplied(true);
    } catch (error) {
      console.error("Error applying voucher:", error);
      alert("Invalid or expired voucher");
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
      alert("No items selected!");
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
    const newQuantity = Math.max(0, selectedItem.quantity - 1);
    updateQuantity(newQuantity);
    if (newQuantity === 0) {
      setQuantityModalOpen(false);
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
    calculateTotalAmount(updatedSelectedItems);
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose} PaperProps={{ sx: { width: 500, p: 2 } }}>
      <Box className="flex items-center justify-between p-4 border-b">
        <Typography variant="h6">Shopping Cart</Typography>
        <IconButton onClick={onClose}>
          <X />
        </IconButton>
      </Box>

      {cartItems.length > 0 ? (
        <>
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
                  checked={selectedItems.some(
                    (selectedItem) => selectedItem.productVariantId === item.productVariantId
                  )}
                  onChange={() => handleSelectItem(item)}
                />
                <Avatar
                  src={item.productImage || "https://via.placeholder.com/100"}
                  alt={item.productName}
                  sx={{ width: 100, height: "100%", border: "1px solid black", borderRadius: 2 }}
                />
                <ListItemText
                  primary={`${item.productName} (${item.variantColor} - ${item.variantStorage})`}
                  secondary={
                    <span onClick={() => handleQuantityChange(item)}>
                      Quantity: {item.quantity} - {(item.productDiscountPrice || item.productPrice) * item.quantity} VND
                    </span>
                  }
                />
                <IconButton onClick={() => handleRemoveItem(item.productVariantId)}>
                  <Delete color="red" />
                </IconButton>
              </Box>
            ))}
          </List>

          <Box className="p-4 border-t flex flex-col gap-2">
            <TextField
              label="Voucher Code"
              variant="outlined"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              fullWidth
              disabled={voucherApplied || !userId}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              {voucherApplied ? (
                <Button variant="contained" color="primary" size="small" onClick={handleRemoveVoucher}>
                  Remove Voucher
                </Button>
              ) : (
                <Button variant="contained" color="primary" size="small" onClick={handleApplyVoucher}>
                  Apply
                </Button>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
              <Typography variant="h6">
                Total: {totalAmount.toLocaleString()} VND
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="small"
                sx={{ minWidth: "120px", ml: 1 }}
                onClick={handlePlaceOrder}
              >
                Checkout
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <Typography className="text-center mt-4">Your cart is empty</Typography>
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
          <Typography variant="h6">Change Quantity</Typography>
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
            Close
          </Button>
        </Box>
      </Modal>
    </Drawer>
  );
};

export default CartDrawer;