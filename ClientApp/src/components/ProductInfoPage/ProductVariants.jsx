import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Button,
  Snackbar,
  Alert,
  Chip,
  Fade,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  ShoppingCart,
  LocalOffer,
  Info,
  AddCircle,
  RemoveCircle,
} from "@mui/icons-material";
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
  const [quantity, setQuantity] = useState(1);
  const [showDiscount, setShowDiscount] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowDiscount((prev) => !prev);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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

  const calculateDiscount = (original, discounted) => {
    if (!original || !discounted) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (
      newQuantity >= 1 &&
      newQuantity <= (selectedVariant?.stockQuantity || 1)
    ) {
      setQuantity(newQuantity);
    }
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

      const primaryImage =
        selectedVariant.product?.images?.find((img) => img.isPrimary)
          ?.imageUrl || "";
      const productName = selectedVariant.product?.name || "Sản phẩm không tên";
      const variantColor = selectedColor;
      const variantStorage = selectedStorage;
      const price = selectedVariant.price || 0;
      const discountPrice = selectedVariant.discountPrice || 0;

      if (token) {
        const decoded = jwtDecode(token);
        const userId = parseInt(decoded.sub, 10);
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/Cart`,
          {
            productVariantId: selectedVariant.id,
            quantity: 1,
            userId: userId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
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
            productImage: primaryImage,
            productName: productName,
            variantColor: variantColor,
            variantStorage: variantStorage,
            productPrice: price,
            productDiscountPrice: discountPrice,
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
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: 2,
        p: 3,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      }}
    >
      {/* Màu sắc */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Màu sắc
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[...new Set(variants.map((v) => v.color))].map((color) => (
          <Grid item key={color}>
            <Card
              elevation={selectedColor === color ? 8 : 1}
              sx={{
                borderRadius: 2,
                transform: selectedColor === color ? "scale(1.05)" : "scale(1)",
                transition: "all 0.3s ease-in-out",
                border: selectedColor === color ? "2px solid #d32f2f" : "2px solid transparent",
                "&:hover": {
                  transform: "scale(1.05)",
                  borderColor: "#d32f2f",
                },
              }}
            >
              <CardActionArea
                onClick={() => handleSelectColor(color)}
                sx={{
                  position: "relative",
                  width: 120,
                  height: 120,
                }}
              >
                <Box
                  component="img"
                  src={
                    variants.find((v) => v.color === color)?.product
                      ?.images?.[0]?.imageUrl
                  }
                  alt={color}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: "rgba(255,255,255,0.9)",
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {color}
                  </Typography>
                  {selectedColor === color && (
                    <CheckCircle
                      sx={{ color: "#d32f2f", width: 16, height: 16 }}
                    />
                  )}
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dung lượng */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Dung lượng
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[...new Set(variants.map((v) => v.storage))].map((storage) => (
          <Grid item key={storage}>
            <Tooltip
              title={
                !availableStorages.includes(storage)
                  ? "Không có sẵn với màu đã chọn"
                  : ""
              }
              arrow
            >
              <Card
                elevation={selectedStorage === storage ? 4 : 1}
                sx={{
                  minWidth: 120,
                  opacity: availableStorages.includes(storage) ? 1 : 0.5,
                  transition: "all 0.2s ease",
                  transform:
                    selectedStorage === storage ? "translateY(-4px)" : "none",
                  border:
                    selectedStorage === storage
                      ? "2px solid #d32f2f"
                      : "1px solid #ddd",
                  "&:hover": {
                    borderColor: availableStorages.includes(storage) ? "#d32f2f" : "#ddd",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleSelectStorage(storage)}
                  disabled={!availableStorages.includes(storage)}
                  sx={{ p: 2 }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: selectedStorage === storage ? "#d32f2f" : "#333",
                    }}
                  >
                    {storage}
                  </Typography>
                </CardActionArea>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      {/* Giá và thông tin */}
      {selectedVariant && (
        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 2,
            bgcolor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<LocalOffer />}
              label={`-${calculateDiscount(
                selectedVariant.price,
                selectedVariant.discountPrice
              )}%`}
              color="error"
              sx={{ fontSize: "1.1rem" }}
            />
            <Box sx={{ textAlign: "center" }}>
              <Fade in={showDiscount}>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: "bold",
                    color: "#d32f2f",
                    textShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {formatCurrency(selectedVariant.discountPrice)}
                </Typography>
              </Fade>
              <Typography
                variant="body1"
                sx={{
                  textDecoration: "line-through",
                  color: "text.secondary",
                  mt: 0.5,
                }}
              >
                {formatCurrency(selectedVariant.price)}
              </Typography>
            </Box>
          </Box>

          <Divider flexItem sx={{ my: 2 }} />

          {/* Số lượng */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="subtitle1">Số lượng:</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                size="small"
              >
                <RemoveCircle />
              </IconButton>
              <Typography sx={{ mx: 2, minWidth: 30, textAlign: "center" }}>
                {quantity}
              </Typography>
              <IconButton
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= selectedVariant.stockQuantity}
                size="small"
              >
                <AddCircle />
              </IconButton>
            </Box>
            <Tooltip title="Số lượng còn lại" arrow>
              <Chip
                icon={<Info />}
                label={`Còn ${selectedVariant.stockQuantity} sản phẩm`}
                variant="outlined"
                size="small"
              />
            </Tooltip>
          </Box>

          {/* Nút thao tác */}
          <Box sx={{ display: "flex", gap: 2, width: "100%", mt: 3 }}>
            <Button
              onClick={handleAddToCart}
              variant="outlined"
              startIcon={<ShoppingCart />}
              sx={{
                flex: 1,
                height: 56,
                borderColor: "#d32f2f",
                color: "#d32f2f",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "#b71c1c",
                  bgcolor: "rgba(211, 47, 47, 0.08)",
                },
              }}
            >
              Thêm vào giỏ
            </Button>
            <Button
              variant="contained"
              sx={{
                flex: 2,
                height: 56,
                bgcolor: "#d32f2f",
                fontSize: "1.1rem",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: "#b71c1c",
                },
              }}
            >
              Mua ngay
            </Button>
          </Box>
        </Box>
      )}

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductVariants;
