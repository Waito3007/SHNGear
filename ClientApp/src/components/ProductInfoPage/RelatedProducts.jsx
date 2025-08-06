import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea,
  Grid,
  Rating,
  Chip,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import { 
  ShoppingCart, 
  Visibility, 
  LocalOffer,
  TrendingUp
} from "@mui/icons-material";

const RelatedProducts = ({ currentProductId, categoryId, brandId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch products in the same category
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/Products?categoryId=${categoryId}`
        );

        if (!response.ok) {
          throw new Error("Không thể tải sản phẩm liên quan");
        }

        const data = await response.json();
        const productsData = data.$values || data || [];

        // Filter out current product and limit to 8 products
        const filteredProducts = productsData
          .filter(product => product.id !== currentProductId)
          .slice(0, 8);

        setRelatedProducts(filteredProducts);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching related products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  const formatCurrency = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = (originalPrice, discountPrice) => {
    if (!originalPrice || !discountPrice || originalPrice <= discountPrice) return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  const getProductPrice = (product) => {
    const variant = product.variants?.[0];
    if (!variant) return { displayPrice: 0, originalPrice: 0, hasDiscount: false };

    const originalPrice = variant.price || 0;
    const displayPrice = variant.discountPrice || originalPrice;
    const hasDiscount = displayPrice < originalPrice;

    return { displayPrice, originalPrice, hasDiscount };
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const priceInfo = getProductPrice(product);

      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex > -1) {
        // Update quantity if product already exists
        existingCart[existingItemIndex].quantity += 1;
      } else {
        // Add new product to cart
        const cartItem = {
          id: product.id,
          name: product.name,
          price: priceInfo.displayPrice,
          image: product.images?.[0]?.imageUrl || "",
          brand: product.brand?.name || "",
          quantity: 1,
          variant: product.variants?.[0],
        };
        existingCart.push(cartItem);
      }

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(existingCart));

      // Dispatch event to update cart count
      window.dispatchEvent(new Event("cartChanged"));

      // Show success feedback (you can replace with your toast system)
      console.log(`Đã thêm "${product.name}" vào giỏ hàng!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <CircularProgress sx={{ color: "#000000" }} />
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            textAlign: "center", 
            color: "#666666",
            fontFamily: "'Roboto Mono', monospace"
          }}
        >
          Đang tải sản phẩm liên quan...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 6 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <TrendingUp sx={{ fontSize: 48, color: "#cccccc", mb: 2 }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: "#666666",
            fontFamily: "'Roboto Mono', monospace"
          }}
        >
          Không có sản phẩm liên quan nào
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: 2,
        border: "2px solid #000000",
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
        overflow: "hidden",
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
          transform: "translateY(-2px)",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)",
        },
        transition: "all 0.3s ease",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: 4,
          background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
          color: "#ffffff",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 6,
              height: 40,
              bgcolor: "#ffffff",
              borderRadius: 1,
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: "'Roboto Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#ffffff",
            }}
          >
            Sản Phẩm Liên Quan
          </Typography>
        </Box>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.8)",
            fontFamily: "'Roboto', sans-serif",
            ml: 3.5,
          }}
        >
          Khám phá thêm những sản phẩm tương tự trong cùng danh mục
        </Typography>
      </Box>

      {/* Products Grid */}
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {relatedProducts.map((product) => {
            const priceInfo = getProductPrice(product);
            const discountPercentage = calculateDiscount(
              priceInfo.originalPrice,
              priceInfo.displayPrice
            );

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: "100%",
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "#000000",
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/product/${product.id}`)}
                    sx={{ height: "100%" }}
                  >
                    <Box sx={{ position: "relative" }}>
                      {/* Discount Badge */}
                      {priceInfo.hasDiscount && discountPercentage > 0 && (
                        <Chip
                          icon={<LocalOffer />}
                          label={`-${discountPercentage}%`}
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            zIndex: 2,
                            bgcolor: "#000000",
                            color: "#ffffff",
                            fontWeight: "bold",
                            "& .MuiChip-icon": {
                              color: "#ffffff",
                            },
                          }}
                        />
                      )}

                      {/* Product Image */}
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          borderRadius: "8px 8px 0 0",
                          position: "relative",
                        }}
                      >
                        <img
                          src={
                            product.images?.[0]?.imageUrl?.startsWith("http")
                              ? product.images[0].imageUrl
                              : `${process.env.REACT_APP_API_BASE_URL}/${product.images?.[0]?.imageUrl || ""}`
                          }
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            objectPosition: "center",
                            padding: "8px",
                            transition: "transform 0.3s ease",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/200x200/f5f5f5/666666?text=No+Image";
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                          }}
                        />
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3, height: "calc(100% - 200px)" }}>
                      {/* Brand */}
                      {product.brand && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#666666",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            mb: 1,
                            display: "block",
                          }}
                        >
                          {product.brand.name}
                        </Typography>
                      )}

                      {/* Product Name */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: "#000000",
                          mb: 2,
                          lineHeight: 1.3,
                          height: "3em",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {product.name}
                      </Typography>

                      {/* Rating */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <Rating
                          value={product.averageRating || 0}
                          precision={0.1}
                          size="small"
                          readOnly
                          sx={{
                            color: "#000000",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#666666",
                            fontFamily: "'Roboto Mono', monospace",
                          }}
                        >
                          ({product.reviewCount || 0})
                        </Typography>
                      </Box>

                      {/* Price */}
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "#000000",
                            fontFamily: "'Roboto Mono', monospace",
                          }}
                        >
                          {formatCurrency(priceInfo.displayPrice)}
                        </Typography>
                        {priceInfo.hasDiscount && (
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: "line-through",
                              color: "#666666",
                              fontFamily: "'Roboto Mono', monospace",
                            }}
                          >
                            {formatCurrency(priceInfo.originalPrice)}
                          </Typography>
                        )}
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          sx={{
                            flex: 1,
                            borderColor: "#000000",
                            color: "#000000",
                            "&:hover": {
                              borderColor: "#000000",
                              bgcolor: "rgba(0,0,0,0.04)",
                            },
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                        >
                          Xem
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ShoppingCart />}
                          sx={{
                            bgcolor: "#000000",
                            color: "#ffffff",
                            "&:hover": {
                              bgcolor: "#333333",
                            },
                          }}
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          Mua
                        </Button>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* View More Button */}
        {relatedProducts.length >= 8 && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(`/productlist?category=${categoryId}`)}
              sx={{
                borderColor: "#000000",
                color: "#000000",
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                "&:hover": {
                  borderColor: "#000000",
                  bgcolor: "#000000",
                  color: "#ffffff",
                },
              }}
            >
              Xem Thêm Sản Phẩm
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RelatedProducts;
