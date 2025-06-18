import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductHoverPreview from "./ProductHoverPreview";
import { motion } from "framer-motion";
import { Typography, Rating } from "@mui/material";
import CompareModal from "../CompareProduct/CompareModal";
import "./ProductCard.css";
import "./ProductActions.css";

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
}) => {  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [productSpecs, setProductSpecs] = useState({});
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
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

  // Toast notification functions
  const showToast = (message, type = 'success', title = '') => {
    setToastNotification({ message, type, title });
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Set loading state for specific button
  const setButtonLoading = (productId, buttonType, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [`${productId}-${buttonType}`]: isLoading
    }));
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

        if (selectedPriceRange && selectedPriceRange !== "all") {
          const [minPrice, maxPrice] = selectedPriceRange.split("-").map(Number);
          filteredProducts = filteredProducts.filter((product) => {
            const price = product.variants?.[0]?.discountPrice || product.variants?.[0]?.price || 0;
            return price >= minPrice && price <= maxPrice;
          });
        }

        const processedProducts = filteredProducts.map((product) => {
          const variant = product.variants?.[0] || {};
          const image = product.images?.[0]?.imageUrl || "https://via.placeholder.com/300?text=No+Image";
          const oldPrice = variant.price || 0;
          const newPrice = variant.discountPrice || oldPrice;
          const discountAmount = oldPrice - newPrice;
          const discount = oldPrice > 0 ? Math.round((discountAmount / oldPrice) * 100) : 0;

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
            rating: 4.5,
            ratingCount: Math.floor(Math.random() * 100) + 50,
            variant,
            category: product.category,
          };
        });

        setProducts(processedProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndBrands();
  }, [selectedCategory, selectedPriceRange, selectedBrand]);

  // Theo dõi số lượng sản phẩm trong compareList
  useEffect(() => {
    const updateCompareCount = () => {
      const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
      setCompareCount(compareList.length);
    };

    updateCompareCount();
    
    window.addEventListener("storage", updateCompareCount);
    window.addEventListener("compareListChanged", updateCompareCount);
    
    return () => {
      window.removeEventListener("storage", updateCompareCount);
      window.removeEventListener("compareListChanged", updateCompareCount);
    };
  }, []);
  // Function để thêm/xóa sản phẩm khỏi compare list
  const toggleCompare = async (productId, productName) => {
    setButtonLoading(productId, 'compare', true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
      
      if (compareList.includes(productId)) {
        const updatedList = compareList.filter(id => id !== productId);
        localStorage.setItem("compareList", JSON.stringify(updatedList));
        setCompareCount(updatedList.length);
        window.dispatchEvent(new Event('compareListChanged'));
        showToast(`Đã xóa "${productName}" khỏi danh sách so sánh!`, 'success', 'Xóa thành công');
      } else {
        if (compareList.length >= 4) {
          showToast("Chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc!", 'warning', 'Giới hạn so sánh');
          return;
        }
        
        compareList.push(productId);
        localStorage.setItem("compareList", JSON.stringify(compareList));
        setCompareCount(compareList.length);
        window.dispatchEvent(new Event('compareListChanged'));
        showToast(`Đã thêm "${productName}" vào danh sách so sánh!`, 'success', 'Thêm thành công');
      }
      
      setProducts(prevProducts => [...prevProducts]);
    } finally {
      setButtonLoading(productId, 'compare', false);    }
  };

  // Function để thêm sản phẩm vào giỏ hàng
  const addToCart = async (product) => {
    setButtonLoading(product.id, 'cart', true);
    
    try {
      // Simulate API call to add to cart
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get existing cart from localStorage or create new one
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // Update quantity if product already exists
        existingCart[existingItemIndex].quantity += 1;
        showToast(`Đã cập nhật số lượng "${product.name}" trong giỏ hàng!`, 'success', 'Cập nhật giỏ hàng');
      } else {
        // Add new product to cart
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.newPrice,
          image: product.image,
          brand: product.brand?.name || '',
          quantity: 1,
          variant: product.variant
        };
        existingCart.push(cartItem);
        showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success', 'Thêm thành công');
      }
      
      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(existingCart));
      
      // Dispatch event to update cart count in other components
      window.dispatchEvent(new Event('cartChanged'));
      
      // Temporarily add success class to button
      const buttonElement = document.querySelector(`[data-product-id="${product.id}"] .add-to-cart-btn`);
      if (buttonElement) {
        buttonElement.classList.add('btn-success');
        setTimeout(() => {
          buttonElement.classList.remove('btn-success');
        }, 600);
      }
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Có lỗi xảy ra khi thêm vào giỏ hàng!', 'error', 'Lỗi');
    } finally {
      setButtonLoading(product.id, 'cart', false);
    }
  };

  // Function để mở modal so sánh
  const openCompareModal = () => {
    const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
    
    if (compareList.length < 1) {
      alert("Cần ít nhất 1 sản phẩm để so sánh!");
      return;
    }
    
    setCompareModalOpen(true);
  };

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
    <div className="w-full py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4">

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Không có sản phẩm phù hợp</h3>
            <p className="text-gray-500">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            <div className="products-grid">
              {products.map((product) => {
                const isInCompare = JSON.parse(localStorage.getItem("compareList") || "[]").includes(product.id);
                
                return (
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
                      {/* Product Image */}
                      <div className="product-image">
                        {/* Discount Badge */}
                        {product.discount > 0 && (
                          <div className="absolute top-2 left-2 z-10">
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{product.discount}%
                            </span>
                          </div>
                        )}

                        {/* Compare Badge */}
                        {isInCompare && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              ✓ Đã chọn
                            </span>
                          </div>
                        )}

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

                      {/* Product Content */}
                      <div className="product-content">
                        {/* Brand */}
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

                        {/* Product Name */}
                        <h3 className="product-name">{product.name}</h3>

                        {/* Rating */}
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

                        {/* Price */}
                        <div className="product-price">
                          {product.oldPrice > product.newPrice && (
                            <div className="old-price">
                              {product.oldPrice.toLocaleString()}đ
                            </div>
                          )}
                          <div className="current-price">
                            {product.newPrice.toLocaleString()}đ
                          </div>
                        </div>                        {/* Action Buttons */}
                        <div className="product-actions" data-product-id={product.id}>
                          <button
                            className={`compare-btn ${isInCompare ? 'active' : ''} ${
                              loadingStates[`${product.id}-compare`] ? 'btn-loading' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompare(product.id, product.name);
                            }}
                            disabled={loadingStates[`${product.id}-compare`]}
                          >
                            {loadingStates[`${product.id}-compare`] ? '' : 
                             isInCompare ? '✓ Đã chọn' : 'So sánh'}
                          </button>
                          
                          <button
                            className={`add-to-cart-btn ${
                              loadingStates[`${product.id}-cart`] ? 'btn-loading' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            disabled={loadingStates[`${product.id}-cart`]}
                          >
                            {loadingStates[`${product.id}-cart`] ? '' : 'Thêm vào giỏ'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}{/* Floating Compare Button */}
        {compareCount > 0 && (
          <div className="fixed bottom-8 left-8 z-[9998]">
            <button
              onClick={openCompareModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-full shadow-2xl transition-all duration-300 flex items-center space-x-3 transform hover:scale-105"
            >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {compareCount}
                </span>
              </div>
              <span className="font-semibold">So sánh</span>
            </button>
          </div>
        )}

        {/* Product Hover Preview */}
        <ProductHoverPreview
          product={{
            ...hoveredProduct,
            specifications: hoveredProduct ? productSpecs[hoveredProduct.id] : null,
          }}
          isVisible={Boolean(hoveredProduct)}
          position={mousePosition}
        />        {/* Compare Modal */}
        <CompareModal 
          isOpen={compareModalOpen} 
          onClose={() => setCompareModalOpen(false)}
        />

        {/* Toast Notification */}
        {toastNotification && (
          <div className={`toast-notification ${toastNotification.type}`}>
            <div className={`toast-icon ${toastNotification.type}`}>
              {toastNotification.type === 'success' ? '✓' : 
               toastNotification.type === 'error' ? '✗' : 
               toastNotification.type === 'warning' ? '⚠' : 'ℹ'}
            </div>
            <div className="toast-content">
              {toastNotification.title && (
                <div className="toast-title">{toastNotification.title}</div>
              )}
              <div className="toast-message">{toastNotification.message}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
