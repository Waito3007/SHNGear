import React from "react";
import { Box, Typography, Chip, Divider, Paper, Rating } from "@mui/material";
import { Package, Award, Clock, Shield, Truck, Gift } from "lucide-react";

const ProductInfo = ({ product, averageRating = 0, ratingCount = 0 }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "white",
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {/* Hero Section với Gradient Background */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #d32f2f 0%, #f44336 100%)",
          py: 4,
          px: 3,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            background:
              'url(\'data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.4" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E\')',
          }}
        />

        {/* Product Name với Typography Hierarchy */}
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            position: "relative",
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: 0,
              width: 60,
              height: 4,
              bgcolor: "white",
              borderRadius: 2,
            },
          }}
        >
          {product?.name}
        </Typography>

        {/* Brand Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mt: 3,
            position: "relative",
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              p: 1.5,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              component="img"
              src={
                product?.brand?.logo?.startsWith("http")
                  ? product.brand.logo
                  : `${process.env.REACT_APP_API_BASE_URL}/${product.brand.logo}`
              }
              alt={product?.brand?.name}
              sx={{
                width: 40,
                height: 40,
                objectFit: "contain",
              }}
            />
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: "text.secondary",
                  letterSpacing: 2,
                }}
              >
                Thương hiệu
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {product?.brand?.name}
              </Typography>
            </Box>
          </Box>

          {/* Rating Display */}
          <Box sx={{ ml: "auto" }}>
            <Rating value={averageRating} readOnly precision={0.1} />
            <Typography variant="caption" sx={{ color: "white", ml: 1 }}>
              ({ratingCount} đánh giá)
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content Section */}
      <Box sx={{ p: 3 }}>
        {/* Benefits Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 2,
            mb: 4,
          }}
        >
          {[
            {
              icon: Shield,
              label: "Chính hãng",
              desc: "100% sản phẩm chính hãng",
            },
            {
              icon: Award,
              label: "Bảo hành 24 tháng",
              desc: "Hỗ trợ đổi trả miễn phí",
            },
            {
              icon: Truck,
              label: "Giao hàng trong 2h",
              desc: "Với đơn hàng nội thành",
            },
            {
              icon: Gift,
              label: "Quà tặng hấp dẫn",
              desc: "Nhiều phần quà giá trị",
            },
          ].map((item, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <item.icon size={24} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {item.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.desc}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Product Description */}
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            p: 3,
            borderRadius: 2,
            bgcolor: "#f8f9fa",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#1a1a1a",
              position: "relative",
              "&::before": {
                content: '""',
                width: 4,
                height: 24,
                bgcolor: "primary.main",
                borderRadius: 1,
              },
            }}
          >
            Mô tả sản phẩm
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#2c3e50",
              lineHeight: 2,
              textAlign: "justify",
              letterSpacing: "0.3px",
              maxHeight: 300,
              overflowY: "auto",
              pr: 2,
              "& strong": {
                color: "#1a1a1a",
                fontWeight: 700,
                backgroundColor: "rgba(211, 47, 47, 0.1)",
                padding: "0 4px",
                borderRadius: 1,
              },
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#d32f2f",
                borderRadius: "4px",
                "&:hover": {
                  background: "#b71c1c",
                },
              },
            }}
          >
            {product?.description}
          </Typography>
        </Paper>
      </Box>
    </Paper>
  );
};

export default ProductInfo;
