import React from "react";
import "../Assets/style/SpecialOffers.css";

const SpecialOffers = () => {
  return (
    <section className="special-offers">
      <h2>Khuyến mãi đặc biệt</h2>
      <div className="offer-banner">
        <img src="/images/sale-banner.jpg" alt="Special Offer" />
        <div className="offer-content">
          <h3>Giảm giá lên đến 50%</h3>
          <p>Áp dụng cho tất cả sản phẩm trong tháng này.</p>
          <a href="/sale" className="cta-button">
            Mua ngay
          </a>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
