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

      console.log("🔍 Debug selectedVariant:", selectedVariant);
      console.log("🔍 Debug selectedVariant.id:", selectedVariant.id);
      console.log("🔍 Debug all variants:", variants);
      console.log("🔍 Debug first variant structure:", variants[0]);
      console.log("🔍 Debug selectedVariant keys:", Object.keys(selectedVariant));

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
        
        console.log("🔄 Đang gửi request thêm vào giỏ hàng:", {
          productVariantId: selectedVariant.id,
          quantity: quantity,
          userId: userId,
        });

        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/Cart`,
          {
            productVariantId: selectedVariant.id,
            quantity: quantity,
            userId: userId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log("✅ Response từ server:", response.data);
      } else {
        const sessionCart = JSON.parse(sessionStorage.getItem("cart")) || [];
        const existingItemIndex = sessionCart.findIndex(
          (item) => item.productVariantId === selectedVariant.id
        );

        if (existingItemIndex >= 0) {
          sessionCart[existingItemIndex].quantity += quantity;
        } else {
          sessionCart.push({
            productVariantId: selectedVariant.id,
            quantity: quantity,
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
      
      if (error.response) {
        // Server responded with error status
        console.error("❌ Response error:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        showSnackbar(
          `❌ Lỗi ${error.response.status}: ${error.response.data || error.message}`, 
          "error"
        );
      } else if (error.request) {
        // Request was made but no response received
        console.error("❌ No response received:", error.request);
        showSnackbar("❌ Không thể kết nối đến server", "error");
      } else {
        // Something else happened
        console.error("❌ Error:", error.message);
        showSnackbar(`❌ Lỗi: ${error.message}`, "error");
      }
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
        backgroundColor: "#ffffff",
        borderRadius: 2,
        p: 4,
        border: "2px solid #000000",
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%)",
          zIndex: 1,
        },
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)",
        },
        transition: "all 0.3s ease",
      }}
    >
      {/* Color Selection Section */}
      <Typography 
        variant="h6" 
        fontWeight="bold" 
        gutterBottom
        sx={{
          color: "#000000",
          fontFamily: "'Roboto Mono', monospace",
          letterSpacing: "1px",
          textTransform: "uppercase",
          position: "relative",
          pb: 1,
          "&::before": {
            content: '"# "',
            color: "#000000",
            fontWeight: 900,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "60px",
            height: "2px",
            bgcolor: "#000000",
          },
        }}
      >
        Color Options
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[...new Set(variants.map((v) => v.color))].map((color) => (
          <Grid item key={color}>
            <Card
              elevation={selectedColor === color ? 0 : 0}
              sx={{
                borderRadius: 2,
                transform: selectedColor === color ? "scale(1.02)" : "scale(1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: selectedColor === color ? "3px solid #000000" : "2px solid #e0e0e0",
                background: selectedColor === color 
                  ? "linear-gradient(145deg, #f0f0f0 0%, #ffffff 100%)" 
                  : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                "&:hover": {
                  transform: "scale(1.02)",
                  borderColor: "#000000",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardActionArea
                onClick={() => handleSelectColor(color)}
                sx={{
                  position: "relative",
                  width: 140,
                  height: 140,
                  "&:hover .color-label": {
                    bgcolor: "rgba(0,0,0,0.9)",
                    color: "#ffffff",
                  },
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
                    filter: selectedColor === color ? "contrast(1.1)" : "contrast(1)",
                  }}
                />
                <Box
                  className="color-label"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: selectedColor === color ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.95)",
                    color: selectedColor === color ? "#ffffff" : "#000000",
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    border: "1px solid rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="bold"
                    sx={{
                      fontFamily: "'Roboto Mono', monospace",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {color}
                  </Typography>
                  {selectedColor === color && (
                    <CheckCircle sx={{ width: 18, height: 18 }} />
                  )}
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Storage Selection Section */}
      <Typography 
        variant="h6" 
        fontWeight="bold" 
        gutterBottom
        sx={{
          color: "#000000",
          fontFamily: "'Roboto Mono', monospace",
          letterSpacing: "1px",
          textTransform: "uppercase",
          position: "relative",
          pb: 1,
          "&::before": {
            content: '"# "',
            color: "#000000",
            fontWeight: 900,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "60px",
            height: "2px",
            bgcolor: "#000000",
          },
        }}
      >
        Storage Options
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[...new Set(variants.map((v) => v.storage))].map((storage) => (
          <Grid item key={storage}>
            <Tooltip
              title={
                !availableStorages.includes(storage)
                  ? "Not available with selected color"
                  : ""
              }
              arrow
            >
              <Card
                elevation={0}
                sx={{
                  minWidth: 140,
                  opacity: availableStorages.includes(storage) ? 1 : 0.4,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: selectedStorage === storage ? "translateY(-2px)" : "none",
                  border: selectedStorage === storage
                    ? "3px solid #000000"
                    : availableStorages.includes(storage) 
                      ? "2px solid #e0e0e0" 
                      : "2px solid #f0f0f0",
                  background: selectedStorage === storage
                    ? "linear-gradient(145deg, #000000 0%, #333333 100%)"
                    : availableStorages.includes(storage)
                      ? "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)"
                      : "linear-gradient(145deg, #f5f5f5 0%, #e0e0e0 100%)",
                  "&:hover": {
                    borderColor: availableStorages.includes(storage) ? "#000000" : "#f0f0f0",
                    transform: availableStorages.includes(storage) ? "translateY(-2px)" : "none",
                    boxShadow: availableStorages.includes(storage) ? "0 8px 24px rgba(0,0,0,0.12)" : "none",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleSelectStorage(storage)}
                  disabled={!availableStorages.includes(storage)}
                  sx={{ 
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "80px",
                  }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: selectedStorage === storage 
                        ? "#ffffff" 
                        : availableStorages.includes(storage) 
                          ? "#000000" 
                          : "#999999",
                      fontFamily: "'Roboto Mono', monospace",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {storage}
                  </Typography>
                  {selectedStorage === storage && (
                    <CheckCircle sx={{ color: "#ffffff", width: 20, height: 20, mt: 0.5 }} />
                  )}
                </CardActionArea>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      {/* Pricing and Purchase Section */}
      {selectedVariant && (
        <Box
          sx={{
            mt: 4,
            p: 4,
            borderRadius: 2,
            bgcolor: "#ffffff",
            border: "2px solid #000000",
            background: "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%)",
            },
          }}
        >
          {/* Price Display */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
            <Chip
              icon={<LocalOffer />}
              label={`-${calculateDiscount(
                selectedVariant.price,
                selectedVariant.discountPrice
              )}%`}
              sx={{ 
                fontSize: "1.1rem",
                fontWeight: "bold",
                bgcolor: "#000000",
                color: "#ffffff",
                border: "2px solid #000000",
                "& .MuiChip-icon": {
                  color: "#ffffff",
                },
                "&:hover": {
                  bgcolor: "#333333",
                },
              }}
            />
            <Box sx={{ textAlign: "center" }}>
              <Fade in={showDiscount}>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 800,
                    color: "#000000",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                    fontFamily: "'Roboto Mono', monospace",
                    letterSpacing: "1px",
                  }}
                >
                  {formatCurrency(selectedVariant.discountPrice)}
                </Typography>
              </Fade>
              <Typography
                variant="h6"
                sx={{
                  textDecoration: "line-through",
                  color: "#666666",
                  mt: 0.5,
                  fontFamily: "'Roboto Mono', monospace",
                }}
              >
                {formatCurrency(selectedVariant.price)}
              </Typography>
            </Box>
          </Box>

          <Divider 
            flexItem 
            sx={{ 
              my: 2,
              borderColor: "#000000",
              borderWidth: "1px",
            }} 
          />

          {/* Quantity Selector */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Typography 
              variant="h6"
              sx={{
                fontFamily: "'Roboto Mono', monospace",
                fontWeight: "bold",
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Quantity:
            </Typography>
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center",
                border: "2px solid #000000",
                borderRadius: 2,
                bgcolor: "#ffffff",
              }}
            >
              <IconButton
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                size="medium"
                sx={{
                  color: "#000000",
                  "&:hover": {
                    bgcolor: "#f0f0f0",
                  },
                  "&:disabled": {
                    color: "#cccccc",
                  },
                }}
              >
                <RemoveCircle />
              </IconButton>
              <Typography 
                sx={{ 
                  mx: 3, 
                  minWidth: 40, 
                  textAlign: "center",
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#000000",
                }}
              >
                {quantity}
              </Typography>
              <IconButton
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= selectedVariant.stockQuantity}
                size="medium"
                sx={{
                  color: "#000000",
                  "&:hover": {
                    bgcolor: "#f0f0f0",
                  },
                  "&:disabled": {
                    color: "#cccccc",
                  },
                }}
              >
                <AddCircle />
              </IconButton>
            </Box>
            <Tooltip title="Stock information" arrow>
              <Chip
                icon={<Info />}
                label={`Stock: ${selectedVariant.stockQuantity}`}
                variant="outlined"
                sx={{
                  borderColor: "#000000",
                  color: "#000000",
                  fontFamily: "'Roboto Mono', monospace",
                  fontWeight: "bold",
                  "& .MuiChip-icon": {
                    color: "#000000",
                  },
                }}
              />
            </Tooltip>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 3, width: "100%", mt: 2 }}>
            <Button
              onClick={handleAddToCart}
              variant="outlined"
              startIcon={<ShoppingCart />}
              sx={{
                flex: 1,
                height: 60,
                borderColor: "#000000",
                color: "#000000",
                borderWidth: 2,
                fontFamily: "'Roboto Mono', monospace",
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "#000000",
                  bgcolor: "rgba(0, 0, 0, 0.05)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Add to Cart
            </Button>
            <Button
              variant="contained"
              sx={{
                flex: 2,
                height: 60,
                bgcolor: "#000000",
                color: "#ffffff",
                fontSize: "1.1rem",
                fontWeight: "bold",
                fontFamily: "'Roboto Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "1px",
                border: "2px solid #000000",
                "&:hover": {
                  bgcolor: "#333333",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Buy Now
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
