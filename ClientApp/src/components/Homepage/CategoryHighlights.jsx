import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Laptop, Headphones, Tablet, Watch, Camera, Gamepad2, Speaker } from "lucide-react";
import homePageService from "../../services/homePageService";
import "./CategoryHighlights.css";

const CategoryHighlights = ({ settings: passedSettings }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(passedSettings);

  // Default categories data (memoized to prevent recreation on every render)
  const defaultCategories = useMemo(() => [
    {
      id: 1,
      name: "Smartphone",
      description: "Điện thoại thông minh",
      productCount: 156,
      icon: Smartphone,
      image: "/images/categories/smartphones.jpg",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      trending: true
    },
    {
      id: 2,
      name: "Laptop",
      description: "Máy tính xách tay",
      productCount: 89,
      icon: Laptop,
      image: "/images/categories/laptops.jpg",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      trending: false
    },
    {
      id: 3,
      name: "Audio",
      description: "Tai nghe & Loa",
      productCount: 234,
      icon: Headphones,
      image: "/images/categories/audio.jpg",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      trending: true
    },
    {
      id: 4,
      name: "Tablet",
      description: "Máy tính bảng",
      productCount: 67,
      icon: Tablet,
      image: "/images/categories/tablets.jpg",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      trending: false
    },
    {
      id: 5,
      name: "Smartwatch",
      description: "Đồng hồ thông minh",
      productCount: 123,
      icon: Watch,
      image: "/images/categories/smartwatches.jpg",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      trending: true
    },
    {
      id: 6,
      name: "Camera",
      description: "Máy ảnh & Phụ kiện",
      productCount: 78,
      icon: Camera,
      image: "/images/categories/cameras.jpg",
      color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      trending: false
    },
    {
      id: 7,
      name: "Gaming",
      description: "Thiết bị Gaming",
      productCount: 145,
      icon: Gamepad2,
      image: "/images/categories/gaming.jpg",
      color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      trending: true
    },
    {
      id: 8,
      name: "Smart Home",
      description: "Nhà thông minh",
      productCount: 92,
      icon: Speaker,
      image: "/images/categories/smart-home.jpg",      color: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      trending: false
    }
  ], []);

  // Load homepage settings and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const homeSettings = await homePageService.getHomePageSettings();
        setSettings(homeSettings);
        
        // Use categories from settings if available, otherwise use defaults
        if (homeSettings && homeSettings.featuredCategories) {
          setCategories(homeSettings.featuredCategories);
        } else {
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Error loading category highlights data:', error);
        // Use default data on error
        const defaultSettings = homePageService.getDefaultSettings();
        setSettings(defaultSettings);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [defaultCategories]);

  // Don't render if settings indicate this section is inactive
  if (!loading && settings && !settings.categoryHighlightsIsActive) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="category-highlights">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Danh mục nổi bật</h2>
          <p className="section-subtitle">
            Khám phá các danh mục sản phẩm công nghệ hàng đầu tại SHN Gear
          </p>
        </motion.div>

        <motion.div
          className="categories-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className={`category-card ${index < 4 ? 'featured' : ''}`}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              <div className="category-image-container">
                <div 
                  className="category-background"
                  style={{ background: category.color }}
                ></div>
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="category-image"
                />
                
                {category.trending && (
                  <span className="trending-badge">Trending</span>
                )}
                
                <div className="category-overlay">
                  <motion.button
                    className="explore-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Khám phá ngay
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="category-content">
                <div className="category-icon">
                  <category.icon size={24} />
                </div>
                
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-description">{category.description}</p>
                  <div className="category-stats">
                    <span className="product-count">
                      {category.productCount} sản phẩm
                    </span>
                  </div>
                </div>

                <motion.div
                  className="category-arrow"
                  whileHover={{ x: 5 }}
                >
                  <ArrowRight size={20} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="category-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="cta-content">
            <h3>Không tìm thấy sản phẩm phù hợp?</h3>
            <p>Liên hệ với chúng tôi để được tư vấn miễn phí</p>
            <div className="cta-buttons">
              <motion.button
                className="cta-btn primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Tư vấn miễn phí
              </motion.button>
              <motion.button
                className="cta-btn secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xem tất cả danh mục
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryHighlights;
