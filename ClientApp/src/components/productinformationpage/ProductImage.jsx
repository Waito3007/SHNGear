import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const ProductImage = ({ images, name }) => {
  return (
    <div className="flex justify-center">
      {images?.length > 0 ? (
        <div className="relative w-96">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView={1}
            className="w-full h-auto"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={
                    image?.imageUrl?.startsWith("http")
                      ? image.imageUrl
                      : `${process.env.REACT_APP_API_BASE_URL}/${image.imageUrl}`
                  }
                  alt={name || "Product Image"}
                  className="w-full h-auto object-contain mb-3 transition-transform"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/placeholder.jpg";
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <p className="text-gray-500">Không có ảnh</p>
      )}
    </div>
  );
};

export default ProductImage;
