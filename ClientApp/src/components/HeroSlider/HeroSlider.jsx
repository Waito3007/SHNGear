import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import slider1 from '../../Assets/img/HeadPhone/banner_headphone.jpg';
import slider2 from '../../Assets/img/Laptop/banner_laptop.jpg';
import slider3 from '../../Assets/img/Phone/banner_iphone.jpg';
import './HeroSlider.css';

const HeroSlider = () => {
  return (
    <div className="hero-slider">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20} // Khoảng cách giữa các slide
        slidesPerView={2} // Hiển thị 2 slide cùng lúc
        autoplay={{ delay: 3000, disableOnInteraction: false }} // Tự động chuyển slide
        loop={true} // Lặp vô hạn
        pagination={{ clickable: true }} // Hiển thị dots điều hướng
        navigation // Hiển thị nút điều hướng
        className="custom-swiper"
      >
        <SwiperSlide>
          <img src={slider1} alt="Slide 1" className="slide-image" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={slider2} alt="Slide 2" className="slide-image" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={slider3} alt="Slide 3" className="slide-image" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default HeroSlider;
