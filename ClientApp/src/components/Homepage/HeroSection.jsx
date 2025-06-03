import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, ArrowRight, Star, TrendingUp } from "lucide-react";
import homePageService from "../../services/homePageService";
import "./HeroSection.css";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [heroSettings, setHeroSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load hero settings from API
  useEffect(() => {
    const loadHeroSettings = async () => {
      try {
        setLoading(true);
        const settings = await homePageService.getHomePageSettings();
        setHeroSettings(settings);
      } catch (error) {
        console.error('Error loading hero settings:', error);
        // Use default settings if API fails
        const defaultSettings = homePageService.getDefaultSettings();
        setHeroSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadHeroSettings();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !heroSettings?.heroSlides || heroSettings.heroSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSettings.heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSettings?.heroSlides]);

  // Get slides from hero settings or use default
  const slides = heroSettings?.heroSlides || [];

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentSlideData = slides[currentSlide];

  // Show loading if data is not ready
  if (loading || !heroSettings) {
    return (
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </section>
    );
  }

  // Skip rendering if hero is not active or no slides
  if (!heroSettings.heroIsActive || slides.length === 0) {
    return null;
  }

  return (
    <section className="hero-section relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br"
        style={{ background: currentSlideData?.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-white opacity-5"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -left-1/2 w-3/4 h-3/4 rounded-full bg-white opacity-5"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
          
          {/* Content Side */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="text-white space-y-6 lg:space-y-8"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              {(currentSlideData?.badge || heroSettings.heroBadgeText) && (
                <motion.div
                  className="inline-flex items-center space-x-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                    <TrendingUp className="w-4 h-4 inline mr-2" />
                    {currentSlideData?.badge || heroSettings.heroBadgeText}
                  </span>
                  <span className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    4.9 (2.1k đánh giá)
                  </span>
                </motion.div>
              )}

              {/* Main Heading */}
              <div className="space-y-4">
                <motion.h1
                  className="text-4xl lg:text-7xl font-bold leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentSlideData?.title || heroSettings.heroTitle}
                </motion.h1>
                
                <motion.p
                  className="text-xl lg:text-2xl font-light opacity-90"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {currentSlideData?.subtitle || heroSettings.heroSubtitle}
                </motion.p>
              </div>

              {/* Description */}
              <motion.p
                className="text-lg opacity-80 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {currentSlideData?.description || heroSettings.heroDescription}
              </motion.p>

              {/* Features */}
              {currentSlideData?.features && currentSlideData.features.length > 0 && (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {currentSlideData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Pricing */}
              {currentSlideData?.price && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl lg:text-4xl font-bold">
                      {Number(currentSlideData.price).toLocaleString()}đ
                    </span>
                    {currentSlideData.originalPrice && (
                      <span className="text-xl line-through opacity-60">
                        {Number(currentSlideData.originalPrice).toLocaleString()}đ
                      </span>
                    )}
                    {currentSlideData.discount && (
                      <span className="px-3 py-1 bg-red-500 rounded-full text-sm font-bold">
                        -{currentSlideData.discount}
                      </span>
                    )}
                  </div>
                  {currentSlideData.originalPrice && (
                    <p className="text-sm opacity-80">
                      Tiết kiệm {(Number(currentSlideData.originalPrice) - Number(currentSlideData.price)).toLocaleString()}đ
                    </p>
                  )}
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  className="group bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{currentSlideData?.ctaText || heroSettings.heroCtaText || 'Khám phá ngay'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  <span>Xem demo</span>
                </motion.button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Image Side */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`image-${currentSlide}`}
              className="relative"
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotateY: -90 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white/20 rounded-3xl blur-3xl scale-90 opacity-50 group-hover:opacity-70 transition-opacity" />
                
                {/* Product image */}
                <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <img
                    src={currentSlideData?.image || heroSettings.heroBackgroundImage || "https://via.placeholder.com/600x400?text=Product+Image"}
                    alt={currentSlideData?.title || heroSettings.heroTitle}
                    className="w-full h-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/600x400?text=Product+Image";
                    }}
                  />
                </div>

                {/* Floating elements */}
                {currentSlideData?.discount && (
                  <motion.div
                    className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Giảm {currentSlideData.discount}
                  </motion.div>
                )}
                
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white text-gray-900 px-4 py-2 rounded-full font-bold shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  🔥 Hot Deal
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center space-x-6">
              {/* Slide Indicators */}
              <div className="flex space-x-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white w-8' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="flex space-x-2">
                <button
                  onClick={prevSlide}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Auto-play indicator */}
              <div className="flex items-center space-x-2 text-white/70 text-sm">
                <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span>Auto-play {isAutoPlaying ? 'on' : 'off'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
