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

const ProductVariants = ({ variants }) => {
  const [selectedStorage, setSelectedStorage] = useState(variants[0].storage);
  const [selectedColor, setSelectedColor] = useState(variants[0].color);

  const handleSelectStorage = (storage) => {
    setSelectedStorage(storage);
  };

  const handleSelectColor = (color) => {
    setSelectedColor(color);
  };

  const selectedVariant =
    variants.find(
      (v) => v.storage === selectedStorage && v.color === selectedColor
    ) ||
    variants.find((v) => v.storage === selectedStorage) ||
    variants.find((v) => v.color === selectedColor) ||
    variants[0];

  const handleAddToCart = async () => {
    try {
      const response = await fetch("https://localhost:7107/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productVariantId: selectedVariant.id,
          quantity: 1,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Lỗi khi thêm vào giỏ hàng");
      }

      const data = await response.json();
      console.log("Thêm vào giỏ hàng thành công:", data);
      alert("🛒 Sản phẩm đã được thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Lỗi:", error);
      alert("❌ Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
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
              }}
            >
              <CardActionArea
                onClick={() => handleSelectStorage(storage)}
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

      <Typography variant="h6" fontWeight="bold" mt={3} gutterBottom>
        Màu sắc
      </Typography>
      <Grid container spacing={1.5}>
        {[...new Set(variants.map((v) => v.color))].map((color) => {
          const variant = variants.find((v) => v.color === color);
          return (
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
                  width: 70,
                  textAlign: "center",
                }}
              >
                <CardActionArea onClick={() => handleSelectColor(color)}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 40,
                      backgroundImage: `url(${
                        variant.imageUrl ||
                        "https://cdn2.fptshop.com.vn/unsafe/750x0/filters:quality(100)/iphone_16_pro_max_desert_titan_3552a28ae0.png"
                      })`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      borderRadius: "5px 5px 0 0",
                    }}
                  />
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
          );
        })}
      </Grid>

      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="outlined"
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart} // Thêm sự kiện click
          sx={{
            flex: 1,
            borderColor: "#d32f2f",
            color: "#d32f2f",
            "&:hover": {
              borderColor: "#b71c1c",
              backgroundColor: "rgba(211, 47, 47, 0.1)",
            },
          }}
        >
          Thêm vào giỏ hàng
        </Button>
        <Button
          variant="contained"
          sx={{
            flex: 1,
            backgroundColor: "#d32f2f",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#b71c1c",
            },
          }}
        >
          Mua ngay
        </Button>
      </Box>
    </Box>
  );
};

export default ProductVariants;
