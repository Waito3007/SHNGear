import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Heart, 
  ShoppingBag, 
  Star, 
  Eye, 
  Tag,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import homePageService from "../../services/homePageService";
import './NewArrivals.css';

const NewArrivals = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Default new arrivals data (memoized to prevent recreation on every render)
  const defaultNewProducts = useMemo(() => [
    {
      id: 1,
      name: "iPhone 15 Pro Max 256GB",
      category: "smartphone",
      price: 32990000,
      originalPrice: 34990000,
      discount: 6,
      image: "/images/products/iphone-15-pro-max-new.jpg",
      rating: 4.9,
      reviews: 124,
      isNew: true,
      isTrending: true,
      arrivalDate: new Date('2024-01-10'),
      colors: ['#000000', '#4169E1', '#FFD700', '#8B4513'],
      tags: ['Premium', 'Pro Max', 'Latest']
    },
    {
      id: 2,
      name: "MacBook Air M3 15 inch",
      category: "laptop",
      price: 34990000,
      originalPrice: 39990000,
      discount: 13,
      image: "/images/products/macbook-air-m3-new.jpg",
      rating: 4.8,
      reviews: 89,
      isNew: true,
      isTrending: true,
      arrivalDate: new Date('2024-01-12'),
      colors: ['#C0C0C0', '#FFD700', '#000000', '#8B4513'],
      tags: ['M3 Chip', 'Ultra-thin', 'Performance']
    },
    {
      id: 3,
      name: "AirPods Max 2nd Gen",
      category: "accessories",
      price: 13990000,
      originalPrice: 15990000,
      discount: 13,
      image: "/images/products/airpods-max-2-new.jpg",
      rating: 4.9,
      reviews: 156,
      isNew: true,
      isTrending: true,
      arrivalDate: new Date('2024-01-08'),
      colors: ['#8B4513', '#000000', '#D2691E', '#A0522D'],
      tags: ['Premium Audio', 'Noise Cancellation', 'Spatial Audio']
    },
    {
      id: 4,
      name: "iPad Pro M4 11 inch",
      category: "accessories",
      price: 24990000,
      originalPrice: 27990000,
      discount: 11,
      image: "/images/products/ipad-pro-m4-new.jpg",
      rating: 4.7,
      reviews: 203,
      isNew: true,
      isTrending: false,
      arrivalDate: new Date('2024-01-15'),
      colors: ['#C0C0C0', '#000000', '#8B4513'],
      tags: ['M4 Chip', 'Pro Display', 'Creative']
    }
  ], []);

  // Load homepage settings and new arrivals
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const homeSettings = await homePageService.getHomePageSettings();
        setSettings(homeSettings);
        
        // Use new arrivals from settings if available, otherwise use defaults
        if (homeSettings && homeSettings.newArrivals) {
          setProducts(homeSettings.newArrivals);
        } else {
          // Use default new arrivals data
          const defaultSettings = homePageService.getDefaultSettings();
          setProducts(defaultSettings.newArrivals || defaultNewProducts);
        }
      } catch (error) {
        console.error('Error loading new arrivals data:', error);
        // Use default data on error
        setProducts(defaultNewProducts);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [defaultNewProducts]);

  // Don't render if settings indicate this section is inactive
  if (!loading && settings && !settings.newArrivalsIsActive) {
    return null;
  }

  const filters = [
    { id: 'all', label: 'All New', icon: Zap },
    { id: 'smartphone', label: 'Smartphones', icon: Heart },
    { id: 'laptop', label: 'Laptops', icon: TrendingUp },
    { id: 'accessories', label: 'Accessories', icon: Tag },
  ];

  const filteredProducts = activeFilter === 'all' 
    ? products 
    : products.filter(product => product.category === activeFilter);

  const getDaysAgo = (arrivalDate) => {
    const diffTime = Math.abs(currentTime - arrivalDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <section className="new-arrivals-section">
        <div className="new-arrivals-container">
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
        </div>
      </section>
    );
  }

  return (
    <section className="new-arrivals-section">
      <div className="new-arrivals-container">
        {/* Header */}
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="header-content">
            <div className="header-badge">
              <Clock size={20} />
              Just Dropped
            </div>
            <h2>Hàng mới về</h2>
            <p>Khám phá những sản phẩm mới nhất và xu hướng hot nhất vừa có mặt trong bộ sưu tập của chúng tôi</p>
          </div>
          <motion.button 
            className="view-all-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Xem tất cả
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="filter-tabs"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <filter.icon size={18} />
              {filter.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          className="products-grid"
          layout
        >
          <AnimatePresence mode="wait">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                className="product-card"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onHoverStart={() => setHoveredProduct(product.id)}
                onHoverEnd={() => setHoveredProduct(null)}
              >
                {/* Product Badges */}
                <div className="product-badges">
                  {product.isNew && (
                    <span className="badge new-badge">
                      <Zap size={12} />
                      Mới
                    </span>
                  )}
                  {product.isTrending && (
                    <span className="badge trending-badge">
                      <TrendingUp size={12} />
                      Hot
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="badge discount-badge">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Product Image */}
                <div className="product-image-container">
                  <img src={product.image} alt={product.name} className="product-image" />
                  
                  {/* Quick Actions */}
                  <motion.div 
                    className="quick-actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: hoveredProduct === product.id ? 1 : 0,
                      y: hoveredProduct === product.id ? 0 : 20
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <button className="quick-action-btn">
                      <Eye size={18} />
                    </button>
                    <button className="quick-action-btn favorite">
                      <Heart size={18} />
                    </button>
                    <button className="quick-action-btn primary">
                      <ShoppingBag size={18} />
                    </button>
                  </motion.div>

                  {/* Arrival Time */}
                  <div className="arrival-time">
                    <Clock size={14} />
                    {getDaysAgo(product.arrivalDate)} ngày trước
                  </div>
                </div>

                {/* Product Info */}
                <div className="product-info">
                  <div className="product-category">{product.category}</div>
                  <h3 className="product-name">{product.name}</h3>
                  
                  {/* Rating */}
                  <div className="product-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < Math.floor(product.rating) ? 'filled' : ''}
                        />
                      ))}
                    </div>
                    <span className="rating-text">
                      {product.rating} ({product.reviews} đánh giá)
                    </span>
                  </div>

                  {/* Colors */}
                  <div className="product-colors">
                    {product.colors.slice(0, 4).map((color, i) => (
                      <div 
                        key={i}
                        className="color-swatch"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    {product.colors.length > 4 && (
                      <div className="color-more">+{product.colors.length - 4}</div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="product-price">
                    <span className="current-price">{formatPrice(product.price)}</span>
                    {product.originalPrice > product.price && (
                      <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="product-tags">
                    {product.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="product-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <motion.button 
                  className="add-to-cart-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Thêm vào giỏ
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="new-arrivals-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="cta-content">
            <h3>Đừng bỏ lỡ!</h3>
            <p>Hãy là người đầu tiên sở hữu những sản phẩm mới nhất trong bộ sưu tập của chúng tôi. Số lượng có hạn!</p>
            <motion.button 
              className="cta-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mua sắm tất cả hàng mới
              <ArrowRight size={20} />
            </motion.button>
          </div>
          <div className="cta-stats">
            <div className="stat">
              <div className="stat-number">50+</div>
              <div className="stat-label">Sản phẩm mới</div>
            </div>
            <div className="stat">
              <div className="stat-number">24h</div>
              <div className="stat-label">Cập nhật hàng ngày</div>
            </div>
            <div className="stat">
              <div className="stat-number">Miễn phí</div>
              <div className="stat-label">Giao hàng nhanh</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewArrivals;
