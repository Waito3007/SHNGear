import React from "react";
import {
  Smartphone,
  Laptop,
  Headphones,
  Monitor,
  Cpu,
  MemoryStick,
  Battery,
  Bluetooth,
  Weight,
  HardDrive,
  Camera,
  Wifi,
  Settings,
  Radio,
} from "lucide-react";

// Tech-style CSS animations
const styles = `
  @keyframes fadeInScale {
    0% {
      opacity: 0;
      transform: scale(0.9) translateY(10px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(0,0,0,0.2);
    }
  }
  
  @keyframes slideInSpec {
    0% {
      opacity: 0;
      transform: translateX(-20px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .tech-preview-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .tech-preview-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .tech-preview-scrollbar::-webkit-scrollbar-thumb {
    background: #000000;
    border-radius: 3px;
  }
  
  .tech-preview-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #333333;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  if (
    !document.head.querySelector('style[data-component="ProductHoverPreview"]')
  ) {
    styleSheet.setAttribute("data-component", "ProductHoverPreview");
    document.head.appendChild(styleSheet);
  }
}

const ProductHoverPreview = ({ product, isVisible, position }) => {
  if (!isVisible || !product) return null;

  const getSpecIcon = (key) => {
    const icons = {
      cpu: Cpu,
      ram: MemoryStick,
      storage: HardDrive,
      battery: Battery,
      screen: Monitor,
      camera: Camera,
      weight: Weight,
      bluetooth: Bluetooth,
      wifi: Wifi,
      type: Headphones,
      connectionType: Radio,
      port: Settings,
    };
    return icons[key.toLowerCase()] || Settings;
  };

  const formatSpecKey = (key) => {
    const keyMap = {
      cpu: "CPU",
      ram: "RAM",
      storage: "BỘ NHỚ",
      battery: "PIN",
      screen: "MÀN HÌNH",
      camera: "CAMERA",
      weight: "TRỌNG LƯỢNG",
      bluetooth: "BLUETOOTH",
      wifi: "WIFI",
      type: "LOẠI",
      connectionType: "KẾT NỐI",
      port: "CỔNG KẾT NỐI",
    };
    return keyMap[key.toLowerCase()] || key.toUpperCase();
  };
  const renderSpecs = () => {
    if (!product.specifications) return null;

    const specs = { ...product.specifications };
    delete specs.id;
    delete specs.productId;
    delete specs.product;
    delete specs.type;
    return Object.entries(specs)
      .filter(([_, value]) => value)
      .slice(0, 6)
      .map(([key, value], index) => {
        const Icon = getSpecIcon(key);
        return (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
              borderRadius: "12px",
              border: "2px solid #000000",
              marginBottom: "8px",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
              animation: `slideInSpec 0.3s ease ${index * 0.1}s both`,
            }}
            onMouseEnter={(e) => {
              e.target.style.background =
                "linear-gradient(145deg, #f0f0f0 0%, #e8e9ea 100%)";
              e.target.style.transform = "translateX(4px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)";
              e.target.style.transform = "translateX(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                border: "2px solid #000000",
                flexShrink: 0,
              }}
            >
              <Icon size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#666666",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "2px",
                }}
              >
                {formatSpecKey(key)}
              </div>
              <div
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#000000",
                  lineHeight: "1.2",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </div>
            </div>
          </div>
        );
      });
  };
  const previewStyle = {
    position: "fixed",
    top: `${Math.min(position.y + 20, window.innerHeight - 600)}px`,
    left: `${Math.min(position.x + 20, window.innerWidth - 400)}px`,
    zIndex: 10000,
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        ...previewStyle,
        width: "380px",
        background:
          "linear-gradient(145deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)",
        borderRadius: "20px",
        border: "3px solid #000000",
        padding: "0",
        boxShadow: `
          0 0 0 1px rgba(0,0,0,0.1),
          0 25px 80px rgba(0,0,0,0.2),
          0 35px 100px rgba(0,0,0,0.25)
        `,
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Roboto Mono', monospace",
        animation: "fadeInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
            radial-gradient(circle at 15% 85%, rgba(0,0,0,0.02) 0%, transparent 50%),
            radial-gradient(circle at 85% 15%, rgba(0,0,0,0.02) 0%, transparent 50%)
          `,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Header Section */}
      <div
        style={{
          padding: "20px",
          borderBottom: "2px solid #000000",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          {/* Product Image */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "12px",
              border: "2px solid #000000",
              overflow: "hidden",
              background: "linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)",
              flexShrink: 0,
            }}
          >
            <img
              src={
                product.image?.startsWith("http")
                  ? product.image
                  : `${process.env.REACT_APP_API_BASE_URL}/${product.image}`
              }
              alt={product.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/80?text=No+Image";
              }}
            />
          </div>

          {/* Product Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Brand */}
            {product.brand && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  padding: "6px 10px",
                  background:
                    "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
                  borderRadius: "8px",
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
                      width: "16px",
                      height: "16px",
                      objectFit: "contain",
                      borderRadius: "3px",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#666666",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {product.brand.name}
                </span>
              </div>
            )}

            {/* Product Name */}
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
                lineHeight: "1.3",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.name}
            </div>

            {/* Price */}
            <div
              style={{
                padding: "10px 12px",
                background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
                borderRadius: "10px",
                border: "2px solid #000000",
                textAlign: "center",
              }}
            >
              {product.oldPrice > product.newPrice && (
                <div
                  style={{
                    fontSize: "10px",
                    textDecoration: "line-through",
                    color: "#cccccc",
                    marginBottom: "2px",
                    fontWeight: 500,
                  }}
                >
                  {product.oldPrice.toLocaleString()}đ
                </div>
              )}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "1px",
                }}
              >
                {product.newPrice.toLocaleString()}đ
              </div>
              {product.discount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background:
                      "linear-gradient(135deg, #ff0000 0%, #cc0000 100%)",
                    color: "#ffffff",
                    fontSize: "9px",
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: "12px",
                    border: "2px solid #ffffff",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  -{product.discount}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      {product.specifications && (
        <div
          style={{
            padding: "20px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              padding: "10px 12px",
              background: "linear-gradient(145deg, #000000 0%, #333333 100%)",
              borderRadius: "12px",
              border: "2px solid #000000",
            }}
          >
            <Settings size={16} style={{ color: "#ffffff" }} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              THÔNG SỐ KỸ THUẬT
            </span>
          </div>{" "}
          <div
            className="tech-preview-scrollbar"
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {renderSpecs()}
          </div>
        </div>
      )}

      {/* Tech Corner Accent */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          width: "30px",
          height: "30px",
          background: "linear-gradient(135deg, #000000 0%, #333333 100%)",
          borderRadius: "6px",
          border: "2px solid #000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            background: "#ffffff",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
};

export default ProductHoverPreview;
