import React, { Component } from 'react';
import '../Asset/Style/Home.css'; // Import file CSS để tùy chỉnh giao diện

export class Home extends Component {
  static displayName = Home.name;

  render() {
    return (
      <div className="home-container">
        {/* Banner quảng cáo hoặc slider */}
        <section className="hero-banner">
          <div className="hero-content">
            <h1>Chào mừng đến với TechStore!</h1>
            <p>Khám phá những sản phẩm công nghệ mới nhất với giá cực kỳ hấp dẫn.</p>
            <a href="/products" className="cta-button">Mua ngay</a>
          </div>
        </section>

        {/* Danh mục sản phẩm nổi bật */}
        <section className="featured-categories">
          <h2>Danh mục nổi bật</h2>
          <div className="categories-grid">
            <div className="category-card">
              <img src="/images/laptops.jpg" alt="Laptops" />
              <h3>Laptop</h3>
              <a href="/category/laptops">Xem thêm</a>
            </div>
            <div className="category-card">
              <img src="/images/smartphones.jpg" alt="Smartphones" />
              <h3>Điện thoại</h3>
              <a href="/category/smartphones">Xem thêm</a>
            </div>
            <div className="category-card">
              <img src="/images/accessories.jpg" alt="Accessories" />
              <h3>Phụ kiện</h3>
              <a href="/category/accessories">Xem thêm</a>
            </div>
          </div>
        </section>

        {/* Sản phẩm bán chạy */}
        <section className="best-sellers">
          <h2>Sản phẩm bán chạy</h2>
          <div className="products-grid">
            <div className="product-card">
              <img src="/images/product1.jpg" alt="Product 1" />
              <h3>Laptop Dell XPS 13</h3>
              <p className="price">25,000,000₫</p>
              <button className="add-to-cart">Thêm vào giỏ hàng</button>
            </div>
            <div className="product-card">
              <img src="/images/product2.jpg" alt="Product 2" />
              <h3>iPhone 14 Pro Max</h3>
              <p className="price">30,000,000₫</p>
              <button className="add-to-cart">Thêm vào giỏ hàng</button>
            </div>
            <div className="product-card">
              <img src="/images/product3.jpg" alt="Product 3" />
              <h3>Tai nghe Sony WH-1000XM5</h3>
              <p className="price">7,500,000₫</p>
              <button className="add-to-cart">Thêm vào giỏ hàng</button>
            </div>
          </div>
        </section>

        {/* Khuyến mãi đặc biệt */}
        <section className="special-offers">
          <h2>Khuyến mãi đặc biệt</h2>
          <div className="offer-banner">
            <img src="/images/sale-banner.jpg" alt="Special Offer" />
            <div className="offer-content">
              <h3>Giảm giá lên đến 50%</h3>
              <p>Áp dụng cho tất cả sản phẩm trong tháng này.</p>
              <a href="/sale" className="cta-button">Mua ngay</a>
            </div>
          </div>
        </section>

        {/* Tin tức công nghệ */}
        <section className="tech-news">
          <h2>Tin tức công nghệ</h2>
          <div className="news-grid">
            <div className="news-card">
              <img src="/images/news1.jpg" alt="News 1" />
              <h3>Xu hướng laptop 2023</h3>
              <p>Khám phá những mẫu laptop mới nhất năm 2023.</p>
              <a href="/news/1">Đọc thêm</a>
            </div>
            <div className="news-card">
              <img src="/images/news2.jpg" alt="News 2" />
              <h3>iPhone 15 ra mắt</h3>
              <p>Tất cả thông tin về chiếc iPhone mới nhất từ Apple.</p>
              <a href="/news/2">Đọc thêm</a>
            </div>
          </div>
        </section>
      </div>
    );
  }
}