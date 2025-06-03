import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Zap, Gift, Star, ChevronLeft, ChevronRight } from "lucide-react";
import homePageService from "../../services/homePageService";
import "./PromotionalBanners.css";

const PromotionalBanners = ({ settings: passedSettings }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(passedSettings);

  // Default promotional banners data (memoized to prevent recreation on every render)
  const defaultBanners = useMemo(() => [
    {
      id: 1,
      type: "flash-sale",
      title: "Flash Sale 24H",
      subtitle: "Giảm đến 50% cho tất cả iPhone",
      description: "Cơ hội vàng sở hữu iPhone với giá không thể tốt hơn",
      backgroundImage: "/images/banners/flash-sale-iphone.jpg",
      backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      textColor: "white",
      ctaText: "Mua ngay",
      ctaLink: "/flash-sale",
      icon: Zap,
      badge: "HOT",
      endTime: "2024-12-31T23:59:59",
      features: ["Miễn phí vận chuyển", "Bảo hành 12 tháng", "Đổi trả 7 ngày"]
    },
    {
      id: 2,
      type: "new-collection",
      title: "Bộ sưu tập mới",
      subtitle: "MacBook Pro M3 - Đã có mặt",
      description: "Trải nghiệm hiệu năng đỉnh cao với chip M3 thế hệ mới",
      backgroundImage: "/images/banners/macbook-collection.jpg",
      backgroundColor: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      textColor: "white",
      ctaText: "Khám phá ngay",
      ctaLink: "/products/macbook",
      icon: Star,
      badge: "NEW",
      features: ["Chip M3 mới nhất", "Màn hình Liquid Retina", "Thiết kế nhôm cao cấp"]
    },
    {
      id: 3,
      type: "bundle-offer",
      title: "Combo siêu tiết kiệm",
      subtitle: "iPad + Apple Pencil + Magic Keyboard",
      description: "Tiết kiệm đến 3 triệu khi mua combo học tập - làm việc hoàn hảo",
      backgroundImage: "/images/banners/ipad-combo.jpg",
      backgroundColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      textColor: "white",
      ctaText: "Xem combo",
      ctaLink: "/combo-offers",
      icon: Gift,
      badge: "COMBO",      savings: "3.000.000",
      features: ["Tiết kiệm 3 triệu", "Giao hàng miễn phí", "Setup miễn phí"]
    }
  ], []);

  // Load homepage settings and banners
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const homeSettings = await homePageService.getHomePageSettings();
        setSettings(homeSettings);
        
        // Use banners from settings if available, otherwise use defaults
        if (homeSettings && homeSettings.promotionalBanners) {
          setBanners(homeSettings.promotionalBanners);
        } else {
          setBanners(defaultBanners);
        }
      } catch (error) {
        console.error('Error loading promotional banners data:', error);
        // Use default data on error
        const defaultSettings = homePageService.getDefaultSettings();
        setSettings(defaultSettings);
        setBanners(defaultBanners);
      } finally {
        setLoading(false);
      }
    };    loadData();
  }, [defaultBanners]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(banners[currentBanner]?.endTime || "2024-12-31T23:59:59").getTime();
      const distance = endTime - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentBanner, banners]);

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [banners.length]);
  // Don't render if settings indicate this section is inactive
  if (!loading && settings && !settings.promotionalBannersIsActive) {
    return null;
  }

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const currentBannerData = banners[currentBanner];
  const IconComponent = currentBannerData?.icon;

  return (
    <section className="promotional-banners">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Ưu đãi đặc biệt</h2>
          <p className="section-subtitle">
            Những chương trình khuyến mãi hấp dẫn không thể bỏ lỡ
          </p>
        </motion.div>

        <div className="banners-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              className="main-banner"
              style={{
                background: currentBannerData?.backgroundColor,
                color: currentBannerData?.textColor
              }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="banner-background">
                <img 
                  src={currentBannerData?.backgroundImage} 
                  alt={currentBannerData?.title}
                />
                <div className="banner-overlay"></div>
              </div>

              <div className="banner-content">
                <div className="banner-info">
                  <div className="banner-header">
                    {IconComponent && (
                      <div className="banner-icon">
                        <IconComponent size={24} />
                      </div>
                    )}
                    {currentBannerData?.badge && (
                      <span className="banner-badge">{currentBannerData.badge}</span>
                    )}
                  </div>

                  <motion.h3
                    className="banner-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {currentBannerData?.title}
                  </motion.h3>

                  <motion.h4
                    className="banner-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    {currentBannerData?.subtitle}
                  </motion.h4>

                  <motion.p
                    className="banner-description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {currentBannerData?.description}
                  </motion.p>

                  {currentBannerData?.features && (
                    <motion.div
                      className="banner-features"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      {currentBannerData.features.map((feature, index) => (
                        <span key={index} className="feature-item">
                          ✓ {feature}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  {currentBannerData?.type === "flash-sale" && (
                    <motion.div
                      className="countdown-timer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <div className="timer-label">
                        <Clock size={16} />
                        Thời gian còn lại:
                      </div>
                      <div className="timer-display">
                        <div className="time-unit">
                          <span className="time-value">{timeLeft.days}</span>
                          <span className="time-label">Ngày</span>
                        </div>
                        <div className="time-separator">:</div>
                        <div className="time-unit">
                          <span className="time-value">{timeLeft.hours}</span>
                          <span className="time-label">Giờ</span>
                        </div>
                        <div className="time-separator">:</div>
                        <div className="time-unit">
                          <span className="time-value">{timeLeft.minutes}</span>
                          <span className="time-label">Phút</span>
                        </div>
                        <div className="time-separator">:</div>
                        <div className="time-unit">
                          <span className="time-value">{timeLeft.seconds}</span>
                          <span className="time-label">Giây</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentBannerData?.savings && (
                    <motion.div
                      className="savings-highlight"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <Gift size={20} />
                      <span>Tiết kiệm: {currentBannerData.savings}₫</span>
                    </motion.div>
                  )}

                  <motion.div
                    className="banner-actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <motion.button
                      className="cta-button primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentBannerData?.ctaText}
                      <ArrowRight size={18} />
                    </motion.button>
                  </motion.div>
                </div>
              </div>

              {/* Navigation arrows */}
              <div className="banner-navigation">
                <motion.button
                  className="nav-btn prev"
                  onClick={prevBanner}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft size={20} />
                </motion.button>
                <motion.button
                  className="nav-btn next"
                  onClick={nextBanner}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight size={20} />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Banner indicators */}
          <div className="banner-indicators">
            {banners.map((_, index) => (
              <motion.button
                key={index}
                className={`indicator ${index === currentBanner ? 'active' : ''}`}
                onClick={() => setCurrentBanner(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              />
            ))}
          </div>
        </div>

        {/* Mini banners grid */}
        <motion.div
          className="mini-banners"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="mini-banner">
            <div className="mini-banner-icon">
              <Zap size={24} />
            </div>
            <div className="mini-banner-content">
              <h4>Giao hàng siêu tốc</h4>
              <p>Trong vòng 2 giờ nội thành HN, HCM</p>
            </div>
          </div>

          <div className="mini-banner">
            <div className="mini-banner-icon">
              <Gift size={24} />
            </div>
            <div className="mini-banner-content">
              <h4>Quà tặng hấp dẫn</h4>
              <p>Mỗi đơn hàng trên 10 triệu</p>
            </div>
          </div>

          <div className="mini-banner">
            <div className="mini-banner-icon">
              <Star size={24} />
            </div>
            <div className="mini-banner-content">
              <h4>Bảo hành vàng</h4>
              <p>Chế độ bảo hành vượt trội</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PromotionalBanners;
