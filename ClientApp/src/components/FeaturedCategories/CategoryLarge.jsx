import React from "react";

const CategoryLarge = ({ name, image }) => {
  return (
    <div className="relative w-[420px] h-[180px] sm:w-[350px] sm:h-[160px] xs:w-[300px] bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl shadow-lg overflow-hidden p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 mt-4">
      {/* Tên danh mục - phía trên bên trái với hiệu ứng */}
      <span className="absolute top-3 left-4 text-lg font-semibold text-gray-800 px-2 py-1  z-10">
        {name}
      </span>

      {/* Hình ảnh - phía bên phải */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 h-full flex items-center">
        <img
          src={image}
          alt={name}
          className="max-h-[130px] sm:max-h-[110px] xs:max-h-[100px] object-contain transition-transform duration-300 hover:scale-115 hover:rotate-2"
        />
      </div>

      {/* Đồ họa trang trí */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-purple-500 opacity-75"></div>
    </div>
  );
};

export default CategoryLarge;