import React from "react";

const CategoryLarge = ({ name, image }) => {
  return (
    <div className="relative w-[420px] h-[180px] sm:w-[350px] sm:h-[160px] xs:w-[300px] bg-white rounded-xl shadow-md overflow-hidden p-4">
      {/* Tên danh mục */}
      <span className="absolute top-3 left-4 text-lg font-semibold text-gray-800">
        {name}
      </span>

      {/* Hình ảnh căn giữa */}
      <div className="flex items-center justify-center h-full hover:scale-110">
        <img
          src={image}
          alt={name}
          className="max-h-[120px] sm:max-h-[100px] xs:max-h-[90px] object-contain"
        />
      </div>
    </div>
  );
};

export default CategoryLarge;
