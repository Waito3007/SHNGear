import React from 'react';
import Navbar from "../../components/Navbar/Navbar";
import Notification from "../../components/NotificationBar/notification"
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import FeaturedCategories from '../../components/FeaturedCategories/FeaturedCategories';
import BestSellers from '../../components/BestSellers/BestSellers';
import SpecialOffers from '../../components/SpecialOffers/SpecialOffers';
import ServiceSlider from '../../components/TechNews/ServiceSlider';
import Commitment from '../../components/Commitment/Commitment';
import HeroSlider from '../../components/HeroSlider/HeroSlider';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <Notification/>
      <HeroBanner />
      <HeroSlider/>
      <FeaturedCategories />
      <BestSellers />
      <ServiceSlider />
      <SpecialOffers />
      <Commitment /> {/* Thêm component Commitment vào đây */}
      
    </div>
  );
};

export default Home;