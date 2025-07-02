import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Grid, Box, Alert, CircularProgress } from "@mui/material";
import Navbar from "@/components/Navbar/Navbar";
import ProductImage from "@/components/ProductInfoPage/ProductImage";
import ProductInfo from "@/components/ProductInfoPage/ProductInfo";
import ProductVariants from "@/components/ProductInfoPage/ProductVariants";
import Footer from "@/components/Footer/Footer";
import ProductReviews from "@/components/ProductInfoPage/ProductReviews";
import RelatedProducts from "@/components/ProductInfoPage/RelatedProducts";
import SpecificationDisplay from "@/components/ProductInfoPage/ProductSpecifications";
import Commitment from "@/components/Commitment/Commitment";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/Products/${id}`
        );
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu sản phẩm.");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getProductType = () => {
    if (!product?.category?.name) return null;

    const categoryName = product.category.name.toLowerCase();
    if (categoryName.includes("phone") || categoryName.includes("điện thoại")) {
      return "phone";
    } else if (
      categoryName.includes("laptop") ||
      categoryName.includes("máy tính")
    ) {
      return "laptop";
    } else if (
      categoryName.includes("headphone") ||
      categoryName.includes("tai nghe")
    ) {
      return "headphone";
    }
    return null;
  };

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="min-h-screen flex items-center justify-center p-4">
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box className="min-h-screen flex items-center justify-center p-4">
        <Alert severity="warning" variant="filled">
          Không tìm thấy sản phẩm
        </Alert>
      </Box>
    );
  }

  const productType = getProductType();

  return (
    <Box className="min-h-screen bg-gray-50">
      <Navbar />

      <Container maxWidth="xl" sx={{ pt: { xs: 8, sm: 12 }, pb: 8 }}>
        <Grid container spacing={4}>
          {/* Phần hình ảnh sản phẩm */}
          <Grid item xs={12} md={6} lg={5}>
            <Box
              sx={{
                position: "sticky",
                top: 100,
                backgroundColor: "white",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            >
              <ProductImage images={product.images || []} name={product.name} />
            </Box>
          </Grid>
          {/* Phần thông tin sản phẩm */}
          <Grid item xs={12} md={6} lg={7}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <ProductInfo product={product} />
              <ProductVariants
                variants={product.variants || []}
                onAddToCart={() => {}}
              />
            </Box>
          </Grid>{" "}
          {/* Phần thông số kỹ thuật */}
          {productType && (
            <Grid item xs={12}>
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              >
                <SpecificationDisplay
                  productType={productType}
                  productId={product.id}
                />
              </Box>
            </Grid>
          )}
          {/* Phần đánh giá sản phẩm */}
          <Grid item xs={12}>
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                p: 3,
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            >
              <ProductReviews productId={product.id} />
            </Box>
          </Grid>
          {/* Phần sản phẩm liên quan */}
          <Grid item xs={12}>
            <Box sx={{ mt: 4 }}>
              <RelatedProducts
                productId={product.id}
                brandId={product.brandId}
                categoryId={product.categoryId}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ mt: 8 }}>
        <Commitment />
      </Box>
      <Footer />
    </Box>
  );
};

export default ProductPage;
