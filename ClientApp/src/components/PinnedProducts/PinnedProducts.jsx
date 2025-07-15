import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Eye, Cpu, Monitor, Zap } from "lucide-react";

// Tech-style CSS animations
const techStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;600;700&display=swap');
  
  @keyframes techGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0,0,0,0.2), 0 0 40px rgba(0,0,0,0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(0,0,0,0.4), 0 0 60px rgba(0,0,0,0.2);
    }
  }
  
  @keyframes techSlide {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes techPulse {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.02);
    }
  }
  
  @keyframes techScan {
    0% {
      transform: translateX(-100%) scaleX(0);
    }
    50% {
      transform: translateX(0) scaleX(1);
    }
    100% {
      transform: translateX(100%) scaleX(0);
    }
  }
  
  @keyframes techMatrix {
    0% {
      transform: scale(0.98);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .tech-grid-bg {
    background-image: 
      linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 25px 25px;
  }
  
  .tech-circuit-pattern {
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(0,0,0,0.02) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(0,0,0,0.02) 0%, transparent 40%),
      radial-gradient(circle at 60% 20%, rgba(0,0,0,0.01) 0%, transparent 30%);
  }
  
  .tech-scanline {
    position: relative;
    overflow: hidden;
  }
  
  .tech-scanline::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.7) 50%, transparent 100%);
    animation: techScan 4s ease-in-out infinite;
  }
  
  .tech-hover-glow:hover {
    animation: techGlow 2s ease-in-out infinite;
  }
  
  .roboto-mono {
    font-family: 'Roboto Mono', monospace;
  }
  
  .tech-loading-spinner {
    width: 80px;
    height: 80px;
    border: 4px solid #000000;
    border-radius: 12px;
    position: relative;
    animation: spin 1.2s linear infinite;
  }
  
  .tech-loading-spinner::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 3px solid transparent;
    border-top: 3px solid #000000;
    border-radius: 8px;
    animation: spin 1.8s linear infinite reverse;
  }
  
  .tech-loading-spinner::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: #000000;
    border-radius: 2px;
    transform: translate(-50%, -50%);
    animation: techPulse 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .tech-card {
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    border: 3px solid #000000;
    box-shadow: 
      0 10px 25px rgba(0,0,0,0.1),
      inset 0 1px 0 rgba(255,255,255,0.9);
    position: relative;
    overflow: hidden;
  }
  
  .tech-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.02) 50%, transparent 100%);
    transition: left 0.5s ease;
    z-index: 1;
  }
  
  .tech-card:hover::before {
    left: 100%;
  }
  
  .tech-price-tag {
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    color: #ffffff;
    border-radius: 8px;
    padding: 8px 12px;
    position: relative;
  }
  
  .tech-price-tag::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #ffffff 0%, #cccccc 50%, #ffffff 100%);
  }
  
  .tech-button {
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    color: #ffffff;
    border: 2px solid #000000;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .tech-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
    transition: left 0.3s ease;
  }
  
  .tech-button:hover::before {
    left: 100%;
  }
  
  .tech-button:hover {
    background: linear-gradient(135deg, #333333 0%, #555555 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  }
`;

// Inject tech styles
if (
  typeof document !== "undefined" &&
  !document.getElementById("tech-pinned-styles")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "tech-pinned-styles";
  styleSheet.innerText = techStyles;
  document.head.appendChild(styleSheet);
}

const PinnedProducts = () => {
  const [pinnedProducts, setPinnedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPinnedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/Products/pinned`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pinned products");
        }
        const data = await response.json();
        setPinnedProducts(data);
      } catch (err) {
        setError("Không thể tải sản phẩm nổi bật.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPinnedProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscountPercentage = (originalPrice, discountPrice) => {
    if (!originalPrice || !discountPrice || originalPrice <= discountPrice)
      return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  const getProductPrice = (product) => {
    // Ưu tiên Flash Sale price nếu đang có
    if (product.isFlashSale && product.flashSalePrice) {
      return {
        displayPrice: product.flashSalePrice,
        originalPrice: product.variants?.[0]?.price || 0,
        isFlashSale: true,
      };
    }

    // Nếu không có Flash Sale, lấy từ variant đầu tiên
    const variant = product.variants?.[0];
    if (variant) {
      return {
        displayPrice: variant.discountPrice || variant.price,
        originalPrice: variant.price,
        isFlashSale: false,
      };
    }

    return {
      displayPrice: 0,
      originalPrice: 0,
      isFlashSale: false,
    };
  };

  const getStockQuantity = (product) => {
    return (
      product.variants?.reduce(
        (total, variant) => total + (variant.stockQuantity || 0),
        0
      ) || 0
    );
  };

  if (loading) {
    return (
      <div
        className="py-20 tech-grid-bg"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)",
          position: "relative",
        }}
      >
        {/* Tech Circuit Pattern */}
        <div
          className="tech-circuit-pattern"
          style={{ position: "absolute", inset: 0 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            className="text-center p-16 tech-scanline"
            style={{
              background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
              border: "4px solid #000000",
              borderRadius: "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Tech Header Lines */}
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
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "6px",
                background:
                  "linear-gradient(90deg, #000000 0%, #404040 25%, #808080 50%, #404040 75%, #000000 100%)",
                zIndex: 2,
              }}
            />

            {/* Side Tech Lines */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: "6px",
                background:
                  "linear-gradient(180deg, #000000 0%, #404040 25%, #808080 50%, #404040 75%, #000000 100%)",
                zIndex: 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: "6px",
                background:
                  "linear-gradient(180deg, #000000 0%, #404040 25%, #808080 50%, #404040 75%, #000000 100%)",
                zIndex: 2,
              }}
            />

            <div className="relative z-10">
              {/* Tech Loading Animation */}
              <div className="tech-loading-spinner mx-auto mb-8" />

              <h3
                className="text-2xl font-bold mb-4 roboto-mono"
                style={{
                  color: "#000000",
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                }}
              >
                ĐANG TẢI DỮ LIỆU HỆ THỐNG
              </h3>
              <div
                className="text-center mb-4"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <Cpu size={20} style={{ color: "#000000" }} />
                <p
                  className="roboto-mono"
                  style={{
                    color: "#666666",
                    fontSize: "16px",
                    letterSpacing: "2px",
                  }}
                >
                  SẢN PHẨM NỔI BẬT
                </p>
                <Monitor size={20} style={{ color: "#000000" }} />
              </div>

              {/* Tech Progress Bar */}
              <div
                style={{
                  width: "200px",
                  height: "4px",
                  background: "#e0e0e0",
                  margin: "0 auto",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #000000 0%, #666666 50%, #000000 100%)",
                    animation: "techSlide 2s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="py-16"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center p-12"
            style={{
              background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
              border: "3px solid #ff0000",
              borderRadius: "16px",
              color: "#ff0000",
            }}
          >
            <p className="text-lg font-bold roboto-mono">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (pinnedProducts.length === 0) {
    return null;
  }

  return (
    <section
      className="py-12 tech-grid-bg tech-scanline"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)",
        position: "relative",
      }}
    >
      {/* Tech Circuit Pattern Background */}
      <div
        className="tech-circuit-pattern"
        style={{ position: "absolute", inset: 0 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header - Tech Style */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center justify-center p-3 mb-4"
            style={{
              background: "linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)",
              border: "3px solid #000000",
              borderRadius: "50%",
              animation: "techPulse 3s ease-in-out infinite",
            }}
          >
            <div
              className="flex items-center justify-center w-10 h-10"
              style={{
                background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                borderRadius: "50%",
              }}
            >
              <Star className="w-5 h-5 text-white fill-current" />
            </div>
          </div>

          <h2
            className="text-2xl md:text-3xl font-bold mb-4 roboto-mono"
            style={{
              background:
                "linear-gradient(135deg, #000000 0%, #333333 50%, #000000 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textTransform: "uppercase",
              letterSpacing: "3px",
            }}
          >
            SẢN PHẨM NỔI BẬT
          </h2>

          <div
            style={{
              width: "80px",
              height: "3px",
              background:
                "linear-gradient(90deg, #000000 0%, #666666 50%, #000000 100%)",
              margin: "0 auto 16px auto",
              borderRadius: "2px",
            }}
          />

          <p
            className="text-sm max-w-2xl mx-auto roboto-mono"
            style={{
              color: "#666666",
              letterSpacing: "0.5px",
            }}
          >
            KHÁM PHÁ NHỮNG SẢN PHẨM CÔNG NGHỆ HÀNG ĐẦU ĐƯỢC KHÁCH HÀNG YÊU THÍCH
            NHẤT
          </p>
        </div>

        {/* Products Grid - Tech Modern Design */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {pinnedProducts.slice(0, 10).map((product) => {
            const priceInfo = getProductPrice(product);
            const discountPercentage = calculateDiscountPercentage(
              priceInfo.originalPrice,
              priceInfo.displayPrice
            );
            const stockQuantity = getStockQuantity(product);
            const hasDiscount = discountPercentage > 0;

            return (
              <div
                key={product.id}
                className="group tech-card tech-hover-glow"
                style={{
                  borderRadius: "20px",
                  transition: "all 0.4s ease",
                  animation: "techMatrix 0.6s ease-out",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-8px) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)";
                }}
              >
                {/* Flash Sale Badge */}
                {priceInfo.isFlashSale && (
                  <div
                    className="absolute top-3 left-3 z-20 px-2 py-1 rounded-lg text-xs font-bold roboto-mono"
                    style={{
                      background:
                        "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                      color: "#ffffff",
                      border: "2px solid #ffffff",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      animation: "techPulse 1.5s ease-in-out infinite",
                    }}
                  >
                    ⚡ FLASH SALE
                  </div>
                )}

                {/* Discount Badge */}
                {!priceInfo.isFlashSale && hasDiscount && (
                  <div
                    className="absolute top-4 left-4 z-20 px-3 py-2 rounded-lg text-xs font-bold roboto-mono"
                    style={{
                      background:
                        "linear-gradient(135deg, #000000 0%, #333333 100%)",
                      color: "#ffffff",
                      border: "2px solid #ffffff",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    -{discountPercentage}%
                  </div>
                )}

                {/* Stock Badge */}
                <div className="absolute top-4 right-4 z-20">
                  {stockQuantity > 0 ? (
                    <div
                      className="px-3 py-1 rounded-lg text-xs font-medium roboto-mono"
                      style={{
                        background:
                          "linear-gradient(135deg, #00aa00 0%, #008800 100%)",
                        color: "#ffffff",
                        border: "2px solid #ffffff",
                        textTransform: "uppercase",
                      }}
                    >
                      {stockQuantity} SP
                    </div>
                  ) : (
                    <div
                      className="px-3 py-1 rounded-lg text-xs font-medium roboto-mono"
                      style={{
                        background:
                          "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                        color: "#ffffff",
                        border: "2px solid #ffffff",
                        textTransform: "uppercase",
                      }}
                    >
                      HẾT HÀNG
                    </div>
                  )}
                </div>

                {/* Product Image */}
                <div
                  className="relative overflow-hidden aspect-square"
                  style={{
                    background:
                      "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)",
                    borderRadius: "16px 16px 0 0",
                    border: "2px solid #000000",
                    borderBottom: "none",
                  }}
                >
                  <img
                    src={(() => {
                      const primaryImage =
                        product.images?.find((img) => img.isPrimary) ||
                        product.images?.[0];
                      if (!primaryImage) return "/placeholder-image.jpg";

                      const imageUrl = primaryImage.imageUrl;
                      if (imageUrl?.startsWith("http")) return imageUrl;
                      return `${process.env.REACT_APP_API_BASE_URL}${
                        imageUrl?.startsWith("/") ? "" : "/"
                      }${imageUrl}`;
                    })()}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    style={{
                      transition: "transform 0.6s ease",
                      filter: "contrast(1.1) brightness(0.95)",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                    onError={(e) => {
                      if (!e.target.src.includes("/placeholder-image.jpg")) {
                        e.target.src = "/placeholder-image.jpg";
                      }
                    }}
                  />

                  {/* Tech Border Effect */}
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: "3px",
                      background:
                        "linear-gradient(90deg, #000000 0%, #666666 50%, #000000 100%)",
                      transform: "scaleX(0)",
                      transition: "transform 0.4s ease",
                      transformOrigin: "center",
                    }}
                    ref={(el) => {
                      if (el) {
                        const card = el.closest(".group");
                        if (card) {
                          card.addEventListener("mouseenter", () => {
                            el.style.transform = "scaleX(1)";
                          });
                          card.addEventListener("mouseleave", () => {
                            el.style.transform = "scaleX(0)";
                          });
                        }
                      }
                    }}
                  />

                  {/* Overlay Actions */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    }}
                    ref={(el) => {
                      if (el) {
                        const card = el.closest(".group");
                        if (card) {
                          card.addEventListener("mouseenter", () => {
                            el.style.opacity = "1";
                          });
                          card.addEventListener("mouseleave", () => {
                            el.style.opacity = "0";
                          });
                        }
                      }
                    }}
                  >
                    <div
                      className="flex space-x-4"
                      style={{
                        transform: "translateY(20px)",
                        transition: "transform 0.3s ease",
                      }}
                      ref={(el) => {
                        if (el) {
                          const card = el.closest(".group");
                          if (card) {
                            card.addEventListener("mouseenter", () => {
                              el.style.transform = "translateY(0)";
                            });
                            card.addEventListener("mouseleave", () => {
                              el.style.transform = "translateY(20px)";
                            });
                          }
                        }
                      }}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="tech-button p-3 rounded-lg"
                        style={{ borderRadius: "12px" }}
                      >
                        <Eye size={18} />
                      </Link>
                      <button
                        className="tech-button p-3 rounded-lg"
                        style={{ borderRadius: "12px" }}
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info - Improved Design */}
                <div
                  className="p-3 relative z-10"
                  style={{
                    borderRadius: "0 0 16px 16px",
                  }}
                >
                  {/* Product Name */}
                  <div className="mb-2">
                    <h3
                      className="font-bold text-sm line-clamp-2 roboto-mono"
                      style={{
                        color: "#000000",
                        transition: "color 0.3s ease",
                        letterSpacing: "0.5px",
                        lineHeight: "1.2",
                        minHeight: "2.4em",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = "#333333";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "#000000";
                      }}
                    >
                      <Link to={`/product/${product.id}`}>{product.name}</Link>
                    </h3>
                  </div>

                  {/* Brand */}
                  {product.brand && (
                    <div className="flex items-center mb-2">
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          background: "#000000",
                          borderRadius: "1px",
                          marginRight: "6px",
                        }}
                      />
                      <p
                        className="text-xs font-medium roboto-mono"
                        style={{
                          color: "#666666",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {product.brand.name}
                      </p>
                    </div>
                  )}

                  {/* Variants info - Compact Tech Style */}
                  {product.variants?.[0] && (
                    <div className="flex items-center gap-1 mb-2">
                      <span
                        className="inline-flex items-center px-1 py-0.5 rounded-md text-xs roboto-mono"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                          color: "#000000",
                          border: "1px solid #000000",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontSize: "10px",
                        }}
                      >
                        {product.variants[0].color}
                      </span>
                      <span
                        className="inline-flex items-center px-1 py-0.5 rounded-md text-xs roboto-mono"
                        style={{
                          background:
                            "linear-gradient(135deg, #000000 0%, #333333 100%)",
                          color: "#ffffff",
                          border: "1px solid #000000",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontSize: "10px",
                        }}
                      >
                        {product.variants[0].storage}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-center mb-2">
                    <div
                      className="flex items-center px-2 py-1 rounded-lg"
                      style={{
                        background:
                          (product.averageRating || 0) > 0
                            ? "linear-gradient(135deg, #ffd700 0%, #ffed4a 100%)"
                            : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                        border: "2px solid #000000",
                      }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={`${
                            i < Math.floor(product.averageRating || 0)
                              ? "text-black fill-current"
                              : "text-gray-400"
                          }`}
                        />
                      ))}
                      <span
                        className="text-xs ml-1 font-bold roboto-mono"
                        style={{
                          color:
                            (product.averageRating || 0) > 0
                              ? "#000000"
                              : "#666666",
                          fontSize: "10px",
                        }}
                      >
                        {(product.averageRating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Price - Clean Tech Design */}
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`text-lg md:text-xl font-bold roboto-mono ${
                            priceInfo.isFlashSale
                              ? "text-red-600"
                              : "text-black"
                          }`}
                          style={{
                            letterSpacing: "1px",
                          }}
                        >
                          {formatPrice(priceInfo.displayPrice)}
                        </span>
                        {hasDiscount && (
                          <span
                            className="text-xs line-through roboto-mono"
                            style={{
                              color: "#999999",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {formatPrice(priceInfo.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Action Buttons - Improved Design */}
                    <div
                      className="flex gap-1 pt-2"
                      style={{
                        borderTop: "2px solid #e0e0e0",
                      }}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        className="flex-1 py-2 px-2 rounded-xl text-xs font-bold text-center roboto-mono"
                        style={{
                          background:
                            "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                          color: "#000000",
                          border: "2px solid #000000",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          textDecoration: "none",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #000000 0%, #333333 100%)";
                          e.target.style.color = "#ffffff";
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow =
                            "0 8px 20px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)";
                          e.target.style.color = "#000000";
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        XEM CHI TIẾT
                      </Link>
                      <button
                        className="p-2 rounded-xl"
                        style={{
                          background:
                            "linear-gradient(135deg, #000000 0%, #333333 100%)",
                          color: "#ffffff",
                          border: "2px solid #000000",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #333333 0%, #555555 100%)";
                          e.target.style.transform =
                            "translateY(-2px) scale(1.05)";
                          e.target.style.boxShadow =
                            "0 8px 20px rgba(0,0,0,0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background =
                            "linear-gradient(135deg, #000000 0%, #333333 100%)";
                          e.target.style.transform = "translateY(0) scale(1)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button - Tech Style */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col items-center">
            <Link
              to="/productlist"
              className="group relative inline-flex items-center px-8 py-4 tech-button roboto-mono"
              style={{
                borderRadius: "16px",
                fontSize: "14px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                textDecoration: "none",
                overflow: "hidden",
              }}
            >
              <span className="relative z-10 mr-2">
                KHÁM PHÁ TẤT CẢ SẢN PHẨM
              </span>
              <Zap size={20} className="relative z-10" />
            </Link>
            <p
              className="text-xs mt-3 roboto-mono"
              style={{
                color: "#666666",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              HƠN {pinnedProducts.length} SẢN PHẨM CÔNG NGHỆ ĐANG CHỜ BẠN
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PinnedProducts;
