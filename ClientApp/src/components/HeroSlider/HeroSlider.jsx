import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import slider1 from '../../Assets/img/anhcuanghia/IMG_3351.JPG'
import slider2 from '../../Assets/img/anhcuanghia/IMG_4202.JPG'
import slider3 from '../../Assets/img/anhcuanghia/IMG_4242.JPG'
import './HeroSlider.css';

const HeroSlider = () => {
  const settings = {
    dots: true, // Hiển thị dots điều hướng
    infinite: true, // Lặp vô hạn
    speed: 500, // Tốc độ chuyển slide
    slidesToShow: 1, // Số slide hiển thị cùng lúc
    slidesToScroll: 1, // Số slide cuộn mỗi lần
    autoplay: true, // Tự động chuyển slide
    autoplaySpeed: 3000, // Thời gian chuyển slide (3 giây)
    pauseOnHover: true, // Dừng tự động chuyển khi hover
  };

  return (
    <div className="hero-slider">
      <Slider {...settings}>
        <div>
          <img src={slider1} alt="Slide 1" />
        </div>
        <div>
          <img src={slider2} alt="Slide 2" />
        </div>
        <div>
          <img src={slider3} alt="Slide 3" />
        </div>
      </Slider>
    </div>
  );
};

export default HeroSlider;