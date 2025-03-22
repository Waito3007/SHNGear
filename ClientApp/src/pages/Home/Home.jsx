import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import Notification from "../../components/NotificationBar/notification";
import HeroBanner from "../../components/HeroBanner/HeroBanner";
import FeaturedCategories from "../../components/FeaturedCategories/FeaturedCategories";
import BestSellers from "../../components/BestSellers/BestSellers";
import DiscountProductSlider  from "../../components/SpecialOffers/SpecialOffers";
import ServiceSlider from "../../components/ServiceSlider/ServiceSlider";
import Commitment from "../../components/Commitment/Commitment";
import HeroSlider from "../../components/HeroSlider/HeroSlider";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <Notification />
      <HeroBanner />
      <HeroSlider />
      <FeaturedCategories />
      <BestSellers />
      {/* <DiscountProductSlider categoryName="Laptop" />
      <DiscountProductSlider categoryName="Điện thoại" />
      <DiscountProductSlider categoryName="Tai nghe" />  */}
      <ServiceSlider />
           
      <Commitment /> {/* Thêm component Commitment vào đây */}
      <Footer />
    </div>
  );
};

export default Home;
