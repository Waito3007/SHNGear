import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { CheckCircle, ShoppingCart } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
const ProductVariants = ({ variants, onAddToCart }) => {
  const [selectedColor, setSelectedColor] = useState(variants[0].color);
  const availableStorages = variants
    .filter((v) => v.color === selectedColor)
    .map((v) => v.storage);
  const [selectedStorage, setSelectedStorage] = useState(availableStorages[0]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSelectColor = (color) => {
    setSelectedColor(color);
    const newStorages = variants
      .filter((v) => v.color === color)
      .map((v) => v.storage);
    setSelectedStorage(newStorages[0]);
  };

  const handleSelectStorage = (storage) => {
    if (availableStorages.includes(storage)) {
      setSelectedStorage(storage);
    }
  };

  const selectedVariant = variants.find(
    (v) => v.storage === selectedStorage && v.color === selectedColor
  );

  const formatCurrency = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = async () => {
    try {
      if (!selectedVariant) {
        showSnackbar(
          "⚠️ Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng!",
          "warning"
        );
        return;
      }

      if (selectedVariant.stockQuantity <= 0) {
        showSnackbar("❌ Sản phẩm này đã hết hàng!", "error");
        return;
      }

      const token = localStorage.getItem("token");

      // Lấy thông tin hiển thị trực tiếp từ component hiện tại
      const primaryImage =
        selectedVariant.product?.images?.find((img) => img.isPrimary)
          ?.imageUrl || "";
      const productName = selectedVariant.product?.name || "Sản phẩm không tên";
      const variantColor = selectedColor;
      const variantStorage = selectedStorage;
      const price = selectedVariant.price || 0;
      const discountPrice = selectedVariant.discountPrice || 0;

      if (token) {
        // Gọi API chỉ với dữ liệu cần thiết
        const decoded = jwtDecode(token);
        const userId = parseInt(decoded.sub, 10);
        await axios.post(
          "https://localhost:7107/api/Cart",
          {
            productVariantId: selectedVariant.id,
            quantity: 1,
            userId: userId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Lưu đầy đủ thông tin hiển thị vào session
        const sessionCart = JSON.parse(sessionStorage.getItem("cart")) || [];
        const existingItemIndex = sessionCart.findIndex(
          (item) => item.productVariantId === selectedVariant.id
        );

        if (existingItemIndex >= 0) {
          sessionCart[existingItemIndex].quantity += 1;
        } else {
          sessionCart.push({
            productVariantId: selectedVariant.id,
            quantity: 1,
            // Thông tin hiển thị lấy từ trang hiện tại
            productImage: primaryImage,
            productName: productName,
            variantColor: variantColor,
            variantStorage: variantStorage,
            productPrice: price,
            productDiscountPrice: discountPrice,
            // Thêm timestamp để quản lý
            addedAt: new Date().toISOString(),
          });
        }

        sessionStorage.setItem("cart", JSON.stringify(sessionCart));
      }

      showSnackbar("🛒 Sản phẩm đã được thêm vào giỏ hàng!", "success");
      if (onAddToCart) onAddToCart();
    } catch (error) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
      showSnackbar(`❌ Không thể thêm vào giỏ hàng: ${error.message}`, "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box mt={4}>
      {/* Chọn màu sắc trước */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Màu sắc
      </Typography>
      <Grid container spacing={1.5}>
        {[...new Set(variants.map((v) => v.color))].map((color) => (
          <Grid item key={color}>
            <Card
              sx={{
                border:
                  selectedColor === color
                    ? "2px solid #d32f2f"
                    : "1px solid #ddd",
                boxShadow:
                  selectedColor === color
                    ? "0px 4px 12px rgba(211, 47, 47, 0.3)"
                    : "none",
                transition: "0.3s",
                width: "auto",
                textAlign: "center",
              }}
            >
              <CardActionArea onClick={() => handleSelectColor(color)}>
                <CardContent sx={{ padding: "4px" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: "bold",
                      color: selectedColor === color ? "#d32f2f" : "#333",
                    }}
                  >
                    {color}
                  </Typography>
                  {selectedColor === color && (
                    <CheckCircle color="error" fontSize="small" />
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Hiển thị dung lượng sau khi chọn màu */}
      <Typography variant="h6" fontWeight="bold" gutterBottom mt={3}>
        Dung lượng
      </Typography>
      <Grid container spacing={2}>
        {[...new Set(variants.map((v) => v.storage))].map((storage) => (
          <Grid item key={storage}>
            <Card
              sx={{
                border:
                  selectedStorage === storage
                    ? "2px solid #d32f2f"
                    : "1px solid #ddd",
                boxShadow:
                  selectedStorage === storage
                    ? "0px 4px 12px rgba(211, 47, 47, 0.3)"
                    : "none",
                transition: "0.3s",
                padding: "6px 12px",
                opacity: availableStorages.includes(storage) ? 1 : 0.5,
              }}
            >
              <CardActionArea
                onClick={() => handleSelectStorage(storage)}
                disabled={!availableStorages.includes(storage)}
                sx={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color: selectedStorage === storage ? "#d32f2f" : "#333",
                    flexGrow: 1,
                  }}
                >
                  {storage}
                </Typography>
                {selectedStorage === storage && <CheckCircle color="error" />}
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Giá tiền */}
      {selectedVariant && (
        <Box mt={3} textAlign="center">
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ textDecoration: "line-through" }}
          >
            {formatCurrency(selectedVariant.price)}
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="error">
            {formatCurrency(selectedVariant.discountPrice)}
          </Typography>
        </Box>
      )}

      {/* Nút thao tác */}
      <Box mt={2} display="flex" gap={2}>
        <Button
          onClick={handleAddToCart}
          variant="outlined"
          sx={{
            width: "50px",
            height: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderColor: "#d32f2f",
            color: "#d32f2f",
            "&:hover": {
              borderColor: "#b71c1c",
              backgroundColor: "rgba(211, 47, 47, 0.1)",
            },
          }}
        >
          <ShoppingCart />
        </Button>
        <Button
          variant="contained"
          sx={{
            flex: 1,
            backgroundColor: "#d32f2f",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#b71c1c",
            },
          }}
        >
          {selectedVariant
            ? `Mua ngay - ${formatCurrency(selectedVariant.discountPrice)}`
            : "Mua ngay"}
        </Button>
      </Box>
      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductVariants;
