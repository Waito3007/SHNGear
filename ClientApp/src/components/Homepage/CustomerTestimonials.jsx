import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, User, Shield, Award } from "lucide-react";
import homePageService from "../../services/homePageService";
import "./CustomerTestimonials.css";

const CustomerTestimonials = ({ settings: passedSettings }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(passedSettings);

  // Default testimonials data (memoized to prevent recreation on every render)
  const defaultTestimonials = useMemo(() => [
    {
      id: 1,
      name: "Nguyễn Văn An",
      avatar: "/images/avatars/customer-1.jpg",
      role: "Developer",
      company: "Tech Corp",
      rating: 5,
      comment: "Sản phẩm chất lượng tuyệt vời, dịch vụ hỗ trợ khách hàng xuất sắc. Tôi đã mua iPhone 15 Pro Max và rất hài lòng với hiệu năng cũng như thiết kế.",
      product: "iPhone 15 Pro Max",
      purchaseDate: "2024-01-15",
      verified: true,
      badges: ["Khách hàng VIP", "Đã mua 5+ sản phẩm"]
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      avatar: "/images/avatars/customer-2.jpg",
      role: "Designer",
      company: "Creative Studio",
      rating: 5,
      comment: "MacBook Pro M3 làm việc cực kỳ mượt mà, thiết kế đẹp và hiệu năng vượt trội. Giao hàng nhanh chóng, đóng gói cẩn thận. Chắc chắn sẽ quay lại mua thêm.",
      product: "MacBook Pro M3 14 inch",
      purchaseDate: "2024-02-20",
      verified: true,
      badges: ["Review chi tiết", "Khách hàng thân thiết"]
    },
    {
      id: 3,
      name: "Lê Hoàng Cường",
      avatar: "/images/avatars/customer-3.jpg",
      role: "Manager",
      company: "Business Solutions",
      rating: 5,
      comment: "Dịch vụ tư vấn rất chuyên nghiệp, nhân viên hiểu biết sâu về sản phẩm. iPad Pro M2 đáp ứng hoàn hảo nhu cầu công việc và giải trí của tôi.",
      product: "iPad Pro M2 12.9 inch",
      purchaseDate: "2024-03-10",
      verified: true,
      badges: ["Tư vấn xuất sắc", "Đánh giá 5 sao"]
    },
    {
      id: 4,
      name: "Phạm Thị Diệu",
      avatar: "/images/avatars/customer-4.jpg",
      role: "Student",
      company: "Đại học Công nghệ",
      rating: 5,
      comment: "AirPods Pro 3 âm thanh cực đỉnh, chống ồn rất tốt. Giá cả hợp lý, có nhiều ưu đãi cho sinh viên. Cảm ơn SHN Gear đã mang đến trải nghiệm tuyệt vời!",
      product: "AirPods Pro 3rd Gen",
      purchaseDate: "2024-03-25",
      verified: true,
      badges: ["Sinh viên", "Ưu đãi đặc biệt"]
    },
    {
      id: 5,
      name: "Võ Minh Tài",
      avatar: "/images/avatars/customer-5.jpg",
      role: "Photographer",
      company: "Studio Photography",
      rating: 5,
      comment: "Camera iPhone 15 Pro Max chụp ảnh cực kỳ đẹp, màu sắc chân thực. Đây là công cụ làm việc hoàn hảo cho nghề nhiếp ảnh của tôi. Rất khuyến khích mọi người!",
      product: "iPhone 15 Pro Max",
      purchaseDate: "2024-04-05",
      verified: true,
      badges: ["Chuyên nghiệp", "Camera lover"]    }
  ], []);

  // Load homepage settings and testimonials
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const homeSettings = await homePageService.getHomePageSettings();
        setSettings(homeSettings);
        
        // Use testimonials from settings if available, otherwise use defaults
        if (homeSettings && homeSettings.customerTestimonials) {
          setTestimonials(homeSettings.customerTestimonials);
        } else {
          // Use default testimonials data
          const defaultSettings = homePageService.getDefaultSettings();
          setTestimonials(defaultSettings.customerTestimonials || defaultTestimonials);
        }
      } catch (error) {
        console.error('Error loading testimonials data:', error);
        // Use default data on error
        setTestimonials(defaultTestimonials);
      } finally {
        setLoading(false);
      }
    };

    loadData();  }, [defaultTestimonials]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  // Don't render if settings indicate this section is inactive
  if (!loading && settings && !settings.customerTestimonialsIsActive) {
    return null;
  }

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="customer-testimonials">
        <div className="container">
          <div className="loading-container">
            <div className="skeleton-testimonial">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-content">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-line medium"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentData = testimonials[currentTestimonial];

  return (
    <section className="customer-testimonials">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Khách hàng nói gì về chúng tôi</h2>
          <p className="section-subtitle">
            Những đánh giá chân thực từ khách hàng đã tin tưởng SHN Gear
          </p>
        </motion.div>

        <div className="testimonials-container">
          {/* Main Testimonial */}
          <div 
            className="testimonials-wrapper"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                className="main-testimonial"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <div className="testimonial-card">
                  <div className="quote-icon">
                    <Quote size={32} />
                  </div>

                  <div className="testimonial-content">
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={i < currentData.rating ? "filled" : ""}
                        />
                      ))}
                    </div>

                    <motion.p
                      className="testimonial-text"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      "{currentData.comment}"
                    </motion.p>

                    <div className="product-info">
                      <span className="product-name">Sản phẩm: {currentData.product}</span>
                      <span className="purchase-date">Mua ngày: {formatDate(currentData.purchaseDate)}</span>
                    </div>

                    <div className="customer-badges">
                      {currentData.badges.map((badge, index) => (
                        <span key={index} className="badge">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="customer-info">
                    <div className="customer-avatar">
                      <img src={currentData.avatar} alt={currentData.name} />
                      {currentData.verified && (
                        <div className="verified-badge">
                          <Shield size={16} />
                        </div>
                      )}
                    </div>
                    
                    <div className="customer-details">
                      <h4 className="customer-name">{currentData.name}</h4>
                      <p className="customer-role">{currentData.role}</p>
                      <p className="customer-company">{currentData.company}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="testimonial-navigation">
              <motion.button
                className="nav-btn prev"
                onClick={prevTestimonial}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={20} />
              </motion.button>
              
              <div className="testimonial-indicators">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`indicator ${index === currentTestimonial ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonial(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  />
                ))}
              </div>

              <motion.button
                className="nav-btn next"
                onClick={nextTestimonial}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </div>

          {/* Thumbnail Testimonials */}
          <div className="thumbnail-testimonials">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className={`thumbnail-card ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={testimonial.avatar} alt={testimonial.name} />
                <div className="thumbnail-info">
                  <h5>{testimonial.name}</h5>
                  <div className="thumbnail-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={12} className="filled" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          className="testimonials-stats"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="stat-item">
            <div className="stat-icon">
              <User size={24} />
            </div>
            <div className="stat-content">
              <h3>50,000+</h3>
              <p>Khách hàng tin tưởng</p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <h3>4.9/5</h3>
              <p>Đánh giá trung bình</p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <h3>99%</h3>
              <p>Khách hàng hài lòng</p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <Shield size={24} />
            </div>
            <div className="stat-content">
              <h3>100%</h3>
              <p>Đánh giá được xác thực</p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="testimonials-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3>Bạn cũng muốn chia sẻ trải nghiệm?</h3>
          <p>Hãy để lại đánh giá của bạn và nhận ngay voucher giảm giá 5%</p>
          <motion.button
            className="cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Viết đánh giá ngay
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;
