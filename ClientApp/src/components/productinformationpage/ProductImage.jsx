import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ProductImage = ({ images, name }) => {
  return (
    <div className="flex justify-center">
      {images?.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1}
          className="w-96 h-auto"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <img
                className="w-full h-auto rounded-lg shadow-lg"
                src={image.imageUrl}
                alt={`${name} - ${index + 1}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-gray-500">Không có ảnh</p>
      )}
    </div>
  );
};

export default ProductImage;
