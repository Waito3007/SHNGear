import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductHoverPreview from "./ProductHoverPreview";
import ProductPagination from "./ProductPagination";
import { motion } from "framer-motion";
import { Typography, Rating } from "@mui/material";
import CompareModal from "../CompareProduct/CompareModal";
import "./ProductCard.css";
import "./ProductActions.css";

// Add CSS animations
const styles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes slideInFromRight {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .tech-grid-pattern {
    background-image: 
      linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 32px;
    margin-bottom: 48px;
  }
  
  .skeleton-card {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    border: 3px solid #000000;
    border-radius: 20px;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }
  
  .skeleton-image {
    width: 100%;
    height: 280px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 16px;
    margin-bottom: 20px;
  }
  
  .skeleton-content {
    space-y: 12px;
  }
  
  .skeleton-text {
    height: 16px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
    margin-bottom: 12px;
  }
  
  .skeleton-text.title {
    height: 24px;
    width: 80%;
  }
  
  .skeleton-text.price {
    height: 20px;
    width: 60%;
  }
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

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
  const [allProducts, setAllProducts] = useState([]); // Lưu tất cả sản phẩm
  const [currentPage, setCurrentPage] = useState(1);
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

  const PRODUCTS_PER_PAGE = 9;

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
  const showToast = (message, type = "success", title = "") => {
    setToastNotification({ message, type, title });
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Set loading state for specific button
  const setButtonLoading = (productId, buttonType, isLoading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [`${productId}-${buttonType}`]: isLoading,
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
          const [minPrice, maxPrice] = selectedPriceRange
            .split("-")
            .map(Number);
          filteredProducts = filteredProducts.filter((product) => {
            const price =
              product.variants?.[0]?.discountPrice ||
              product.variants?.[0]?.price ||
              0;
            return price >= minPrice && price <= maxPrice;
          });
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
            rating: product.averageRating || 0,
            ratingCount: product.reviewCount || 0,
            variant,
            category: product.category,
          };
        });

        setAllProducts(processedProducts);
        setCurrentPage(1); // Reset về trang đầu khi filter thay đổi
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndBrands();
  }, [selectedCategory, selectedPriceRange, selectedBrand]);

  // Effect để cập nhật sản phẩm hiển thị dựa trên trang hiện tại
  useEffect(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    setProducts(allProducts.slice(startIndex, endIndex));
  }, [allProducts, currentPage]);

  // Hàm xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);

  // Theo dõi số lượng sản phẩm trong compareList
  useEffect(() => {
    const updateCompareCount = () => {
      const compareList = JSON.parse(
        localStorage.getItem("compareList") || "[]"
      );
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
    setButtonLoading(productId, "compare", true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const compareList = JSON.parse(
        localStorage.getItem("compareList") || "[]"
      );

      if (compareList.includes(productId)) {
        const updatedList = compareList.filter((id) => id !== productId);
        localStorage.setItem("compareList", JSON.stringify(updatedList));
        setCompareCount(updatedList.length);
        window.dispatchEvent(new Event("compareListChanged"));
        showToast(
          `Đã xóa "${productName}" khỏi danh sách so sánh!`,
          "success",
          "Xóa thành công"
        );
      } else {
        if (compareList.length >= 4) {
          showToast(
            "Chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc!",
            "warning",
            "Giới hạn so sánh"
          );
          return;
        }

        compareList.push(productId);
        localStorage.setItem("compareList", JSON.stringify(compareList));
        setCompareCount(compareList.length);
        window.dispatchEvent(new Event("compareListChanged"));
        showToast(
          `Đã thêm "${productName}" vào danh sách so sánh!`,
          "success",
          "Thêm thành công"
        );
      }

      setProducts((prevProducts) => [...prevProducts]);
    } finally {
      setButtonLoading(productId, "compare", false);
    }
  };

  // Function để thêm sản phẩm vào giỏ hàng
  const addToCart = async (product) => {
    setButtonLoading(product.id, "cart", true);

    try {
      // Simulate API call to add to cart
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Get existing cart from localStorage or create new one
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex > -1) {
        // Update quantity if product already exists
        existingCart[existingItemIndex].quantity += 1;
        showToast(
          `Đã cập nhật số lượng "${product.name}" trong giỏ hàng!`,
          "success",
          "Cập nhật giỏ hàng"
        );
      } else {
        // Add new product to cart
        const cartItem = {
          id: product.id,
          name: product.name,
          price: product.newPrice,
          image: product.image,
          brand: product.brand?.name || "",
          quantity: 1,
          variant: product.variant,
        };
        existingCart.push(cartItem);
        showToast(
          `Đã thêm "${product.name}" vào giỏ hàng!`,
          "success",
          "Thêm thành công"
        );
      }

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(existingCart));

      // Dispatch event to update cart count in other components
      window.dispatchEvent(new Event("cartChanged"));

      // Temporarily add success class to button
      const buttonElement = document.querySelector(
        `[data-product-id="${product.id}"] .add-to-cart-btn`
      );
      if (buttonElement) {
        buttonElement.classList.add("btn-success");
        setTimeout(() => {
          buttonElement.classList.remove("btn-success");
        }, 600);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Có lỗi xảy ra khi thêm vào giỏ hàng!", "error", "Lỗi");
    } finally {
      setButtonLoading(product.id, "cart", false);
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
      <div
        className="w-full min-h-screen"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)",
          position: "relative",
        }}
      >
        {/* Tech Grid Pattern Background */}
        <div
          className="tech-grid-pattern"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="products-grid">
            {[...Array(9)].map((_, index) => (
              <motion.div
                key={index}
                variants={item}
                initial="hidden"
                animate="show"
                transition={{ delay: index * 0.1 }}
              >
                <div className="skeleton-card">
                  {/* Tech Header Line */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background:
                        "linear-gradient(90deg, #000000 0%, #404040 25%, #808080 50%, #404040 75%, #000000 100%)",
                      zIndex: 2,
                    }}
                  />

                  <div className="skeleton-image" />
                  <div className="skeleton-content">
                    <div className="skeleton-text title" />
                    <div className="skeleton-text" />
                    <div className="skeleton-text" />
                    <div className="skeleton-text price" />

                    {/* Skeleton buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "20px",
                      }}
                    >
                      <div
                        style={{
                          flex: "1",
                          height: "40px",
                          background:
                            "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                          backgroundSize: "200% 100%",
                          animation: "loading 1.5s infinite",
                          borderRadius: "12px",
                        }}
                      />
                      <div
                        style={{
                          flex: "2",
                          height: "40px",
                          background:
                            "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                          backgroundSize: "200% 100%",
                          animation: "loading 1.5s infinite",
                          borderRadius: "12px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }
  return (
    <div
      className="w-full min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)",
        position: "relative",
      }}
    >
      {/* Tech Grid Pattern Background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {" "}
        {allProducts.length === 0 ? (
          <div
            className="text-center py-24"
            style={{
              background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
              borderRadius: "24px",
              border: "3px solid #000000",
              position: "relative",
              overflow: "hidden",
              boxShadow: `
                0 0 0 1px rgba(0,0,0,0.05),
                0 20px 60px rgba(0,0,0,0.1),
                0 30px 80px rgba(0,0,0,0.15)
              `,
            }}
          >
            {/* Tech Header Line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background:
                  "linear-gradient(90deg, #000000 0%, #404040 25%, #808080 50%, #404040 75%, #000000 100%)",
                zIndex: 2,
              }}
            />

            {/* Tech Circuit Pattern */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at 20% 80%, rgba(0,0,0,0.03) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(0,0,0,0.03) 0%, transparent 50%)
                `,
                pointerEvents: "none",
              }}
            />

            <div className="relative z-10 py-12">
              <div
                className="text-8xl mb-6"
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  background:
                    "linear-gradient(135deg, #000000 0%, #333333 50%, #000000 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ⚠
              </div>
              <h3
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: "#000000",
                }}
              >
                KHÔNG CÓ SẢN PHẨM PHÙ HỢP
              </h3>
              <p
                className="text-lg"
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  color: "#666666",
                  letterSpacing: "1px",
                }}
              >
                HÃY THỬ THAY ĐỔI BỘ LỌC HOẶC TỪ KHÓA TÌM KIẾM
              </p>
            </div>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            <div className="products-grid">
              {products.map((product) => {
                const isInCompare = JSON.parse(
                  localStorage.getItem("compareList") || "[]"
                ).includes(product.id);
                return (
                  <motion.div
                    key={product.id}
                    variants={item}
                    onMouseEnter={(e) => handleMouseEnter(product, e)}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    style={{
                      perspective: "1000px",
                    }}
                  >
                    <div
                      className="product-card"
                      onClick={() => navigate(`/product/${product.id}`)}
                      style={{
                        background:
                          "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                        borderRadius: "20px",
                        border: "3px solid #000000",
                        padding: "24px",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                        transition:
                          "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transformStyle: "preserve-3d",
                        boxShadow: `
                          0 0 0 1px rgba(0,0,0,0.05),
                          0 10px 40px rgba(0,0,0,0.08),
                          0 20px 60px rgba(0,0,0,0.12)
                        `,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-12px) scale(1.02) rotateX(2deg)";
                        e.currentTarget.style.boxShadow = `
                          0 0 0 1px rgba(0,0,0,0.08),
                          0 25px 80px rgba(0,0,0,0.15),
                          0 35px 100px rgba(0,0,0,0.20)
                        `;
                        e.currentTarget.style.borderColor = "#333333";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0) scale(1) rotateX(0deg)";
                        e.currentTarget.style.boxShadow = `
                          0 0 0 1px rgba(0,0,0,0.05),
                          0 10px 40px rgba(0,0,0,0.08),
                          0 20px 60px rgba(0,0,0,0.12)
                        `;
                        e.currentTarget.style.borderColor = "#000000";
                      }}
                    >
                      {/* Tech Header Line */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          background:
                            "linear-gradient(90deg, #000000 0%, #404040 25%, #808080 50%, #404040 75%, #000000 100%)",
                          zIndex: 2,
                        }}
                      />

                      {/* Circuit Pattern Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `
                            radial-gradient(circle at 10% 90%, rgba(0,0,0,0.02) 0%, transparent 50%),
                            radial-gradient(circle at 90% 10%, rgba(0,0,0,0.02) 0%, transparent 50%)
                          `,
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      />

                      {/* Product Image */}
                      <div
                        className="product-image"
                        style={{
                          position: "relative",
                          marginBottom: "20px",
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: "2px solid #000000",
                          background:
                            "linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)",
                        }}
                      >
                        {/* Discount Badge */}
                        {product.discount > 0 && (
                          <div
                            className="absolute top-3 left-3 z-20"
                            style={{
                              background:
                                "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: "bold",
                              padding: "6px 12px",
                              borderRadius: "20px",
                              border: "2px solid #ffffff",
                              fontFamily: "'Roboto Mono', monospace",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              boxShadow: "0 4px 12px rgba(255,0,0,0.3)",
                            }}
                          >
                            -{product.discount}%
                          </div>
                        )}

                        {/* Compare Badge */}
                        {isInCompare && (
                          <div
                            className="absolute top-3 right-3 z-20"
                            style={{
                              background:
                                "linear-gradient(135deg, #0066ff 0%, #0044cc 100%)",
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: "bold",
                              padding: "6px 12px",
                              borderRadius: "20px",
                              border: "2px solid #ffffff",
                              fontFamily: "'Roboto Mono', monospace",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              boxShadow: "0 4px 12px rgba(0,102,255,0.3)",
                            }}
                          >
                            ✓ ĐÃ CHỌN
                          </div>
                        )}

                        <img
                          src={
                            product.image.startsWith("http")
                              ? product.image
                              : `${process.env.REACT_APP_API_BASE_URL}/${product.image}`
                          }
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "280px",
                            objectFit: "cover",
                            transition: "transform 0.4s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.08)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/300?text=Error";
                          }}
                        />
                      </div>

                      {/* Product Content */}
                      <div
                        className="product-content"
                        style={{
                          position: "relative",
                          zIndex: 10,
                        }}
                      >
                        {/* Brand */}
                        {product.brand && (
                          <div
                            className="product-brand"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "12px",
                              padding: "8px 12px",
                              background:
                                "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
                              borderRadius: "12px",
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            {product.brand.logo && (
                              <img
                                src={
                                  product.brand.logo.startsWith("http")
                                    ? product.brand.logo
                                    : `${process.env.REACT_APP_API_BASE_URL}/${product.brand.logo}`
                                }
                                alt={product.brand.name}
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  objectFit: "contain",
                                  borderRadius: "4px",
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666666",
                                fontWeight: 700,
                                fontFamily: "'Roboto Mono', monospace",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                              }}
                            >
                              {product.brand.name}
                            </Typography>
                          </div>
                        )}{" "}
                        {/* Product Name */}
                        <h3
                          className="product-name"
                          style={{
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#000000",
                            marginBottom: "16px",
                            lineHeight: "1.4",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {product.name}
                        </h3>
                        {/* Price - Moved to center */}
                        <div
                          className="product-price"
                          style={{
                            marginBottom: "20px",
                            padding: "16px",
                            background:
                              "linear-gradient(145deg, #000000 0%, #333333 100%)",
                            borderRadius: "16px",
                            border: "2px solid #000000",
                            textAlign: "center",
                          }}
                        >
                          {product.oldPrice > product.newPrice && (
                            <div
                              className="old-price"
                              style={{
                                fontSize: "14px",
                                textDecoration: "line-through",
                                color: "#cccccc",
                                marginBottom: "4px",
                                fontFamily: "'Roboto Mono', monospace",
                                fontWeight: 500,
                              }}
                            >
                              {product.oldPrice.toLocaleString()}đ
                            </div>
                          )}
                          <div
                            className="current-price"
                            style={{
                              fontSize: "20px",
                              fontWeight: 700,
                              color: "#ffffff",
                              fontFamily: "'Roboto Mono', monospace",
                              letterSpacing: "1px",
                            }}
                          >
                            {product.newPrice.toLocaleString()}đ
                          </div>
                        </div>
                        {/* Rating */}
                        <div
                          className="product-rating"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "16px",
                            padding: "8px 12px",
                            background:
                              "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
                            borderRadius: "12px",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <Rating
                            value={product.rating}
                            precision={0.1}
                            size="small"
                            readOnly
                            sx={{
                              opacity: product.rating > 0 ? 1 : 0.3,
                              "& .MuiRating-iconFilled": {
                                color: "#000000",
                              },
                              "& .MuiRating-iconEmpty": {
                                color: "#cccccc",
                              },
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "12px",
                              opacity: product.ratingCount > 0 ? 1 : 0.6,
                              fontFamily: "'Roboto Mono', monospace",
                              fontWeight: 600,
                              color: "#666666",
                            }}
                          >
                            (
                            {product.ratingCount > 0
                              ? `${product.ratingCount} đánh giá`
                              : "Chưa có đánh giá"}
                            )
                          </Typography>
                        </div>
                        {/* Action Buttons */}
                        <div
                          className="product-actions"
                          data-product-id={product.id}
                          style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "20px",
                          }}
                        >
                          <button
                            className={`compare-btn ${
                              isInCompare ? "active" : ""
                            } ${
                              loadingStates[`${product.id}-compare`]
                                ? "btn-loading"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompare(product.id, product.name);
                            }}
                            disabled={loadingStates[`${product.id}-compare`]}
                            style={{
                              flex: "1",
                              padding: "12px 16px",
                              borderRadius: "12px",
                              border: "2px solid #000000",
                              background: isInCompare
                                ? "linear-gradient(135deg, #0066ff 0%, #0044cc 100%)"
                                : "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                              color: isInCompare ? "#ffffff" : "#000000",
                              fontSize: "12px",
                              fontWeight: 700,
                              fontFamily: "'Roboto Mono', monospace",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              position: "relative",
                              overflow: "hidden",
                            }}
                            onMouseEnter={(e) => {
                              if (!isInCompare) {
                                e.target.style.background =
                                  "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)";
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow =
                                  "0 6px 20px rgba(0,0,0,0.15)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isInCompare) {
                                e.target.style.background =
                                  "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)";
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                              }
                            }}
                          >
                            {loadingStates[`${product.id}-compare`] ? (
                              <div
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  border: "2px solid #cccccc",
                                  borderTop: "2px solid #000000",
                                  borderRadius: "50%",
                                  animation: "spin 1s linear infinite",
                                  margin: "0 auto",
                                }}
                              />
                            ) : isInCompare ? (
                              "✓ ĐÃ CHỌN"
                            ) : (
                              "SO SÁNH"
                            )}
                          </button>

                          <button
                            className={`add-to-cart-btn ${
                              loadingStates[`${product.id}-cart`]
                                ? "btn-loading"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            disabled={loadingStates[`${product.id}-cart`]}
                            style={{
                              flex: "2",
                              padding: "12px 16px",
                              borderRadius: "12px",
                              border: "2px solid #000000",
                              background:
                                "linear-gradient(135deg, #000000 0%, #333333 100%)",
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: 700,
                              fontFamily: "'Roboto Mono', monospace",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              position: "relative",
                              overflow: "hidden",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background =
                                "linear-gradient(135deg, #333333 0%, #555555 100%)";
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow =
                                "0 8px 25px rgba(0,0,0,0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background =
                                "linear-gradient(135deg, #000000 0%, #333333 100%)";
                              e.target.style.transform = "translateY(0)";
                              e.target.style.boxShadow = "none";
                            }}
                          >
                            {loadingStates[`${product.id}-cart`] ? (
                              <div
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  border: "2px solid #666666",
                                  borderTop: "2px solid #ffffff",
                                  borderRadius: "50%",
                                  animation: "spin 1s linear infinite",
                                  margin: "0 auto",
                                }}
                              />
                            ) : (
                              "THÊM VÀO GIỎ"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalProducts={allProducts.length}
              productsPerPage={PRODUCTS_PER_PAGE}
              loading={loading}
            />
          </motion.div>
        )}{" "}
        {/* Floating Compare Button */}
        {compareCount > 0 && (
          <div
            className="fixed bottom-8 left-8 z-[9998]"
            style={{
              perspective: "1000px",
            }}
          >
            <button
              onClick={openCompareModal}
              style={{
                background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                color: "#ffffff",
                padding: "20px 24px",
                borderRadius: "24px",
                border: "3px solid #000000",
                boxShadow: `
                  0 0 0 1px rgba(0,0,0,0.1),
                  0 20px 60px rgba(0,0,0,0.3),
                  0 30px 80px rgba(0,0,0,0.4)
                `,
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                cursor: "pointer",
                fontFamily: "'Roboto Mono', monospace",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: "14px",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform =
                  "translateY(-8px) scale(1.05) rotateX(5deg)";
                e.target.style.boxShadow = `
                  0 0 0 1px rgba(0,0,0,0.15),
                  0 30px 80px rgba(0,0,0,0.4),
                  0 40px 100px rgba(0,0,0,0.5)
                `;
                e.target.style.background =
                  "linear-gradient(135deg, #333333 0%, #555555 100%)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform =
                  "translateY(0) scale(1) rotateX(0deg)";
                e.target.style.boxShadow = `
                  0 0 0 1px rgba(0,0,0,0.1),
                  0 20px 60px rgba(0,0,0,0.3),
                  0 30px 80px rgba(0,0,0,0.4)
                `;
                e.target.style.background =
                  "linear-gradient(135deg, #000000 0%, #333333 100%)";
              }}
            >
              {/* Tech Circuit Background */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `
                    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)
                  `,
                  pointerEvents: "none",
                }}
              />

              <div
                className="relative"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(255,255,255,0.2))",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span
                  className="absolute -top-3 -right-3"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #ffffff",
                    fontFamily: "'Roboto Mono', monospace",
                    boxShadow: "0 4px 12px rgba(255,0,0,0.4)",
                  }}
                >
                  {compareCount}
                </span>
              </div>
              <span
                className="font-semibold relative z-10"
                style={{
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                SO SÁNH
              </span>
            </button>
          </div>
        )}
        {/* Product Hover Preview */}
        <ProductHoverPreview
          product={{
            ...hoveredProduct,
            specifications: hoveredProduct
              ? productSpecs[hoveredProduct.id]
              : null,
          }}
          isVisible={Boolean(hoveredProduct)}
          position={mousePosition}
        />{" "}
        {/* Compare Modal */}
        <CompareModal
          isOpen={compareModalOpen}
          onClose={() => setCompareModalOpen(false)}
        />{" "}
        {/* Toast Notification */}
        {toastNotification && (
          <div
            className={`toast-notification ${toastNotification.type}`}
            style={{
              position: "fixed",
              top: "24px",
              right: "24px",
              zIndex: 10000,
              background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
              border: "3px solid #000000",
              borderRadius: "16px",
              padding: "20px",
              maxWidth: "400px",
              boxShadow: `
                0 0 0 1px rgba(0,0,0,0.1),
                0 20px 60px rgba(0,0,0,0.15),
                0 30px 80px rgba(0,0,0,0.2)
              `,
              display: "flex",
              alignItems: "center",
              gap: "16px",
              animation:
                "slideInFromRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Tech Header Line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background:
                  toastNotification.type === "success"
                    ? "linear-gradient(90deg, #00ff00 0%, #00cc00 100%)"
                    : toastNotification.type === "error"
                    ? "linear-gradient(90deg, #ff0000 0%, #cc0000 100%)"
                    : toastNotification.type === "warning"
                    ? "linear-gradient(90deg, #ffaa00 0%, #cc8800 100%)"
                    : "linear-gradient(90deg, #0066ff 0%, #0044cc 100%)",
                zIndex: 2,
              }}
            />

            <div
              className={`toast-icon ${toastNotification.type}`}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#ffffff",
                background:
                  toastNotification.type === "success"
                    ? "linear-gradient(135deg, #00ff00 0%, #00cc00 100%)"
                    : toastNotification.type === "error"
                    ? "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)"
                    : toastNotification.type === "warning"
                    ? "linear-gradient(135deg, #ffaa00 0%, #cc8800 100%)"
                    : "linear-gradient(135deg, #0066ff 0%, #0044cc 100%)",
                border: "2px solid #000000",
                flexShrink: 0,
              }}
            >
              {toastNotification.type === "success"
                ? "✓"
                : toastNotification.type === "error"
                ? "✗"
                : toastNotification.type === "warning"
                ? "⚠"
                : "ℹ"}
            </div>
            <div
              className="toast-content"
              style={{
                flex: 1,
              }}
            >
              {toastNotification.title && (
                <div
                  className="toast-title"
                  style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#000000",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "4px",
                  }}
                >
                  {toastNotification.title}
                </div>
              )}
              <div
                className="toast-message"
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#666666",
                  lineHeight: "1.4",
                }}
              >
                {toastNotification.message}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
