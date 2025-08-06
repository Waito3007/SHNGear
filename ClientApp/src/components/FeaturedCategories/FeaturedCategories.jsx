import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "aos/dist/aos.css";
import AOS from "aos";
import CategoryLarge from "./CategoryLarge";
import { useCategories } from "@/hooks/api/useCategories";

const FeaturedCategories = () => {
  const { categories, loading, error } = useCategories();
  const navigate = useNavigate();

  React.useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  if (loading) {
    return <div className="text-center py-6">Đang tải danh mục...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full flex justify-center py-6">
      <div className="max-w-[1200px] w-full px-4">
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
          {categories.map((category) => (
            <SwiperSlide
              key={category.id}
              className="flex justify-center transform hover:scale-105 transition-all duration-300"
            >
              <CategoryLarge
                id={category.id}
                name={category.name}
                image={category.image}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default FeaturedCategories;
