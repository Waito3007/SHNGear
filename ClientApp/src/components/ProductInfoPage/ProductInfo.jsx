import React from "react";
import { Box, Typography, Divider, Paper, Rating } from "@mui/material";
import { Award, Shield, Truck, Gift } from "lucide-react";

const ProductInfo = ({ product }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "#ffffff",
        borderRadius: 2,
        overflow: "hidden",
        border: "2px solid #000000",
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
        transition: "all 0.3s ease",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background:
            "linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%)",
          zIndex: 1,
        },
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      {/* Hero Section với Tech Style */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
          py: 4,
          px: 3,
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.03) 50%, transparent 70%),
              radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `,
            zIndex: 1,
          },
        }}
      >
        {/* Animated Circuit Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.08,
            background: `
              repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 40px,
                rgba(255,255,255,0.1) 40px,
                rgba(255,255,255,0.1) 41px
              ),
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 40px,
                rgba(255,255,255,0.1) 40px,
                rgba(255,255,255,0.1) 41px
              )
            `,
            zIndex: 1,
          }}
        />

        {/* Product Name với Modern Typography */}
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            mb: 2,
            position: "relative",
            zIndex: 2,
            textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
            fontFamily: "'Roboto Mono', monospace",
            letterSpacing: "0.5px",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: 0,
              width: 80,
              height: 3,
              bgcolor: "#ffffff",
              borderRadius: 2,
              boxShadow: "0 0 10px rgba(255,255,255,0.5)",
            },
            "&::before": {
              content: '"> "',
              color: "#ffffff",
              opacity: 0.7,
              marginRight: 1,
              fontFamily: "'Courier New', monospace",
            },
          }}
        >
          {product?.name}
        </Typography>

        {/* Price and Rating Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
            mb: 3,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              p: 2,
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#ffffff",
                textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
                fontFamily: "'Roboto Mono', monospace",
                letterSpacing: "0.5px",
              }}
            >
              {product?.price?.toLocaleString("vi-VN")} VNĐ
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              p: 1.5,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Rating
              value={product?.averageRating || 0}
              precision={0.5}
              readOnly
              sx={{
                color: "#ffffff",
                "& .MuiRating-iconFilled": {
                  color: "#ffffff",
                },
                "& .MuiRating-iconEmpty": {
                  color: "rgba(255,255,255,0.3)",
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.8)", ml: 1 }}
            >
              ({product?.reviewCount || 0} đánh giá)
            </Typography>
          </Box>
        </Box>

        {/* Brand Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mt: 3,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.95)",
              p: 2,
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 2,
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
              },
            }}
          >
            {product?.brand?.logo && (
              <Box
                component="img"
                src={
                  product.brand.logo?.startsWith("http")
                    ? product.brand.logo
                    : `${process.env.REACT_APP_API_BASE_URL}/${product.brand.logo}`
                }
                alt={product?.brand?.name || "Brand Logo"}
                sx={{
                  width: 50,
                  height: 50,
                  objectFit: "contain",
                  filter: "contrast(1.1)",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/50?text=No+Logo";
                }}
              />
            )}
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: "#666666",
                  letterSpacing: 2,
                  fontWeight: 600,
                  fontFamily: "'Roboto Mono', monospace",
                }}
              >
                BRAND
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#000000",
                  fontFamily: "'Roboto Mono', monospace",
                }}
              >
                {product?.brand?.name}
              </Typography>
            </Box>
          </Box>

          {/* Stock Status */}
          <Box sx={{ ml: "auto" }}>
            <Box
              sx={{
                bgcolor:
                  product?.stock > 0
                    ? "rgba(76, 175, 80, 0.9)"
                    : "rgba(244, 67, 54, 0.9)",
                color: "#ffffff",
                p: 1.5,
                borderRadius: 2,
                border: `2px solid ${
                  product?.stock > 0 ? "#4CAF50" : "#F44336"
                }`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                backdropFilter: "blur(5px)",
                fontFamily: "'Roboto Mono', monospace",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {product?.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content Section */}
      <Box sx={{ p: 3, position: "relative", zIndex: 2 }}>
        {/* Benefits Grid with Tech Style */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 3,
            mb: 4,
          }}
        >
          {[
            {
              icon: Shield,
              label: "100% Authentic",
              desc: "Certified original products",
            },
            {
              icon: Award,
              label: "24-Month Warranty",
              desc: "Comprehensive protection plan",
            },
            {
              icon: Truck,
              label: "2-Hour Delivery",
              desc: "Express shipping available",
            },
            {
              icon: Gift,
              label: "Premium Gifts",
              desc: "Exclusive bonus items",
            },
          ].map((item, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: "2px solid #000000",
                display: "flex",
                alignItems: "center",
                gap: 3,
                transition: "all 0.3s ease",
                background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "4px",
                  height: "100%",
                  bgcolor: "#000000",
                  transition: "all 0.3s ease",
                },
                "&:hover": {
                  transform: "translateY(-4px) translateX(4px)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                  "&::before": {
                    width: "8px",
                    bgcolor: "#333333",
                  },
                },
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 1,
                  bgcolor: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  border: "2px solid #333333",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: 1,
                  },
                }}
              >
                <item.icon size={24} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{
                    color: "#000000",
                    fontFamily: "'Roboto Mono', monospace",
                    letterSpacing: "0.5px",
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: "'Roboto', sans-serif",
                  }}
                >
                  {item.desc}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Divider
          sx={{
            my: 4,
            borderColor: "#000000",
            borderWidth: "1px",
            "&::before, &::after": {
              borderColor: "#000000",
            },
          }}
        />

        {/* Product Description */}
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            p: 4,
            borderRadius: 2,
            bgcolor: "#ffffff",
            border: "2px solid #000000",
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background:
                "linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%)",
            },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "#000000",
              position: "relative",
              fontFamily: "'Roboto Mono', monospace",
              letterSpacing: "1px",
              textTransform: "uppercase",
              "&::before": {
                content: '"# "',
                color: "#000000",
                fontWeight: 900,
                fontSize: "1.2em",
              },
              "&::after": {
                content: '""',
                flex: 1,
                height: "2px",
                bgcolor: "#000000",
                marginLeft: 2,
              },
            }}
          >
            Product Description
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#1a1a1a",
              lineHeight: 2,
              textAlign: "justify",
              letterSpacing: "0.3px",
              maxHeight: 400,
              overflowY: "auto",
              pr: 2,
              fontFamily: "'Roboto', sans-serif",
              fontSize: "1rem",
              "& strong": {
                color: "#000000",
                fontWeight: 700,
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                padding: "2px 6px",
                borderRadius: 1,
                border: "1px solid rgba(0, 0, 0, 0.1)",
              },
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "4px",
                border: "1px solid #e0e0e0",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#000000",
                borderRadius: "4px",
                border: "1px solid #333333",
                "&:hover": {
                  background: "#333333",
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
