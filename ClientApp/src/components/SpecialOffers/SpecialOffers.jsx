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
  ];

  return (
    <div className="container py-3 md:py-2.5">
      <div className="productsales">
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
