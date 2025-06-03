import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Gift, Star, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import homePageService from '../../services/homePageService';
import './Newsletter.css';

const Newsletter = ({ settings: passedSettings }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(passedSettings);
  const [newsletterData, setNewsletterData] = useState(null);

  // Default newsletter data (memoized to prevent recreation on every render)
  const defaultNewsletterData = useMemo(() => ({
    title: "Đăng ký nhận tin từ SHN Gear",
    subtitle: "Nhận thông tin sản phẩm mới, khuyến mãi độc quyền và những mẹo hay về công nghệ",
    description: "Hãy là người đầu tiên biết về những sản phẩm công nghệ mới nhất và những ưu đãi đặc biệt chỉ dành cho thành viên của chúng tôi.",
    placeholder: "Nhập địa chỉ email của bạn",
    buttonText: "Đăng ký ngay",
    successTitle: "Cảm ơn bạn đã đăng ký!",
    successMessage: "Chúng tôi sẽ gửi những thông tin tuyệt vời nhất đến email của bạn.",
    benefits: [
      {
        icon: "Gift",
        title: "Ưu đãi độc quyền",
        description: "Giảm giá 15% cho đơn hàng đầu tiên"
      },
      {
        icon: "Star",
        title: "Truy cập sớm",
        description: "Mua sắm sản phẩm mới trước ai hết"
      },
      {
        icon: "Sparkles",
        title: "Mẹo công nghệ",
        description: "Nội dung hàng tuần về công nghệ và phong cách sống"
      }
    ]
  }), []);

  // Load homepage settings and newsletter data
  useEffect(() => {
    const loadNewsletterData = async () => {
      try {
        setLoading(true);
        const response = await homePageService.getHomePageSettings();
        setSettings(response.settings);
        
        // Use dynamic newsletter data if available, otherwise use default
        const newsletterContent = response.settings?.newsletter || defaultNewsletterData;
        setNewsletterData(newsletterContent);
      } catch (error) {
        console.error('Error loading newsletter data:', error);
        setNewsletterData(defaultNewsletterData);
      } finally {
        setLoading(false);
      }
    };

    loadNewsletterData();
  }, [defaultNewsletterData]);

  // Helper function to get icon component from icon name
  const getIconComponent = (iconName) => {
    const iconMap = {
      Gift,
      Star,
      Sparkles,
      Mail,
      CheckCircle,
      ArrowRight
    };
    return iconMap[iconName] || Gift;
  };

  // Don't render if still loading
  if (loading) {
    return (
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if disabled in settings
  if (settings && settings.newsletterIsActive === false) {
    return null;
  }
  const currentNewsletterData = newsletterData || defaultNewsletterData;
  const benefits = currentNewsletterData.benefits || defaultNewsletterData.benefits;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      setEmail('');
    }, 2000);
  };

  if (isSubscribed) {
    return (
      <section className="newsletter-section">
        <div className="newsletter-container">
          <motion.div 
            className="newsletter-success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="success-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle size={64} />
            </motion.div>            <h3>{currentNewsletterData.successTitle}</h3>
            <p>{currentNewsletterData.successMessage}</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <div className="newsletter-content">
          <motion.div 
            className="newsletter-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="newsletter-icon">
              <Mail size={48} />
              <motion.div 
                className="newsletter-sparkle"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={24} />
              </motion.div>
            </div>            <h2>{currentNewsletterData.title}</h2>
            <p>{currentNewsletterData.description}</p>
          </motion.div>

          <motion.div 
            className="newsletter-benefits"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >            {benefits.map((benefit, index) => {
              const IconComponent = getIconComponent(benefit.icon);
              return (
                <motion.div 
                  key={index}
                  className="benefit-item"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="benefit-icon">
                    <IconComponent size={24} />
                  </div>
                  <div className="benefit-content">
                    <h4>{benefit.title}</h4>
                    <p>{benefit.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.form 
            className="newsletter-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="form-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={currentNewsletterData.placeholder}
                required
                className="email-input"
              />
              <motion.button 
                type="submit"
                className="subscribe-btn"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <motion.div 
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />                ) : (
                  <>
                    {currentNewsletterData.buttonText}
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </div>
            <p className="newsletter-disclaimer">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </motion.form>

          <motion.div 
            className="newsletter-social-proof"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="social-proof-avatars">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="avatar" style={{ backgroundImage: `url(/api/placeholder/40/40)` }} />
              ))}
            </div>
            <p>Tham gia cùng 50,000+ người yêu công nghệ đã đăng ký</p>
          </motion.div>
        </div>

        <div className="newsletter-visual">
          <motion.div 
            className="newsletter-illustration"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="illustration-card">
              <div className="card-header">
                <div className="card-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="card-content">
                <div className="mock-email">
                  <div className="email-header">
                    <div className="email-avatar"></div>
                    <div className="email-info">
                      <div className="email-subject"></div>
                      <div className="email-from"></div>
                    </div>
                  </div>
                  <div className="email-body">
                    <div className="email-line long"></div>
                    <div className="email-line medium"></div>
                    <div className="email-line short"></div>
                  </div>
                  <div className="email-cta"></div>
                </div>
              </div>
            </div>
            
            <motion.div 
              className="floating-icons"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Gift size={24} className="floating-icon gift" />
              <Star size={20} className="floating-icon star" />
              <Sparkles size={18} className="floating-icon sparkles" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
