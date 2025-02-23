import { useState, useEffect } from "react";
import Banner1 from "../../Assets/img/anhcuanghia/banner1.png";
import Banner2 from "../../Assets/img/anhcuanghia/banner_honor.png";
import Banner3 from "../../Assets/img/anhcuanghia/banner2.png";
import Background1 from "../../Assets/img/anhcuanghia/background1.png";
import Background2 from "../../Assets/img/anhcuanghia/background2.png";
import Background3 from "../../Assets/img/anhcuanghia/background3.png";

import "./HeroBanner.css"; // Import file CSS riêng

const Slider = () => {
  const slides = [
    { img: Banner1, bgColor: Background2 },
    { img: Banner2, bgColor: Background3 },
    { img: Banner3, bgColor: Background1 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const sliderElement = document.querySelector(".slider");
    if (sliderElement) {
      sliderElement.style.backgroundImage = `url(${slides[currentIndex].bgColor})`;
      sliderElement.style.backgroundSize = "cover"; // Đảm bảo ảnh nền bao phủ
      sliderElement.style.backgroundPosition = "center";
      sliderElement.style.backgroundRepeat = "no-repeat";
    }
  }, [currentIndex]);
  

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  return (
    <div className="slider-container">
      <div className="slider">
        {slides.map((slide, index) => (
          <img
            key={index}
            src={slide.img}
            alt={`Slide ${index + 1}`}
            className={`slide ${index === currentIndex ? "active" : ""}`}
          />
        ))}
      </div>

      {/* Nút điều hướng */}
      <button className="prev" onClick={prevSlide}>❮</button>
      <button className="next" onClick={nextSlide}>❯</button>
    </div>
  );
};

export default Slider;
