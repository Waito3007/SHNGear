import React from "react";
import Menu from "../components/Menu";
import HeroBanner from "../components/HeroBanner";
import FeaturedCategories from "../components/FeaturedCategories";
import BestSellers from "../components/BestSellers";
import SpecialOffers from "../components/SpecialOffers";
import TechNews from "../components/TechNews";

const HomePage = () => {
  return (
    <div>
      <Menu />
      <HeroBanner />
      <FeaturedCategories />
      <BestSellers />
      <SpecialOffers />
      <TechNews />
    </div>
  );
};

export default HomePage;
