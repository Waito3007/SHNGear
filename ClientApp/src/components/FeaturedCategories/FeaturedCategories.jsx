import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./FeaturedCategories.css";

import CategoryLarge from "./CategoryLarge";
import CategorySmallGroup from "./CategorySmallGroup";

// Import hình ảnh
import phoneImg from "../../Assets/img/anhcuanghia/dienthoai_banner.png";
import laptopImg from "../../Assets/img/anhcuanghia/laptop_thumb_2_4df0fab60f.png";
import accessoriesImg from "../../Assets/img/anhcuanghia/phu_kien_thum_2_21c419aa09.png";
import refrigeratorImg from "../../Assets/img/anhcuanghia/tu_lanh_cate_thumb_77da11d0c4.png";
import tvImg from "../../Assets/img/anhcuanghia/tivi_baber.png";
import homeApplianceImg from "../../Assets/img/anhcuanghia/dien_gia_dung_thumb_2_54c5efa451.png";

// Dữ liệu danh mục sản phẩm
const categoryGroups = [
  {
    large: { name: "Điện thoại", image: phoneImg },
  },
  {
    small: [
      { name: "Tivi", image: tvImg },
      { name: "Điện gia dụng", image: homeApplianceImg },
    ],
  },
  {
    large: { name: "Tủ lạnh", image: refrigeratorImg },
  },
  {
    small: [
      { name: "Laptop", image: laptopImg },
      { name: "Phụ kiện", image: accessoriesImg },
    ],
  },
  {
    small: [
      { name: "Laptop", image: laptopImg },
      { name: "Phụ kiện", image: accessoriesImg },
    ],
  },
  {
    large: { name: "Điện thoại", image: phoneImg },
  },
  {
    small: [
      { name: "Laptop", image: laptopImg },
      { name: "Phụ kiện", image: accessoriesImg },
    ],
  },
];

const FeaturedCategories = () => {
  return (
    <div className="featured-categories">
      <Swiper
  modules={[Navigation]}
  navigation
  spaceBetween={10}
  slidesPerView={1}
  className="custom-swiper"
>


        {categoryGroups.map((group, index) => (
          <SwiperSlide key={index} className="category-slide">
            <div className="category-container">
              {group.large && <CategoryLarge name={group.large.name} image={group.large.image} />}
              {group.small && <CategorySmallGroup smallCategories={group.small} />}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeaturedCategories;
