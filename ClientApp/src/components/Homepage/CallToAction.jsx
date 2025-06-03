import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Star, 
  Shield, 
  Truck, 
  Gift,
  Phone,
  Mail,
  MessageCircle,
  Sparkles,
  Crown,
  Heart
} from 'lucide-react';
import homePageService from '../../services/homePageService';
import './CallToAction.css';

const CallToAction = () => {
  const [activeOffer, setActiveOffer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [ctaData, setCtaData] = useState(null);

  // Default CTA data (memoized to prevent recreation on every render)
  const defaultCtaData = useMemo(() => ({
    title: "Khám phá thế giới công nghệ cùng SHN Gear",
    subtitle: "Trải nghiệm mua sắm đỉnh cao với những ưu đãi độc quyền",
    description: "Tham gia cộng đồng của chúng tôi để nhận được những sản phẩm công nghệ tốt nhất với giá cả hợp lý nhất",
    offers: [
      {
        id: 1,
        title: "Thành viên VIP",
        subtitle: "Tham gia cộng đồng độc quyền",
        description: "Giảm giá 30% đơn hàng đầu tiên + miễn phí vận chuyển trọn đời",
        icon: "Crown",
        color: "from-purple-500 to-pink-500",
        buttonText: "Trở thành VIP",
        benefits: ["Giảm giá độc quyền", "Miễn phí vận chuyển", "Truy cập sớm", "Tư vấn cá nhân"]
      },
      {
        id: 2,
        title: "Tư vấn miễn phí",
        subtitle: "Phiên tư vấn công nghệ miễn phí",
        description: "Đặt lịch tư vấn 1-1 miễn phí với các chuyên gia của chúng tôi",
        icon: "Heart",
        color: "from-blue-500 to-cyan-500",
        buttonText: "Đặt lịch miễn phí",
        benefits: ["Tư vấn cá nhân", "Gợi ý phù hợp", "Lập kế hoạch", "Hướng dẫn sử dụng"]
      },
      {
        id: 3,
        title: "Giao hàng nhanh",
        subtitle: "Nhận hàng trong 2 giờ",
        description: "Dịch vụ giao hàng siêu tốc cho khu vực nội thành",
        icon: "Truck",
        color: "from-green-500 to-emerald-500",
        buttonText: "Đặt hàng ngay",
        benefits: ["Giao hàng 2 giờ", "Miễn phí vận chuyển", "Hỗ trợ 24/7", "Đổi trả dễ dàng"]
      }
    ],
    contactInfo: {
      phone: "1900 1234",
      email: "contact@shngear.com",
      address: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM"
    },
    guarantees: [
      {
        icon: "Shield",
        title: "Bảo hành chính hãng",
        description: "Cam kết sản phẩm chính hãng 100%"
      },
      {
        icon: "Star",
        title: "Đánh giá 5 sao",
        description: "Hơn 50,000 khách hàng tin tưởng"
      },
      {
        icon: "Gift",
        title: "Quà tặng hấp dẫn",
        description: "Nhiều ưu đãi và quà tặng giá trị"
      }
    ]
  }), []);

  // Load homepage settings and CTA data
  useEffect(() => {
    const loadCtaData = async () => {
      try {
        setLoading(true);
        const response = await homePageService.getHomePageSettings();
        setSettings(response.settings);
        
        // Use dynamic CTA data if available, otherwise use default
        const ctaContent = response.settings?.callToAction || defaultCtaData;
        setCtaData(ctaContent);
      } catch (error) {
        console.error('Error loading CTA data:', error);
        setCtaData(defaultCtaData);
      } finally {
        setLoading(false);
      }
    };

    loadCtaData();
  }, [defaultCtaData]);

  // Auto-rotate offers
  useEffect(() => {
    if (ctaData?.offers) {
      const timer = setInterval(() => {
        setActiveOffer((prev) => (prev + 1) % ctaData.offers.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [ctaData?.offers]);

  // Helper function to get icon component from icon name
  const getIconComponent = (iconName) => {
    const iconMap = {
      Crown,
      Heart,
      Truck,
      Shield,
      Star,
      Gift,
      Phone,
      Mail,
      MessageCircle,
      Sparkles,
      ArrowRight
    };
    return iconMap[iconName] || Crown;
  };

  // Don't render if still loading
  if (loading) {
    return (
      <section className="cta-section">
        <div className="cta-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if disabled in settings
  if (settings && settings.callToActionIsActive === false) {
    return null;
  }  const currentCtaData = ctaData || defaultCtaData;
  const offers = currentCtaData.offers || defaultCtaData.offers;
  const guarantees = currentCtaData.guarantees || defaultCtaData.guarantees;

  return (
    <section className="cta-section">
      <div className="cta-container">
        
        {/* Main CTA Banner */}
        <motion.div 
          className="main-cta-banner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="cta-background">
            <motion.div 
              className="floating-sparkles"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="sparkle sparkle-1" size={24} />
              <Sparkles className="sparkle sparkle-2" size={16} />
              <Sparkles className="sparkle sparkle-3" size={20} />
              <Sparkles className="sparkle sparkle-4" size={14} />
            </motion.div>
          </div>

          <div className="cta-content">            <motion.div 
              className="cta-badge"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star size={16} />
              Ưu đãi có thời hạn
            </motion.div>
            
            <h2 className="cta-title">
              {currentCtaData.title}
            </h2>
            
            <p className="cta-description">
              {currentCtaData.description}
            </p>            <div className="cta-stats">
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Khách hàng hài lòng</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.9★</div>
                <div className="stat-label">Đánh giá trung bình</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Hỗ trợ</div>
              </div>
            </div>

            <motion.button 
              className="main-cta-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mua sắm ngay
              <ArrowRight size={20} />
            </motion.button>
          </div>

          <div className="cta-visual">
            <motion.div 
              className="hero-card"
              whileHover={{ rotateY: 10, rotateX: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="avatar-group">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="avatar" />
                    ))}
                  </div>
                  <div className="card-rating">
                    <Star size={16} className="filled" />
                    <span>4.9</span>
                  </div>
                </div>                <div className="card-body">
                  <div className="testimonial">
                    "Chất lượng tuyệt vời và phong cách! SHN Gear đã thay đổi hoàn toàn tủ đồ công nghệ của tôi."
                  </div>
                  <div className="testimonial-author">- Minh H.</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Rotating Offers Section */}
        <motion.div 
          className="rotating-offers"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >          <div className="section-header">
            <h3>Ưu đãi độc quyền</h3>
            <p>{currentCtaData.subtitle}</p>
          </div>

          <div className="offers-grid">            {offers.map((offer, index) => {
              const IconComponent = getIconComponent(offer.icon);
              return (
                <motion.div
                  key={offer.id}
                  className={`offer-card ${activeOffer === index ? 'active' : ''}`}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`offer-gradient bg-gradient-to-br ${offer.color}`}>
                    <IconComponent size={32} className="offer-icon" />
                  </div>
                
                <div className="offer-content">
                  <h4 className="offer-title">{offer.title}</h4>
                  <p className="offer-subtitle">{offer.subtitle}</p>
                  <p className="offer-description">{offer.description}</p>
                  
                  <ul className="offer-benefits">
                    {offer.benefits.map((benefit, i) => (
                      <li key={i} className="benefit-item">
                        <Star size={12} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <motion.button 
                  className="offer-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {offer.buttonText}
                  <ArrowRight size={16} />                </motion.button>
              </motion.div>
            );
            })}
          </div>
        </motion.div>

        {/* Guarantees Section */}
        <motion.div 
          className="features-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="features-grid">
            {guarantees.map((guarantee, index) => {
              const IconComponent = getIconComponent(guarantee.icon);
              return (
                <motion.div
                  key={index}
                  className="feature-item"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="feature-icon">
                    <IconComponent size={24} />
                  </div>
                  <h4 className="feature-title">{guarantee.title}</h4>
                  <p className="feature-description">{guarantee.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div 
          className="contact-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >          <div className="contact-header">
            <h3>Cần hỗ trợ? Chúng tôi luôn sẵn sàng</h3>
            <p>Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn với mọi thắc mắc về sản phẩm</p>
          </div><div className="contact-methods">
            <motion.div
              className="contact-method"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="method-icon">
                <Phone size={24} />
              </div>
              <div className="method-content">
                <h4 className="method-title">Gọi điện tư vấn</h4>
                <p className="method-description">{currentCtaData.contactInfo.phone}</p>
              </div>
              <button className="method-action">
                Gọi ngay
              </button>
            </motion.div>

            <motion.div
              className="contact-method"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="method-icon">
                <Mail size={24} />
              </div>
              <div className="method-content">
                <h4 className="method-title">Email hỗ trợ</h4>
                <p className="method-description">{currentCtaData.contactInfo.email}</p>
              </div>
              <button className="method-action">
                Gửi email
              </button>
            </motion.div>

            <motion.div
              className="contact-method"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="method-icon">
                <MessageCircle size={24} />
              </div>
              <div className="method-content">
                <h4 className="method-title">Chat trực tuyến</h4>
                <p className="method-description">Hỗ trợ 24/7</p>
              </div>
              <button className="method-action">
                Chat ngay
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div 
          className="final-cta"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >          <div className="final-cta-content">
            <h3>Sẵn sàng nâng tầm phong cách của bạn?</h3>
            <p>Tham gia cộng đồng SHN Gear và khám phá công nghệ phù hợp với bạn</p>
            <div className="final-cta-buttons">
              <motion.button 
                className="primary-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mua sắm ngay
                <ArrowRight size={20} />
              </motion.button>
              <motion.button 
                className="secondary-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xem bộ sưu tập
              </motion.button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CallToAction;
