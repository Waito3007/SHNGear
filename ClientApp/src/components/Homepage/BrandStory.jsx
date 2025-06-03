import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Award, Users, Globe, Heart, Shield, Zap, Star } from "lucide-react";
import homePageService from "../../services/homePageService";
import "./BrandStory.css";

const BrandStory = ({ settings: passedSettings }) => {
  const [brandData, setBrandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(passedSettings);

  // Default brand data (memoized to prevent recreation on every render)
  const defaultBrandData = useMemo(() => ({
    title: "Câu chuyện của chúng tôi",
    subtitle: "Từ một ý tưởng nhỏ đến việc trở thành điểm đến tin cậy cho hàng triệu người yêu công nghệ",
    description: "SHN Gear ra đời từ niềm đam mê công nghệ và mong muốn mang đến những sản phẩm chất lượng cao với giá cả hợp lý cho người tiêu dùng Việt Nam. Chúng tôi tin rằng công nghệ không chỉ là công cụ, mà còn là cầu nối giúp con người kết nối và phát triển bản thân.",
    heroImage: "/images/about/team-photo.jpg",
    logoText: "SHN",
    floatingBadgeText: "Trusted Brand 2024",
    achievements: [
      {
        iconName: "Users",
        number: "50,000+",
        label: "Khách hàng tin tưởng",
        description: "Phục vụ hơn 50,000 khách hàng trên toàn quốc"
      },
      {
        iconName: "Globe",
        number: "63",
        label: "Tỉnh thành",
        description: "Phủ sóng toàn bộ 63 tỉnh thành Việt Nam"
      },
      {
        iconName: "Award",
        number: "5",
        label: "Năm kinh nghiệm",
        description: "Hơn 5 năm trong lĩnh vực công nghệ"
      },
      {
        iconName: "Star",
        number: "4.9/5",
        label: "Đánh giá khách hàng",
        description: "Duy trì chất lượng dịch vụ xuất sắc"
      }
    ],
    values: [
      {
        iconName: "Heart",
        title: "Tận tâm với khách hàng",
        description: "Chúng tôi luôn đặt khách hàng làm trung tâm trong mọi hoạt động, cam kết mang đến trải nghiệm tốt nhất.",
        color: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)"
      },
      {
        iconName: "Shield",
        title: "Chất lượng đảm bảo",
        description: "Tất cả sản phẩm đều chính hãng, có bảo hành đầy đủ và được kiểm tra kỹ lưỡng trước khi giao hàng.",
        color: "linear-gradient(135deg, #10b981 0%, #047857 100%)"
      },
      {
        iconName: "Zap",
        title: "Dịch vụ nhanh chóng",
        description: "Giao hàng siêu tốc trong 2 giờ nội thành, hỗ trợ khách hàng 24/7 với đội ngũ chuyên nghiệp.",
        color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
      }
    ],
    timeline: [
      {
        year: "2019",
        title: "Khởi đầu hành trình",
        description: "SHN Gear được thành lập với sứ mệnh mang công nghệ đến gần hơn với mọi người Việt Nam."
      },
      {
        year: "2020",
        title: "Mở rộng quy mô",
        description: "Thiết lập hệ thống cửa hàng trực tuyến và kho bãi hiện đại, phục vụ toàn quốc."
      },
      {
        year: "2021",
        title: "Đối tác chính thức",
        description: "Trở thành đối tác chính thức của Apple, Samsung và các thương hiệu công nghệ hàng đầu."
      },
      {
        year: "2022",
        title: "Đạt cột mốc quan trọng",
        description: "Phục vụ thành công 25,000 khách hàng và nhận nhiều giải thưởng uy tín trong ngành."
      },
      {
        year: "2023",
        title: "Đổi mới và phát triển",
        description: "Ra mắt nền tảng mua sắm mới với AI và công nghệ hiện đại nhất."
      },
      {
        year: "2024",
        title: "Hướng tới tương lai",
        description: "Tiếp tục mở rộng và cam kết mang đến những sản phẩm công nghệ tốt nhất."
      }
    ],
    mission: {
      iconName: "Heart",
      title: "Sứ mệnh",
      description: "Mang đến những sản phẩm công nghệ chất lượng cao, phù hợp với túi tiền của người Việt, giúp mọi người tiếp cận và tận hưởng những tiến bộ công nghệ mới nhất."
    },
    vision: {
      iconName: "Globe",
      title: "Tầm nhìn",
      description: "Trở thành thương hiệu bán lẻ công nghệ hàng đầu Việt Nam, được khách hàng tin tưởng và lựa chọn cho những nhu cầu công nghệ trong cuộc sống và công việc."
    },
    cta: {
      title: "Cùng chúng tôi viết tiếp câu chuyện",
      description: "Hãy trở thành một phần trong hành trình phát triển của SHN Gear. Chúng tôi cam kết sẽ luôn đồng hành cùng bạn trong mọi trải nghiệm công nghệ.",
      primaryButtonText: "Tìm hiểu thêm về chúng tôi",
      secondaryButtonText: "Liên hệ hợp tác"
    }
  }), []);

  // Load homepage settings and brand story data
  useEffect(() => {
    const loadBrandData = async () => {
      try {
        setLoading(true);
        const response = await homePageService.getHomePageSettings();
        setSettings(response.settings);
        
        // Use dynamic brand story data if available, otherwise use default
        const brandStoryData = response.settings?.brandStory || defaultBrandData;
        setBrandData(brandStoryData);
      } catch (error) {
        console.error('Error loading brand story data:', error);
        setBrandData(defaultBrandData);
      } finally {
        setLoading(false);
      }
    };

    loadBrandData();
  }, [defaultBrandData]);

  // Helper function to get icon component from icon name
  const getIconComponent = (iconName) => {
    const iconMap = {
      Users,
      Globe,
      Award,
      Star,
      Heart,
      Shield,
      Zap,
      ArrowRight
    };
    return iconMap[iconName] || Users;
  };

  // Don't render if not active or still loading
  if (loading) {
    return (
      <section className="brand-story">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải câu chuyện thương hiệu...</p>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if disabled in settings
  if (settings && settings.brandStoryIsActive === false) {
    return null;
  }

  const currentBrandData = brandData || defaultBrandData;
  const achievements = currentBrandData.achievements || defaultBrandData.achievements;
  const values = currentBrandData.values || defaultBrandData.values;
  const timeline = currentBrandData.timeline || defaultBrandData.timeline;

  return (
    <section className="brand-story">
      <div className="container">
        {/* Hero Section */}
        <motion.div
          className="brand-hero"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="brand-hero-content">
            <motion.div
              className="brand-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="logo-circle">
                <span>{currentBrandData.logoText}</span>
              </div>
            </motion.div>

            <motion.h2
              className="brand-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {currentBrandData.title}
            </motion.h2>

            <motion.p
              className="brand-subtitle"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              {currentBrandData.subtitle}
            </motion.p>

            <motion.div
              className="brand-description"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <p>
                {currentBrandData.description}
              </p>
            </motion.div>
          </div>

          <motion.div
            className="brand-hero-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <img src={currentBrandData.heroImage} alt="SHN Gear Team" />
            <div className="hero-image-overlay">
              <div className="floating-badge">
                <Award size={24} />
                <span>{currentBrandData.floatingBadgeText}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          className="achievements-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="section-title">Những con số ấn tượng</h3>
          <div className="achievements-grid">
            {achievements.map((item, index) => {
              const IconComponent = getIconComponent(item.iconName);
              return (
                <motion.div
                  key={index}
                  className="achievement-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="achievement-icon">
                    <IconComponent size={32} />
                  </div>
                  <div className="achievement-number">{item.number}</div>
                  <div className="achievement-label">{item.label}</div>
                  <div className="achievement-description">{item.description}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          className="values-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="section-title">Giá trị cốt lõi</h3>
          <div className="values-grid">
            {values.map((value, index) => {
              const IconComponent = getIconComponent(value.iconName);
              return (
                <motion.div
                  key={index}
                  className="value-card"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div 
                    className="value-icon"
                    style={{ background: value.color }}
                  >
                    <IconComponent size={28} />
                  </div>
                  <div className="value-content">
                    <h4>{value.title}</h4>
                    <p>{value.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          className="timeline-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="section-title">Hành trình phát triển</h3>
          <div className="timeline">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="timeline-content">
                  <div className="timeline-year">{item.year}</div>
                  <h4 className="timeline-title">{item.title}</h4>
                  <p className="timeline-description">{item.description}</p>
                </div>
                <div className="timeline-dot"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          className="mission-vision"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="mission-vision-grid">
            <motion.div
              className="mission-card"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="card-header">
                {(() => {
                  const MissionIcon = getIconComponent(currentBrandData.mission?.iconName);
                  return <MissionIcon size={32} />;
                })()}
                <h3>{currentBrandData.mission?.title}</h3>
              </div>
              <p>
                {currentBrandData.mission?.description}
              </p>
            </motion.div>

            <motion.div
              className="vision-card"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="card-header">
                {(() => {
                  const VisionIcon = getIconComponent(currentBrandData.vision?.iconName);
                  return <VisionIcon size={32} />;
                })()}
                <h3>{currentBrandData.vision?.title}</h3>
              </div>
              <p>
                {currentBrandData.vision?.description}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="brand-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3>{currentBrandData.cta?.title}</h3>
          <p>
            {currentBrandData.cta?.description}
          </p>
          <div className="cta-buttons">
            <motion.button
              className="cta-btn primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentBrandData.cta?.primaryButtonText}
              <ArrowRight size={18} />
            </motion.button>
            <motion.button
              className="cta-btn secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentBrandData.cta?.secondaryButtonText}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandStory;
