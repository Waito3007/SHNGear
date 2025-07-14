import React, { useState, useEffect } from "react";
import axios from "axios";

// Components for homepage sections
import HeroBanner from "@/components/HeroBanner/HeroBanner"; // 1. HeroBanner (luôn hiển thị)
import HeroSlider from "@/components/HeroSlider/HeroSlider"; // 2. HeroSlider (luôn hiển thị)  
import HomeBanner from "@/components/Homepage/HomeBanner"; // 3. HomeBanner (theo config)
import FeaturedCategories from "@/components/FeaturedCategories/FeaturedCategories"; // 4. FeaturedCategories (theo config)
import BestSellerSection from "@/components/BestSellers/BestSellers"; // 5. BestSellerSection (theo config)
import PinnedProducts from "@/components/PinnedProducts/PinnedProducts"; // 6. PinnedProducts (theo config)
import FlashSale from "@/components/FlashSale/FlashSale"; // 7. FlashSale (luôn hiển thị)
import Commitment from "@/components/Commitment/Commitment"; // 8. Commitment (luôn hiển thị)
import AuthModal from "@/components/Auth/AuthModal";
import { useAuthModal } from "@/contexts/AuthModalContext";

const HomePage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthModalOpen, closeAuthModal } = useAuthModal();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/homepage-config`
        );
        setConfig(response.data);
      } catch (err) {
        setError("Failed to load homepage configuration.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <>
      <main>
        {/* 1. HeroBanner (luôn hiển thị) */}
        {config.components.hero && config.components.hero.enabled ? (
          <HeroBanner data={config.components.hero} />
        ) : (
          <HeroBanner />
        )}
        
        {/* 2. HeroSlider (luôn hiển thị) */}
        <HeroSlider />
        
        {/* 3. HomeBanner (theo config) */}
        {config.components.home_banner && config.components.home_banner.enabled && (
          <HomeBanner data={config.components.home_banner} />
        )}
        
        {/* 4. FeaturedCategories (theo config) */}
        {config.components.categories && config.components.categories.enabled && (
          <FeaturedCategories />
        )}
        
        {/* 5. BestSellerSection (theo config) */}
        {((config.components.best_seller && config.components.best_seller.enabled) ||
          (config.components.featured_products && config.components.featured_products.enabled)) && (
          <BestSellerSection data={config.components.best_seller || config.components.featured_products} />
        )}
        
        {/* 6. PinnedProducts (theo config) */}
        {config.components.pinned_products && config.components.pinned_products.enabled && (
          <PinnedProducts data={config.components.pinned_products} />
        )}
        
        {/* 7. FlashSale (luôn hiển thị - phía trên Commitment) */}
        {config.components.special_offer && config.components.special_offer.enabled ? (
          <FlashSale data={config.components.special_offer} />
        ) : (
          <FlashSale />
        )}
        
        {/* 8. Commitment (luôn hiển thị) */}
        <Commitment />
      </main>

      {/* Auth Modal - positioned over the entire layout */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export default HomePage;
