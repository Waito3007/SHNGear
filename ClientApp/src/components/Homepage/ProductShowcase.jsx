import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Heart, ShoppingCart, Eye, TrendingUp } from "lucide-react";
import homePageService from "../../services/homePageService";
import "./ProductShowcase.css";

const ProductShowcase = ({ settings: passedSettings }) => {
  const [activeTab, setActiveTab] = useState("featured");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(passedSettings);
  // Default products data (memoized to prevent recreation on every render)
  const defaultProducts = useMemo(() => [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      category: "Smartphone",
      price: 29990000,
      originalPrice: 34990000,
      discount: 14,
      image: "/images/products/iphone-15-pro-max.jpg",
      rating: 4.9,
      reviews: 1234,
      badge: "Hot",
      isNew: true,
      features: ["Camera 48MP", "Chip A17 Pro", "Titanium"]
    },
    {
      id: 2,
      name: "MacBook Pro M3 14 inch",
      category: "Laptop",
      price: 42990000,
      originalPrice: 49990000,
      discount: 14,
      image: "/images/products/macbook-pro-m3.jpg",
      rating: 4.8,
      reviews: 856,
      badge: "Bestseller",
      isNew: false,
      features: ["Chip M3", "16GB RAM", "512GB SSD"]
    },
    {
      id: 3,
      name: "AirPods Pro 3rd Gen",
      category: "Audio",
      price: 6990000,
      originalPrice: 7990000,
      discount: 12,
      image: "/images/products/airpods-pro-3.jpg",
      rating: 4.7,
      reviews: 2341,
      badge: "Limited",
      isNew: true,
      features: ["Noise Cancellation", "Spatial Audio", "H2 Chip"]
    },
    {
      id: 4,
      name: "iPad Pro M2 12.9 inch",
      category: "Tablet",
      price: 24990000,
      originalPrice: 28990000,
      discount: 14,
      image: "/images/products/ipad-pro-m2.jpg",
      rating: 4.8,
      reviews: 567,
      badge: "Pro",
      isNew: false,      features: ["M2 Chip", "Liquid Retina XDR", "12.9 inch"]
    }
  ], []);

  const tabs = [
    { id: "featured", label: "Sản phẩm nổi bật", icon: TrendingUp },
    { id: "new", label: "Hàng mới về", icon: Star },
    { id: "bestseller", label: "Bán chạy nhất", icon: ArrowRight },
    { id: "sale", label: "Giảm giá", icon: Heart }
  ];

  // Load homepage settings and products
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const homeSettings = await homePageService.getHomePageSettings();
        setSettings(homeSettings);
        
        // For now, use default products. This would be replaced with actual product API calls
        // that filter products based on activeTab (featured, new, bestseller, sale)
        setProducts(defaultProducts);
      } catch (error) {
        console.error('Error loading product showcase data:', error);
        // Use default data on error
        const defaultSettings = homePageService.getDefaultSettings();
        setSettings(defaultSettings);
        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    };    loadData();
  }, [activeTab, defaultProducts]);

  // Don't render if settings indicate this section is inactive
  if (!loading && settings && !settings.productShowcaseIsActive) {
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const ProductCard = ({ product, index }) => (
    <motion.div
      className="product-showcase-card"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      <div className="product-image-container">
        <img src={product.image} alt={product.name} />
        {product.badge && (
          <span className={`product-badge ${product.badge.toLowerCase()}`}>
            {product.badge}
          </span>
        )}
        {product.isNew && <span className="new-badge">Mới</span>}
        {product.discount > 0 && (
          <span className="discount-badge">-{product.discount}%</span>
        )}
        
        <div className="product-overlay">
          <div className="quick-actions">
            <motion.button
              className="quick-action-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye size={18} />
            </motion.button>
            <motion.button
              className="quick-action-btn"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart size={18} />
            </motion.button>
            <motion.button
              className="quick-action-btn primary"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ShoppingCart size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        
        <div className="product-features">
          {product.features.slice(0, 2).map((feature, idx) => (
            <span key={idx} className="feature-tag">{feature}</span>
          ))}
        </div>

        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(product.rating) ? "filled" : ""}
              />
            ))}
          </div>
          <span className="rating-text">
            {product.rating} ({product.reviews} đánh giá)
          </span>
        </div>

        <div className="product-pricing">
          <div className="current-price">{formatPrice(product.price)}</div>
          {product.originalPrice > product.price && (
            <div className="original-price">{formatPrice(product.originalPrice)}</div>
          )}
        </div>

        <motion.button
          className="add-to-cart-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Thêm vào giỏ
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <section className="product-showcase">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Sản phẩm đặc sắc</h2>
          <p className="section-subtitle">
            Khám phá những sản phẩm công nghệ hàng đầu được lựa chọn kỹ càng
          </p>
        </motion.div>

        <div className="showcase-tabs">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon size={20} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-price"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            className="products-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        )}

        <motion.div
          className="view-all-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="view-all-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Xem tất cả sản phẩm
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductShowcase;
