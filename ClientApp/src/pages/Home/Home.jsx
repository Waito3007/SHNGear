import React from 'react';
import Navbar from "../../components/Navbar/Navbar";
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import FeaturedCategories from '../../components/FeaturedCategories/FeaturedCategories';
import BestSellers from '../../components/BestSellers/BestSellers';
import SpecialOffers from '../../components/SpecialOffers/SpecialOffers';
import TechNews from '../../components/TechNews/TechNews';
import Commitment from '../../components/Commitment/Commitment';
import HeroSlider from '../../components/HeroSlider/HeroSlider';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <HeroSlider/>
      <HeroBanner />
      <FeaturedCategories />
      <BestSellers />
      <SpecialOffers />
      <Commitment /> {/* Thêm component Commitment vào đây */}
      <TechNews />
    </div>
  );
};

export default Home;