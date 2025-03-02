import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const products = [
  {
    id: 1,
    name: "iPhone 16 Pro Max 256GB",
    oldPrice: 34990000,
    newPrice: 31490000,
    discount: "-10%",
    discountAmount: 3500000,
    image: "/images/iphone16.jpg",
    features: ["6.9 inch", "Chip A18 Pro", "Nút Camera Control"],
  },
  {
    id: 2,
    name: "MacBook Air 13 M3 2024",
    oldPrice: 27990000,
    newPrice: 26990000,
    discount: "-4%",
    discountAmount: 1000000,
    image: "/images/macbook.jpg",
    features: ["Chip Apple M3", "8CPU/16GB RAM", "Mỏng nhẹ"],
  },
  {
    id: 3,
    name: "iPad Pro 11 inch M4 256GB",
    oldPrice: 28990000,
    newPrice: 27790000,
    discount: "-4%",
    discountAmount: 1200000,
    image: "/images/ipad.jpg",
    features: ["Màn hình Ultra Retina XDR", "Chip M4 AI", "Pin 18 giờ"],
  },
  {
    id: 4,
    name: "Samsung Smart TV 55 inch 4K",
    oldPrice: 15390000,
    newPrice: 14390000,
    discount: "-6%",
    discountAmount: 1000000,
    image: "/images/tv.jpg",
    features: ["Điều khiển giọng nói", "Crystal UHD", "Motion Xcelerator"],
  },
  {
    id: 5,
    name: "Tủ lạnh Casper 430L Inverter",
    oldPrice: 16490000,
    newPrice: 11990000,
    discount: "-27%",
    discountAmount: 4500000,
    image: "/images/fridge.jpg",
    features: ["4 - 5 người dùng", "Làm lạnh đa chiều", "Bảng cảm ứng"],
  },
];

const DiscountProductSlider = () => {
  return (
    <div className="w-full flex justify-center py-6">
      <div className="max-w-[1200px] w-full px-4 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Mua đúng quà - Nàng "hiền hòa"
        </h2>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-6"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-md border w-[250px]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-contain mb-3"
                />
                <div className="text-gray-700 text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 line-through">
                      {product.oldPrice.toLocaleString()} đ
                    </span>
                    <span className="text-red-500 text-sm">{product.discount}</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {product.newPrice.toLocaleString()} đ
                  </p>
                  <p className="text-green-600 text-sm">
                    Giảm {product.discountAmount.toLocaleString()} đ
                  </p>
                  <p className="text-gray-800 text-sm">{product.name}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default DiscountProductSlider;
