import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
} from "@mui/material";
import { CheckCircle, ShoppingCart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ProductVariants = ({ variants }) => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(variants[0].color);
  const availableStorages = variants
    .filter((v) => v.color === selectedColor)
    .map((v) => v.storage);
  const [selectedStorage, setSelectedStorage] = useState(availableStorages[0]);

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
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = async () => {
    try {
      if (!selectedVariant) {
        alert(
          "⚠️ Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng!"
        );
        alert(
          "⚠️ Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng!"
        );
        return;
      }


      if (selectedVariant.stockQuantity <= 0) {
        alert("❌ Sản phẩm này đã hết hàng!");
        return;
      }


      const token = localStorage.getItem("token");
      const cartItem = {
        productId: selectedVariant.productId,
        productVariantId: selectedVariant.id,
        quantity: 1,
        productVariant: {
          color: selectedVariant.color || "Không xác định",
          storage: selectedVariant.storage || "Không xác định",
          discountPrice: selectedVariant.discountPrice || 0,
        },
      };


      if (token) {
        console.log("🔍 Đang lấy profile...");
        const profileResponse = await fetch(
          "https://localhost:7107/api/Auth/profile",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!profileResponse.ok) {
          const errorData = await profileResponse.text();
          throw new Error(`Lỗi profile: ${errorData}`);
        }

        const profileData = await profileResponse.json();
        cartItem.userId = String(profileData.id);

        console.log(
          "📦 Gửi lên API giỏ hàng:",
          JSON.stringify(cartItem, null, 2)
        );

        const response = await fetch("https://localhost:7107/api/Cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cartItem),
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Lỗi API giỏ hàng: ${errorData}`);
        }

        console.log("✅ Đã thêm vào giỏ hàng!");
      } else {
        const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        const existingItem = cart.find(
          (item) => item.productVariantId === cartItem.productVariantId
        );


        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push(cartItem);
        }


        sessionStorage.setItem("cart", JSON.stringify(cart));
        console.log("📦 Đã lưu vào sessionStorage!", cart);
      }


      alert("🛒 Sản phẩm đã được thêm vào giỏ hàng!");
    } catch (error) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
      alert(`❌ Không thể thêm vào giỏ hàng: ${error.message}`);
    }
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
          onClick={() => {
            if (!selectedVariant) {
              alert("⚠️ Vui lòng chọn biến thể sản phẩm trước khi mua!");
              return;
            }
            navigate("/checkout", { state: { product: [selectedVariant] } });
          }}
        >
          {selectedVariant
            ? `Mua ngay - ${formatCurrency(selectedVariant.discountPrice)}`
            : "Mua ngay"}
        </Button>
      </Box>
    </Box>
  );
};

export default ProductVariants;
