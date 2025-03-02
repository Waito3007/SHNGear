import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "aos/dist/aos.css"; // Import CSS cho AOS
import AOS from "aos"; // Thư viện animation khi cuộn
import CategoryLarge from "./CategoryLarge";

const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);

  // Gọi API lấy danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://localhost:7107/api/categories");
        const data = await response.json();
        console.log("Dữ liệu từ API:", data);

        // Đảm bảo categories luôn là mảng
        setCategories(Array.isArray(data.$values) ? data.$values : []);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        setCategories([]);
      }
    };

    fetchCategories();
    AOS.init({ duration: 1000 }); // Khởi tạo AOS với thời gian 1s
  }, []);

  return (
    <div className="w-full flex justify-center py-6">
      <div className="max-w-[1200px] w-full px-4">
    



        {/* Swiper */}
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-6 transition-transform duration-500 ease-in-out"
        >
          {categories.map((category, index) => (
            <SwiperSlide
              key={index}
              className="flex justify-center transform hover:scale-105 transition-all duration-300"
              data-aos="zoom-in"
            >
              <CategoryLarge name={category.name} image={category.image} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default FeaturedCategories;
