import React from "react";
import "../Assets/style/TechNews.css";

const TechNews = () => {
  return (
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
  );
};

export default TechNews;
