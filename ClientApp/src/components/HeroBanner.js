import React from "react";
import "../Assets/style/HeroBanner.css";

const HeroBanner = () => {
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <h1>Chào mừng đến với TechStore!</h1>
        <p>
          Khám phá những sản phẩm công nghệ mới nhất với giá cực kỳ hấp dẫn.
        </p>
        <a href="/products" className="cta-button">
          Mua ngay
        </a>
      </div>
    </section>
  );
};

export default HeroBanner;
