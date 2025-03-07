import React, { useEffect, useState } from "react";
import { Drawer, IconButton, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, Button } from "@mui/material";
import { X, Delete } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CartDrawer = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const profileResponse = await axios.get("https://localhost:7107/api/Auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userId = profileResponse.data.id;
          if (!userId) return;

          const cartResponse = await axios.get(`https://localhost:7107/api/Cart?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartItems(cartResponse.data);
        } catch (error) {
          console.error("Lỗi khi lấy giỏ hàng:", error);
        }
      } else {
        const sessionCart = JSON.parse(sessionStorage.getItem("cart")) || [];
        setCartItems(sessionCart);
      }
    };

    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.productVariantId !== id);
    setCartItems(updatedCart);
    
    const token = localStorage.getItem("token");
    if (!token) {
      sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose} PaperProps={{ sx: { width: 350, p: 2 } }}>
      <div className="flex items-center justify-between p-4 border-b">
        <Typography variant="h6">Giỏ Hàng</Typography>
        <IconButton onClick={onClose}><X /></IconButton>
      </div>
      {cartItems.length > 0 ? (
        <List>
          {cartItems.map((item) => (
            <ListItem key={item.productVariantId} className="flex items-center gap-4">
              <ListItemAvatar>
                <Avatar src={item.productImage || "default-image.png"} alt={item.productName} />
              </ListItemAvatar>
              <ListItemText
                primary={item.productVariant?.color + " " + item.productVariant?.storage}
                secondary={`Số lượng: ${item.quantity} - ${item.productVariant?.discountPrice * item.quantity} VND`}
              />
              <IconButton onClick={() => handleRemoveItem(item.productVariantId)}>
                <Delete color="red" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography className="text-center mt-4">Giỏ hàng trống</Typography>
      )}
      
      {cartItems.length > 0 && (
        <div className="p-4 border-t flex flex-col gap-2">
          <Button variant="contained" color="primary" fullWidth onClick={() => navigate("/checkout")}>
            Thanh toán ngay
          </Button>
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;