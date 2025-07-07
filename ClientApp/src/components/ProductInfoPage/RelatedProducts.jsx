import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useProducts } from "@/hooks/api/useProducts";
import { useBrands } from "@/hooks/api/useBrands";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const RelatedProducts = ({ productId, brandId, categoryId }) => {
  const { products: productsArray, loading: loadingProducts, error: errorProducts } = useProducts();
  const { brands: brandsArray, loading: loadingBrands, error: errorBrands } = useBrands(true);
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  const relatedProducts = useMemo(() => {
    if (loadingProducts || loadingBrands) return [];
    if (errorProducts || errorBrands) {
      setError(errorProducts || errorBrands);
      return [];
    }
    if (!productsArray.length || !brandsArray.length) return [];

    return productsArray
      .filter(
        (product) =>
          product.id !== productId &&
          (product.brandId === brandId || product.categoryId === categoryId)
      )
      .map((product) => {
        const variant = product.variants?.[0] || {};
        const image = product.images?.[0]?.imageUrl || "/images/placeholder.jpg";
        const oldPrice = variant.price || 0;
        const newPrice = variant.discountPrice || oldPrice;
        const discountAmount = oldPrice - newPrice;
        const discount =
          oldPrice > 0
            ? `-${Math.round((discountAmount / oldPrice) * 100)}%`
            : "0%";

        const brand = brandsArray.find((b) => b.id === product.brandId);

        return {
          id: product.id,
          name: product.name,
          oldPrice,
          newPrice,
          discount,
          discountAmount,
          image,
          features: [
            variant.storage || "Không xác định",
            brand?.name || "Không có thương hiệu",
          ],
        };
      });
  }, [productsArray, brandsArray, loadingProducts, loadingBrands, errorProducts, errorBrands, productId, brandId, categoryId]);

  if (loadingProducts || loadingBrands) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 4 }}>
        {error}
      </Alert>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Or a message indicating no related products
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 3 }}>
      <Box sx={{ maxWidth: 1200, width: '100%', px: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
          Sản phẩm liên quan
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: '.swiper-button-prev-related',
              nextEl: '.swiper-button-next-related',
            }}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="pb-6"
          >
            {relatedProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <Card
                  sx={{
                    maxWidth: 280,
                    mx: 'auto',
                    borderRadius: 2,
                    boxShadow: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': { boxShadow: 6, transform: 'translateY(-5px)' },
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={
                      product.image?.startsWith("http")
                        ? product.image
                        : `${process.env.REACT_APP_API_BASE_URL}/${product.image}`
                    }
                    alt={product.name}
                    sx={{ objectFit: 'contain', p: 2 }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/180"; }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, minHeight: 50 }}>
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        {product.oldPrice.toLocaleString('vi-VN')} đ
                      </Typography>
                      {product.discount !== "0%" && (
                        <Chip label={product.discount} color="error" size="small" sx={{ fontWeight: 'bold' }} />
                      )}
                    </Box>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {product.newPrice.toLocaleString('vi-VN')} đ
                    </Typography>
                    {product.discountAmount > 0 && (
                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 'medium' }}>
                        Giảm {product.discountAmount.toLocaleString('vi-VN')} đ
                      </Typography>
                    )}
                    <Box sx={{ mt: 1 }}>
                      {product.features.map((feature, index) => (
                        <Typography key={index} variant="caption" color="text.secondary" display="block">
                          • {feature}
                        </Typography>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
          <IconButton
            className="swiper-button-prev-related"
            sx={{
              position: 'absolute',
              left: -10,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.8)',
              boxShadow: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,1)', boxShadow: 3 },
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            className="swiper-button-next-related"
            sx={{
              position: 'absolute',
              right: -10,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.8)',
              boxShadow: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,1)', boxShadow: 3 },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default RelatedProducts;
