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
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  const handleSelect = (key, value) => {
    const newVariant = variants.find((v) => v[key] === value);
    if (newVariant) setSelectedVariant(newVariant);
  };

  return (
    <Box mt={4}>
      {/* Chọn Dung Lượng */}
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        sx={{ marginTop: "-40px" }}
      >
        Dung lượng
      </Typography>
      <Grid container spacing={2}>
        {[...new Set(variants.map((v) => v.storage))].map((storage) => (
          <Grid item key={storage}>
            <Card
              sx={{
                border:
                  selectedVariant.storage === storage
                    ? "2px solid #d32f2f"
                    : "1px solid #ddd",
                boxShadow:
                  selectedVariant.storage === storage
                    ? "0px 4px 12px rgba(211, 47, 47, 0.3)"
                    : "none",
                transition: "0.3s",
              }}
            >
              <CardActionArea
                onClick={() => handleSelect("storage", storage)}
                sx={{ padding: "10px" }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color:
                      selectedVariant.storage === storage ? "#d32f2f" : "#333",
                  }}
                >
                  {storage}
                </Typography>
                {selectedVariant.storage === storage && (
                  <CheckCircle color="error" />
                )}
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Chọn Màu Sắc */}
      <Typography variant="h6" fontWeight="bold" mt={3} gutterBottom>
        Màu sắc
      </Typography>
      <Grid container spacing={2}>
        {[...new Set(variants.map((v) => v.color))].map((color) => {
          const variant = variants.find((v) => v.color === color);
          return (
            <Grid item key={color}>
              <Card
                sx={{
                  border:
                    selectedVariant.color === color
                      ? "2px solid #d32f2f"
                      : "1px solid #ddd",
                  boxShadow:
                    selectedVariant.color === color
                      ? "0px 4px 12px rgba(211, 47, 47, 0.3)"
                      : "none",
                  transition: "0.3s",
                  width: 120,
                  textAlign: "center",
                }}
              >
                <CardActionArea onClick={() => handleSelect("color", color)}>
                  {/* Hiển thị ảnh màu sắc */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 80,
                      backgroundImage: `url(${
                        variant.imageUrl ||
                        "https://cdn2.fptshop.com.vn/unsafe/750x0/filters:quality(100)/iphone_16_pro_natural_titan_412b47e840.png"
                      })`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      borderRadius: "5px 5px 0 0",
                    }}
                  />
                  <CardContent sx={{ padding: "8px" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color:
                          selectedVariant.color === color ? "#d32f2f" : "#333",
                      }}
                    >
                      {color}
                    </Typography>
                    {selectedVariant.color === color && (
                      <CheckCircle color="error" />
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Buttons: Thêm vào giỏ hàng & Mua ngay */}
      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="outlined"
          startIcon={<ShoppingCart />}
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
