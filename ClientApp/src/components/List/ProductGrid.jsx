import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductHoverPreview from "./ProductHoverPreview";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Rating,
  Skeleton,
  Stack,
} from "@mui/material";
import { Tag, HardDrive, Star } from "lucide-react";
import "./ProductCard.css";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

const ProductGrid = ({
  selectedCategory,
  selectedPriceRange,
  selectedBrand,
  viewMode,
}) => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [productSpecs, setProductSpecs] = useState({});
  const navigate = useNavigate();

  // Handle mouse interaction
  const handleMouseEnter = async (product, event) => {
    setHoveredProduct(product);
    setMousePosition({ x: event.clientX, y: event.clientY });

    if (!productSpecs[product.id]) {
      try {
        const productType = product.category?.name
          ?.toLowerCase()
          .includes("phone")
          ? "PhoneSpecifications"
          : product.category?.name?.toLowerCase().includes("laptop")
          ? "LaptopSpecifications"
          : product.category?.name?.toLowerCase().includes("headphone")
          ? "HeadphoneSpecifications"
          : null;

        if (productType) {
          const response = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/api/Specifications/${productType}/product/${product.id}`
          );
          if (response.ok) {
            const specs = await response.json();
            setProductSpecs((prev) => ({
              ...prev,
              [product.id]: {
                ...specs,
                type: productType.replace("Specifications", "").toLowerCase(),
              },
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching specifications:", err);
      }
    }
  };

  const handleMouseLeave = () => setHoveredProduct(null);
  const handleMouseMove = (event) => {
    if (hoveredProduct) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  useEffect(() => {
    const fetchProductsAndBrands = async () => {
      setLoading(true);
      try {
        const [productsRes, brandsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`),
        ]);

        if (!productsRes.ok || !brandsRes.ok) {
          throw new Error("Không thể tải dữ liệu");
        }

        const productsData = await productsRes.json();
        const brandsData = await brandsRes.json();

        const brandsMap = (brandsData.$values || brandsData || []).reduce(
          (acc, brand) => {
            acc[brand.id] = brand;
            return acc;
          },
          {}
        );

        let filteredProducts = productsData.$values || productsData || [];

        if (selectedCategory) {
          filteredProducts = filteredProducts.filter(
            (product) => product.categoryId === selectedCategory
          );
        }

        if (selectedBrand) {
          filteredProducts = filteredProducts.filter(
            (product) => product.brandId === selectedBrand
          );
        }

        const processedProducts = filteredProducts.map((product) => {
          const variant = product.variants?.[0] || {};
          const image =
            product.images?.[0]?.imageUrl ||
            "https://via.placeholder.com/300?text=No+Image";
          const oldPrice = variant.price || 0;
          const newPrice = variant.discountPrice || oldPrice;
          const discountAmount = oldPrice - newPrice;
          const discount =
            oldPrice > 0 ? Math.round((discountAmount / oldPrice) * 100) : 0;

          const brand = brandsMap[product.brandId];

          return {
            id: product.id,
            name: product.name,
            oldPrice,
            newPrice,
            discount,
            discountAmount,
            image,
            brand,
            rating: 4.5, // Placeholder rating
            ratingCount: Math.floor(Math.random() * 100) + 50, // Placeholder rating count
            variant,
            category: product.category,
          };
        });

        setProducts(processedProducts);
        setBrands(brandsMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndBrands();
  }, [selectedCategory, selectedPriceRange, selectedBrand]);

  if (loading) {
    return (
      <div className="products-grid">
        {[...Array(8)].map((_, index) => (
          <motion.div key={index} variants={item}>
            <div className="skeleton-card">
              <div className="skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton-text title" />
                <div className="skeleton-text" />
                <div className="skeleton-text price" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="products-grid">
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={item}
            onMouseEnter={(e) => handleMouseEnter(product, e)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            <div
              className="product-card"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="product-image">
                <img
                  src={
                    product.image.startsWith("http")
                      ? product.image
                      : `${process.env.REACT_APP_API_BASE_URL}/${product.image}`
                  }
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300?text=Error";
                  }}
                />
              </div>

              <div className="product-content">
                {product.brand && (
                  <div className="product-brand">
                    {product.brand.logo && (
                      <img
                        src={
                          product.brand.logo.startsWith("http")
                            ? product.brand.logo
                            : `${process.env.REACT_APP_API_BASE_URL}/${product.brand.logo}`
                        }
                        alt={product.brand.name}
                        className="brand-logo"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 500,
                      }}
                    >
                      {product.brand.name}
                    </Typography>
                  </div>
                )}

                <h3 className="product-name">{product.name}</h3>

                <div className="product-rating">
                  <Rating
                    value={product.rating}
                    precision={0.5}
                    size="small"
                    readOnly
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({product.ratingCount})
                  </Typography>
                </div>

                <div className="product-price">
                  {product.oldPrice > product.newPrice && (
                    <div className="old-price">
                      {product.oldPrice.toLocaleString()}đ
                    </div>
                  )}
                  <div className="current-price">
                    {product.newPrice.toLocaleString()}
                  </div>
                </div>

                <div className="product-features">
                  {product.variant?.storage && (
                    <div className="feature-chip storage">
                      <HardDrive size={14} />
                      {product.variant.storage}
                    </div>
                  )}
                  {product.discount > 0 && (
                    <div className="feature-chip discount">
                      <Tag size={14} />-{product.discount}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ProductHoverPreview
        product={{
          ...hoveredProduct,
          specifications: hoveredProduct
            ? productSpecs[hoveredProduct.id]
            : null,
        }}
        isVisible={Boolean(hoveredProduct)}
        position={mousePosition}
      />
    </motion.div>
  );
};

export default ProductGrid;
