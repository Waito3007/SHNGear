import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import homePageService from "../../services/homePageService";

// New Homepage Components
import HeroSection from "../../components/Homepage/HeroSection";
import ProductShowcase from "../../components/Homepage/ProductShowcase";
import CategoryHighlights from "../../components/Homepage/CategoryHighlights";
import PromotionalBanners from "../../components/Homepage/PromotionalBanners";
import NewArrivals from "../../components/Homepage/NewArrivals";
import BestSellers from "../../components/BestSellers/BestSellers";
import CustomerTestimonials from "../../components/Homepage/CustomerTestimonials";
import BrandStory from "../../components/Homepage/BrandStory";
import Newsletter from "../../components/Homepage/Newsletter";
import CallToAction from "../../components/Homepage/CallToAction";

import "./Home.css";

const Home = () => {
  const [homeSettings, setHomeSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeSettings = async () => {
      try {
        setLoading(true);
        const settings = await homePageService.getHomePageSettings();
        setHomeSettings(settings);
      } catch (error) {
        console.error('Error loading home settings:', error);
        // Use default settings if API fails
        const defaultSettings = homePageService.getDefaultSettings();
        setHomeSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    loadHomeSettings();
  }, []);

  if (loading) {
    return (
      <div className="home-container">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Đang tải trang chủ...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Keep existing Navbar and Notification as requested */}
      <Navbar />
      {/* <Notification /> */}
      
      {/* New redesigned homepage sections with dynamic data */}
      {homeSettings?.heroIsActive && <HeroSection settings={homeSettings} />}
      {homeSettings?.productShowcaseIsActive && <ProductShowcase settings={homeSettings} />}
      {homeSettings?.featuredCategoriesIsActive && <CategoryHighlights settings={homeSettings} />}
      {homeSettings?.promotionalBannersIsActive && <PromotionalBanners settings={homeSettings} />}
      <NewArrivals />      
      <BestSellers />
      {homeSettings?.testimonialsIsActive && <CustomerTestimonials settings={homeSettings} />}
      {homeSettings?.brandStoryIsActive && <BrandStory settings={homeSettings} />}
      {homeSettings?.newsletterIsActive && <Newsletter settings={homeSettings} />}
      <CallToAction settings={homeSettings} />
      
      {/* Keep existing Footer as requested */}
      <Footer />
    </div>
  );
};

export default Home;
