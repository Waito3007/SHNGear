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
import "./ProductHoverPreview.css";

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
      storage: "Bộ nhớ",
      battery: "Pin",
      screen: "Màn hình",
      camera: "Camera",
      weight: "Trọng lượng",
      bluetooth: "Bluetooth",
      wifi: "Wifi",
      type: "Loại",
      connectionType: "Kết nối",
      port: "Cổng kết nối",
    };
    return keyMap[key.toLowerCase()] || key;
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
      .map(([key, value]) => {
        const Icon = getSpecIcon(key);
        return (
          <div key={key} className="spec-item">
            <div className="spec-icon">
              <Icon size={16} />
            </div>
            <div className="spec-content">
              <div className="spec-label">{formatSpecKey(key)}</div>
              <div className="spec-value">{value}</div>
            </div>
          </div>
        );
      });
  };

  const previewStyle = {
    transform: `translate(${position.x + 20}px, ${position.y + 20}px)`,
  };

  return (
    <div className="preview-card" style={previewStyle}>
      <div className="preview-header">
        <img
          src={
            product.image?.startsWith("http")
              ? product.image
              : `${process.env.REACT_APP_API_BASE_URL}/${product.image}`
          }
          alt={product.name}
          className="preview-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/200?text=No+Image";
          }}
        />
        <div className="preview-title">
          <div className="preview-name">{product.name}</div>
          {product.brand && (
            <div className="preview-brand">
              {product.brand.logo && (
                <img
                  src={
                    product.brand.logo.startsWith("http")
                      ? product.brand.logo
                      : `${process.env.REACT_APP_API_BASE_URL}/${product.brand.logo}`
                  }
                  alt={product.brand.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
              )}
              <span>{product.brand.name}</span>
            </div>
          )}
          <div className="preview-price">
            <span className="preview-current-price">
              {product.newPrice.toLocaleString()}đ
            </span>
            {product.oldPrice > product.newPrice && (
              <>
                <span className="preview-old-price">
                  {product.oldPrice.toLocaleString()}đ
                </span>
                <span className="preview-discount">-{product.discount}%</span>
              </>
            )}
          </div>
        </div>
      </div>

      {product.specifications && (
        <div className="preview-specs">
          <div className="preview-specs-title">
            <Settings size={16} />
            Thông số kỹ thuật
          </div>
          <div className="specs-grid">{renderSpecs()}</div>
        </div>
      )}
    </div>
  );
};

export default ProductHoverPreview;
