import React from 'react';
import './SpecialOffers.css';

const SpecialOffers = () => {
  return (
    <section className="special-offers">
      <h2>🔥 Khuyến mãi đặc biệt 🔥</h2>
      <div className="offer-content">
        <h3>⚡ Giảm giá lên đến <span>50%</span> ⚡</h3>
        <p>Áp dụng cho tất cả sản phẩm trong tháng này.</p>
        <a href="/sale" className="cta-button">Mua ngay</a>
      </div>
    </section>
  );
};

export default SpecialOffers;
