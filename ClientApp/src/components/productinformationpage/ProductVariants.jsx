import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

const ProductVariants = ({ variants }) => {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  const handleSelect = (key, value) => {
    const newVariant = variants.find((v) => v[key] === value);
    if (newVariant) setSelectedVariant(newVariant);
  };

  return (
    <Box mt={4}>
      {/* Chọn Dung Lượng */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
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
                  <Box
                    sx={{
                      width: "100%",
                      height: 80,
                      backgroundImage: `url(${variant.imageUrl})`,
                      backgroundSize: "cover",
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
    </Box>
  );
};

export default ProductVariants;
