import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Placeholder components for each section
import HeroBanner from '@/components/HeroBanner/HeroBanner';
import FeaturedCategories from '@/components/FeaturedCategories/FeaturedCategories';
import BestSellerSection from '@/components/BestSellers/BestSellers';
import FlashSale from '@/components/FlashSale/FlashSale';
import Commitment from '@/components/Commitment/Commitment';
import BannerSlider from '@/components/Homepage/BannerSlider'; // New import

const componentMap = {
  hero: HeroBanner,
  categories: FeaturedCategories,
  featured_products: BestSellerSection, // Changed to BestSellerSection
  special_offer: FlashSale,
  best_seller: BestSellerSection, // New mapping for best_seller
  brand_trust: Commitment,
  banner_slider: BannerSlider, // New component mapping
};

const HomePage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/homepage-config`);
        setConfig(response.data);
      } catch (err) {
        setError('Failed to load homepage configuration.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  if (!config) {
    return null;
  }

  return (
    <main>
      {config.layout.map((sectionName) => {
        const Component = componentMap[sectionName];
        const sectionData = config.components[sectionName];

        if (Component && sectionData && sectionData.enabled) {
          if (sectionName === 'categories') {
            return <Component key={sectionName} />;
          } else if (sectionName === 'banner_slider') { // Handle banner_slider separately
            return <Component key={sectionName} />;
          } else {
            return <Component key={sectionName} data={sectionData} />;
          }
        }

        return null;
      })}
    </main>
  );
};

export default HomePage;