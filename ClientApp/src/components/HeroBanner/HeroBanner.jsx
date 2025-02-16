import React from 'react';
import heroBanner from '../../Assets/img/herobanner.JPG'; // Đường dẫn tương đối
import './HeroBanner.css';

const HeroBanner = () => {
  return (
    <section className="hero-banner" style={{ backgroundImage: `url(${heroBanner})` }}>
      <div className="hero-content">
        <h1>Chào mừng đến với SHN Gear</h1>
        <p>Công nghệ đỉnh cao, trải nghiệm xứng tầm!</p>
        <a href="/products" className="cta-button">Mua ngay</a>
      </div>
    </section>
  );
};

export default HeroBanner;