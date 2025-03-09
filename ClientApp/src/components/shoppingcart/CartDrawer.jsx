import React, { useEffect, useState } from "react";
import { Drawer, IconButton, List, ListItemText, Avatar, Typography, Button, Box } from "@mui/material";
import { X, Delete } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CartDrawer = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const profileResponse = await axios.get("https://localhost:7107/api/Auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const id = profileResponse.data.id;
          setUserId(id);
          if (!id) return;

          const cartResponse = await axios.get(`https://localhost:7107/api/Cart?userId=${id}`, {
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

  const handleRemoveItem = async (id) => {
    const token = localStorage.getItem("token");

    if (token && userId) {
      try {
        await axios.delete(`https://localhost:7107/api/Cart/remove/${id}?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems((prevItems) => prevItems.filter((item) => item.productVariantId !== id));
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
      }
    } else {
      const updatedCart = cartItems.filter((item) => item.productVariantId !== id);
      setCartItems(updatedCart);
      sessionStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose} PaperProps={{ sx: { width: 350, p: 2 } }}>
      <Box className="flex items-center justify-between p-4 border-b">
        <Typography variant="h6">Giỏ Hàng</Typography>
        <IconButton onClick={onClose}>
          <X />
        </IconButton>
      </Box>

      {cartItems.length > 0 ? (
        <List sx={{ maxHeight: 400, overflowY: "auto", px: 1 }}>
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
              <Avatar src={item.productImage || "default-image.png"} alt={item.productName} sx={{ width: 56, height: 56 }} />
              <ListItemText
                primary={`${item.productVariant?.color} - ${item.productVariant?.storage}`}
                secondary={`Số lượng: ${item.quantity} - ${item.productVariant?.discountPrice * item.quantity} VND`}
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
        <Box className="p-4 border-t flex flex-col gap-2">
          <Button variant="contained" color="error" fullWidth onClick={() => navigate("/checkout")}>
            Thanh toán ngay
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;
