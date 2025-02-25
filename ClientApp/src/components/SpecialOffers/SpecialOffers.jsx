import React from "react";
import ProductCard from "./ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import "./SpecialOffers.css";

const SpecialOffers = () => {
  const products = [
    {
      id: 1,
      image: "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:quality(100)/amazfit_bip_5_46mm_den_1_e3af4bcd30.png",
      title: "Amazfit BIP 5 46mm",
      features: [
        { icon: "https://cdn2.fptshop.com.vn/svg/ic_water_resistant_f2193d2539.svg?w=32&q=100", text: "Kháng nước & bụi IP68" },
        { icon: "https://cdn2.fptshop.com.vn/svg/ic_body_test_ce4043f1ac.svg?w=32&q=100", text: "Đo sức khỏe toàn diện" },
        { icon: "https://cdn2.fptshop.com.vn/svg/ic_gps_f2857d1b8b.svg?w=32&q=100", text: "Định vị chính xác" },
      ],
      originalPrice: "1.990.000 ₫",
      discount: "-50%",
      currentPrice: "990.000 ₫",
      discountAmount: "Giảm 1.000.000 ₫",
    },
    {
      id: 2,
      image: "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:quality(100)/amazfit_bip_5_46mm_den_1_e3af4bcd30.png",
      title: "Amazfit GTS 2 Mini",
      features: [
        { icon: "https://cdn2.fptshop.com.vn/svg/ic_heart_rate.svg?w=32&q=100", text: "Đo nhịp tim 24/7" },
        { icon: "https://cdn2.fptshop.com.vn/svg/ic_spo2.svg?w=32&q=100", text: "Đo chỉ số SpO2" },
        { icon: "https://cdn2.fptshop.com.vn/svg/ic_sleep_tracking.svg?w=32&q=100", text: "Theo dõi giấc ngủ" },
      ],
      originalPrice: "2.490.000 ₫",
      discount: "-30%",
      currentPrice: "1.790.000 ₫",
      discountAmount: "Giảm 700.000 ₫",
    },
    {
      id: 3,
      image: "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:quality(100)/amazfit_bip_5_46mm_den_1_e3af4bcd30.png",
      title: "Amazfit T-Rex 2",
      features: [
        { icon: "https://cdn2.fptshop.com.vn/svg/ic_military.svg?w=32&q=100", text: "Tiêu chuẩn quân đội" },
        { icon: "https://cdn2.fptshop.com.vn/svg/ic_gps.svg?w=32&q=100", text: "GPS 2 băng tần" },
        { icon: "https://cdn2.fptshop.com.vn/svg/ic_battery.svg?w=32&q=100", text: "Pin 24 ngày" },
      ],
      originalPrice: "5.490.000 ₫",
      discount: "-20%",
      currentPrice: "4.390.000 ₫",
      discountAmount: "Giảm 1.100.000 ₫",
    },
  ];

  return (
    <div className="container py-3 md:py-2.5">
      <div className="slider-container">
        <div className="slider-header">
          <h2 className="slider-title">Khuyến mãi đặc biệt</h2>
        </div>
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={3}
          navigation
          loop={true}
          className="swiper-container"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SpecialOffers;
