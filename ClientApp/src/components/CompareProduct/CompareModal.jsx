import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  ShoppingCart,
  Eye,
  Star,
  Zap,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Monitor,
  HardDrive,
} from "lucide-react";
import SpecificationComparison from "./SpecificationComparison";
import "./CompareModal.css";

// Tech-style CSS animations and styles
const techStyles = `
  @keyframes techGlow {
    0%, 100% { box-shadow: 0 0 5px rgba(0,0,0,0.3), 0 0 10px rgba(0,0,0,0.1); }
    50% { box-shadow: 0 0 15px rgba(0,0,0,0.5), 0 0 25px rgba(0,0,0,0.2); }
  }
  
  @keyframes techSlide {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(100%) skewX(-12deg); }
  }
  
  @keyframes techPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }
  
  @keyframes techScan {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  
  @keyframes techMatrix {
    0% { background-position: 0% 0%; }
    100% { background-position: 100% 100%; }
  }
  
  .tech-grid-bg {
    background-image: 
      linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
    background-size: 20px 20px;
  }
  
  .tech-circuit-pattern {
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(0,0,0,0.03) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(0,0,0,0.03) 0%, transparent 50%);
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
    background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.8) 50%, transparent 100%);
    animation: techScan 3s ease-in-out infinite;
  }
  
  .tech-hover-glow:hover {
    animation: techGlow 2s ease-in-out infinite;
  }
  
  .roboto-mono {
    font-family: 'Roboto Mono', monospace;
  }
`;

// Inject tech styles
if (
  typeof document !== "undefined" &&
  !document.getElementById("tech-compare-styles")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "tech-compare-styles";
  styleSheet.innerText = techStyles;
  document.head.appendChild(styleSheet);
}

const CompareModal = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized API base URL
  const apiBaseUrl = useMemo(() => process.env.REACT_APP_API_BASE_URL, []);

  // Optimized fetchCompareProducts with useCallback
  const fetchCompareProducts = useCallback(async () => {
    const ids = JSON.parse(localStorage.getItem("compareList") || "[]");

    if (ids.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/Products/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ids),
      });

      if (!response.ok) {
        throw new Error(`Không thể lấy dữ liệu so sánh: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu so sánh:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Optimized removeFromCompare
  const removeFromCompare = useCallback((productId) => {
    const currentList = JSON.parse(localStorage.getItem("compareList") || "[]");
    const updatedList = currentList.filter((id) => id !== productId);
    localStorage.setItem("compareList", JSON.stringify(updatedList));

    // Trigger custom event
    window.dispatchEvent(new Event("compareListChanged"));

    // Update products immediately for better UX
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  // Optimized clearAll
  const clearAll = useCallback(() => {
    localStorage.removeItem("compareList");
    window.dispatchEvent(new Event("compareListChanged"));
    setProducts([]);
    onClose();
  }, [onClose]);

  // Optimized close handler
  const handleBackgroundClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Effect to fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCompareProducts();
    }
  }, [isOpen, fetchCompareProducts]);

  // Tech-style Loading spinner component
  const LoadingSpinner = () => (
    <div
      className="flex flex-col items-center justify-center py-16 tech-grid-bg"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        border: "3px solid #000000",
        borderRadius: "24px",
        position: "relative",
        overflow: "hidden",
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

      {/* Tech Circuit Pattern */}
      <div
        className="tech-circuit-pattern"
        style={{ position: "absolute", inset: 0 }}
      />

      <div className="relative z-10">
        {/* Tech Loading Animation */}
        <div className="relative mb-6">
          <div
            className="w-20 h-20 border-4 border-black rounded-lg"
            style={{
              animation: "spin 1s linear infinite",
              background:
                "linear-gradient(45deg, transparent 30%, rgba(0,0,0,0.1) 50%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-2 left-2 w-16 h-16 border-4 border-transparent border-t-black rounded-lg"
            style={{ animation: "spin 1.5s linear infinite reverse" }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              width: "8px",
              height: "8px",
              background: "#000000",
              borderRadius: "2px",
              animation: "techPulse 1s ease-in-out infinite",
            }}
          />
        </div>

        <div className="text-center">
          <h3
            className="text-xl font-bold mb-2 roboto-mono"
            style={{
              color: "#000000",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            ĐANG TẢI DỮ LIỆU
          </h3>
          <p
            className="roboto-mono"
            style={{
              color: "#666666",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
          >
            SO SÁNH SẢN PHẨM...
          </p>
        </div>
      </div>
    </div>
  );

  // Tech-style Error component
  const ErrorDisplay = () => (
    <div
      className="text-center py-16 tech-grid-bg"
      style={{
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
        border: "3px solid #000000",
        borderRadius: "24px",
        position: "relative",
        overflow: "hidden",
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
            "linear-gradient(90deg, #ff0000 0%, #cc0000 25%, #990000 50%, #cc0000 75%, #ff0000 100%)",
          zIndex: 2,
        }}
      />

      {/* Tech Circuit Pattern */}
      <div
        className="tech-circuit-pattern"
        style={{ position: "absolute", inset: 0 }}
      />

      <div className="relative z-10">
        <div
          className="w-20 h-20 mx-auto mb-6 flex items-center justify-center tech-hover-glow"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
            border: "3px solid #000000",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <AlertCircle className="w-10 h-10" style={{ color: "#ff0000" }} />
        </div>

        <h3
          className="text-2xl font-bold mb-3 roboto-mono"
          style={{
            color: "#000000",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          LỖI HỆ THỐNG
        </h3>

        <p
          className="mb-6 roboto-mono"
          style={{
            color: "#666666",
            fontSize: "14px",
            letterSpacing: "1px",
          }}
        >
          {error}
        </p>

        <button
          onClick={fetchCompareProducts}
          className="tech-hover-glow roboto-mono"
          style={{
            background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
            color: "#ffffff",
            border: "3px solid #000000",
            padding: "16px 32px",
            borderRadius: "16px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontSize: "14px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 15px 40px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
          }}
        >
          <Zap className="w-5 h-5" />
          THỬ LẠI
        </button>
      </div>
    </div>
  );

  // Tech-style Empty state component
  const EmptyState = () => (
    <div
      className="text-center py-16 tech-grid-bg"
      style={{
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
        border: "3px solid #000000",
        borderRadius: "24px",
        position: "relative",
        overflow: "hidden",
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

      {/* Tech Circuit Pattern */}
      <div
        className="tech-circuit-pattern"
        style={{ position: "absolute", inset: 0 }}
      />

      <div className="relative z-10">
        <div
          className="w-32 h-32 mx-auto mb-8 flex items-center justify-center tech-hover-glow tech-scanline"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
            border: "3px solid #000000",
            borderRadius: "20px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          }}
        >
          <div className="relative">
            <Monitor className="w-16 h-16" style={{ color: "#000000" }} />
            <div
              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center"
              style={{
                background: "#000000",
                color: "#ffffff",
                borderRadius: "50%",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              0
            </div>
          </div>
        </div>

        <h3
          className="text-3xl font-bold mb-4 roboto-mono"
          style={{
            color: "#000000",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          CHƯA CÓ SẢN PHẨM
        </h3>

        <p
          className="text-lg roboto-mono"
          style={{
            color: "#666666",
            letterSpacing: "1px",
          }}
        >
          THÊM ÍT NHẤT 2 SẢN PHẨM ĐỂ BẮT ĐẦU SO SÁNH
        </p>

        {/* Tech decorative elements */}
        <div className="flex justify-center mt-8 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-3 h-3"
              style={{
                background: "#000000",
                borderRadius: "2px",
                animation: `techPulse ${1 + i * 0.2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "animate-fadeIn" : "opacity-0 pointer-events-none"
      }`}
      style={{
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        paddingTop: "80px", // Add top padding to avoid navbar overlap
      }}
      onClick={handleBackgroundClick}
    >
      <div
        className={`w-full max-h-[calc(95vh-80px)] overflow-hidden transform transition-all duration-300 tech-grid-bg ${
          products.length <= 2
            ? "max-w-5xl"
            : products.length === 3
            ? "max-w-6xl"
            : "max-w-7xl"
        } ${isOpen ? "animate-scaleIn" : "scale-95 opacity-0"}`}
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          border: "4px solid #000000",
          borderRadius: "24px",
          boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
          position: "relative",
          marginTop: "20px", // Additional margin from top
        }}
      >
        {/* Tech Modal Header */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
            color: "#ffffff",
          }}
        >
          {/* Animated tech pattern */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.03) 49%, rgba(255,255,255,0.03) 51%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, rgba(255,255,255,0.03) 49%, rgba(255,255,255,0.03) 51%, transparent 52%)
              `,
              backgroundSize: "20px 20px",
              animation: "techMatrix 20s linear infinite",
            }}
          />

          {/* Scanning line effect */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
              animation: "techSlide 3s ease-in-out infinite",
            }}
          />

          <div className="relative p-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div
                className="p-3 tech-hover-glow"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderRadius: "16px",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Monitor className="w-8 h-8" />
              </div>
              <div>
                <h2
                  className="text-2xl font-bold roboto-mono"
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  SO SÁNH SẢN PHẨM
                </h2>
                <p
                  className="text-white/80 text-sm mt-1 flex items-center roboto-mono"
                  style={{ letterSpacing: "1px" }}
                >
                  <span
                    className="inline-block w-2 h-2 mr-2"
                    style={{
                      background: "#00ff00",
                      borderRadius: "1px",
                      animation: "techPulse 1s ease-in-out infinite",
                    }}
                  />
                  {products.length} SẢN PHẨM ĐANG ĐƯỢC SO SÁNH
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {products.length > 0 && (
                <button
                  onClick={clearAll}
                  className="group flex items-center gap-2 roboto-mono tech-hover-glow"
                  style={{
                    background: "rgba(255,0,0,0.9)",
                    backdropFilter: "blur(10px)",
                    padding: "12px 20px",
                    borderRadius: "16px",
                    border: "2px solid rgba(255,255,255,0.2)",
                    fontSize: "14px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.05)";
                    e.target.style.background = "rgba(255,0,0,1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.background = "rgba(255,0,0,0.9)";
                  }}
                >
                  <svg
                    className="w-4 h-4 group-hover:rotate-12 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  XÓA TẤT CẢ
                </button>
              )}
              <button
                onClick={onClose}
                className="group p-3 tech-hover-glow"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  border: "2px solid rgba(255,255,255,0.2)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.1) rotate(90deg)";
                  e.target.style.background = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1) rotate(0deg)";
                  e.target.style.background = "rgba(255,255,255,0.1)";
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tech Content Area */}
        <div
          className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] tech-grid-bg"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          }}
        >
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorDisplay />
          ) : products.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <div
                className={`grid gap-8 pb-4 ${
                  products.length === 1
                    ? "grid-cols-1 max-w-md mx-auto"
                    : products.length === 2
                    ? "grid-cols-1 lg:grid-cols-2"
                    : products.length === 3
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4"
                }`}
              >
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="relative overflow-hidden group tech-hover-glow tech-scanline"
                    style={{
                      background:
                        "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                      border: "3px solid #000000",
                      borderRadius: "20px",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                      transition: "all 0.4s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 30px 80px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 60px rgba(0,0,0,0.1)";
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

                    {/* Product Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <div
                        className="flex items-center roboto-mono"
                        style={{
                          background:
                            "linear-gradient(135deg, #000000 0%, #333333 100%)",
                          color: "#ffffff",
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: "8px 16px",
                          borderRadius: "12px",
                          border: "2px solid #000000",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        }}
                      >
                        <Cpu className="w-3 h-3 mr-1" />#{index + 1}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-4 right-4 z-20 group/btn tech-hover-glow"
                      style={{
                        background:
                          "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                        color: "#ffffff",
                        padding: "8px",
                        borderRadius: "12px",
                        border: "2px solid #000000",
                        boxShadow: "0 4px 12px rgba(255,0,0,0.3)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.1)";
                        e.target.style.background =
                          "linear-gradient(135deg, #ff3333 0%, #ff0000 100%)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.background =
                          "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)";
                      }}
                      aria-label="Xóa khỏi so sánh"
                    >
                      <X className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                    </button>

                    {/* Product Image */}
                    <div
                      className="relative h-64 overflow-hidden tech-grid-bg"
                      style={{
                        background:
                          "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                        margin: "20px",
                        borderRadius: "16px",
                        border: "2px solid #e0e0e0",
                      }}
                    >
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0].imageUrl?.startsWith("http")
                              ? product.images[0].imageUrl
                              : `${apiBaseUrl}/${product.images[0].imageUrl}`
                            : "https://via.placeholder.com/300"
                        }
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300";
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3
                        className="text-lg font-bold mb-3 roboto-mono line-clamp-2"
                        style={{
                          color: "#000000",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          fontSize: "16px",
                        }}
                      >
                        {product.name}
                      </h3>

                      {/* Brand and Category */}
                      <div className="flex gap-3 mb-4">
                        <div
                          className="flex-1 p-3"
                          style={{
                            background:
                              "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
                            borderRadius: "12px",
                            border: "2px solid #000000",
                          }}
                        >
                          <p
                            className="text-xs mb-1 roboto-mono"
                            style={{
                              color: "#666666",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            THƯƠNG HIỆU
                          </p>
                          <p
                            className="font-bold roboto-mono"
                            style={{
                              color: "#000000",
                              fontSize: "14px",
                              textTransform: "uppercase",
                            }}
                          >
                            {product.brand}
                          </p>
                        </div>
                        <div
                          className="flex-1 p-3"
                          style={{
                            background:
                              "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
                            borderRadius: "12px",
                            border: "2px solid #000000",
                          }}
                        >
                          <p
                            className="text-xs mb-1 roboto-mono"
                            style={{
                              color: "#666666",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            DANH MỤC
                          </p>
                          <p
                            className="font-bold roboto-mono"
                            style={{
                              color: "#000000",
                              fontSize: "14px",
                              textTransform: "uppercase",
                            }}
                          >
                            {product.category}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {product.description && (
                        <div
                          className="mb-4 p-3"
                          style={{
                            background:
                              "linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%)",
                            borderRadius: "12px",
                            border: "2px solid #e0e0e0",
                          }}
                        >
                          <p
                            className="text-xs line-clamp-2 roboto-mono"
                            style={{
                              color: "#666666",
                              lineHeight: "1.4",
                            }}
                          >
                            {product.description}
                          </p>
                        </div>
                      )}

                      {/* Variants */}
                      <div
                        className="border-t pt-4"
                        style={{ borderColor: "#e0e0e0", borderWidth: "2px" }}
                      >
                        <h4
                          className="font-bold mb-3 flex items-center roboto-mono"
                          style={{
                            color: "#000000",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            fontSize: "14px",
                          }}
                        >
                          <div
                            className="w-2 h-2 mr-2"
                            style={{
                              background: "#000000",
                              borderRadius: "1px",
                            }}
                          />
                          BIẾN THỂ ({product.variants.length})
                        </h4>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {product.variants.slice(0, 2).map((variant, i) => (
                            <div
                              key={i}
                              className="p-3 tech-hover-glow"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%)",
                                borderRadius: "12px",
                                border: "2px solid #e0e0e0",
                                transition: "all 0.3s ease",
                              }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p
                                    className="font-bold roboto-mono"
                                    style={{
                                      color: "#000000",
                                      fontSize: "13px",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {variant.color} - {variant.storage}
                                  </p>
                                </div>
                                <div className="flex items-center ml-2">
                                  {variant.stockQuantity > 0 ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-600 mr-1" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3 text-red-600 mr-1" />
                                  )}
                                  <span
                                    className={`text-xs font-bold px-2 py-1 roboto-mono`}
                                    style={{
                                      borderRadius: "8px",
                                      textTransform: "uppercase",
                                      letterSpacing: "1px",
                                      background:
                                        variant.stockQuantity > 10
                                          ? "linear-gradient(135deg, #00ff00 0%, #00cc00 100%)"
                                          : variant.stockQuantity > 0
                                          ? "linear-gradient(135deg, #ffaa00 0%, #ff8800 100%)"
                                          : "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                                      color: "#ffffff",
                                      border: "1px solid #000000",
                                    }}
                                  >
                                    {variant.stockQuantity > 0
                                      ? `${variant.stockQuantity}`
                                      : "HẾT"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                {variant.discountPrice ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <span
                                      className="font-bold roboto-mono"
                                      style={{
                                        color: "#ff0000",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {variant.discountPrice.toLocaleString()}Đ
                                    </span>
                                    <span
                                      className="line-through roboto-mono"
                                      style={{
                                        color: "#999999",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {variant.price.toLocaleString()}Đ
                                    </span>
                                  </div>
                                ) : (
                                  <span
                                    className="font-bold flex-1 roboto-mono"
                                    style={{
                                      color: "#000000",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {variant.price.toLocaleString()}Đ
                                  </span>
                                )}

                                {/* Add to Cart Button for Variant */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(
                                      `Đã thêm "${product.name} - ${variant.color} ${variant.storage}" vào giỏ hàng!`
                                    );
                                  }}
                                  className="ml-2 tech-hover-glow"
                                  style={{
                                    background:
                                      variant.stockQuantity === 0
                                        ? "linear-gradient(135deg, #cccccc 0%, #999999 100%)"
                                        : "linear-gradient(135deg, #000000 0%, #333333 100%)",
                                    color: "#ffffff",
                                    padding: "8px",
                                    borderRadius: "8px",
                                    border: "2px solid #000000",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    transition: "all 0.3s ease",
                                    cursor:
                                      variant.stockQuantity === 0
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity:
                                      variant.stockQuantity === 0 ? 0.5 : 1,
                                  }}
                                  disabled={variant.stockQuantity === 0}
                                  title={
                                    variant.stockQuantity === 0
                                      ? "Hết hàng"
                                      : "Thêm vào giỏ hàng"
                                  }
                                  onMouseEnter={(e) => {
                                    if (variant.stockQuantity > 0) {
                                      e.target.style.transform = "scale(1.1)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "scale(1)";
                                  }}
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {product.variants.length > 2 && (
                            <div className="text-center py-2">
                              <span
                                className="roboto-mono"
                                style={{
                                  fontSize: "12px",
                                  color: "#666666",
                                  background:
                                    "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
                                  padding: "6px 12px",
                                  borderRadius: "8px",
                                  border: "1px solid #cccccc",
                                  textTransform: "uppercase",
                                  letterSpacing: "1px",
                                }}
                              >
                                +{product.variants.length - 2} BIẾN THỂ KHÁC
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div
                        className="mt-6 pt-4"
                        style={{ borderTop: "2px solid #e0e0e0" }}
                      >
                        <button
                          onClick={() =>
                            (window.location.href = `/product/${product.id}`)
                          }
                          className="w-full group tech-hover-glow roboto-mono"
                          style={{
                            background:
                              "linear-gradient(135deg, #000000 0%, #333333 100%)",
                            color: "#ffffff",
                            padding: "16px",
                            borderRadius: "16px",
                            border: "3px solid #000000",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            fontSize: "14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "12px",
                            transition: "all 0.3s ease",
                            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow =
                              "0 12px 35px rgba(0,0,0,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                              "0 8px 25px rgba(0,0,0,0.2)";
                          }}
                        >
                          <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          XEM CHI TIẾT
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specification Comparison Table */}
              <SpecificationComparison products={products} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
