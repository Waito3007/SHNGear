import React, { useState, useMemo } from "react";

const CategoryImage = ({ category, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Memoize URL để tránh tính toán lại không cần thiết
  const imageUrl = useMemo(() => {
    if (!category.image || imageError) {
      return generateDefaultCategoryImage(category.name);
    }

    // Kiểm tra nếu là URL tuyệt đối
    if (category.image.startsWith("http")) {
      return category.image;
    }

    // Xử lý URL tương đối
    const baseUrl = process.env.REACT_APP_API_BASE_URL
      ? process.env.REACT_APP_API_BASE_URL.replace(/\/$/, "")
      : "";
    return `${baseUrl}/${category.image.replace(/^\//, "")}`;
  }, [category.image, category.name, imageError]);

  // Tạo ảnh mặc định với SVG
  const generateDefaultCategoryImage = (categoryName) => {
    const firstLetter = categoryName
      ? categoryName.charAt(0).toUpperCase()
      : "C";
    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
      "#84cc16",
      "#f97316",
    ];
    const color =
      colors[categoryName ? categoryName.length % colors.length : 0];

    const svg = `
      <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad${
            categoryName ? categoryName.replace(/\s+/g, "") : "default"
          }" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}80;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" fill="url(#grad${
          categoryName ? categoryName.replace(/\s+/g, "") : "default"
        })" rx="8"/>
        <text x="48" y="58" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">${firstLetter}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(
      unescape(encodeURIComponent(svg))
    )}`;
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-white/10 animate-pulse rounded flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={category.name || "Category"}
        className={`w-full h-full object-contain transition-all duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default CategoryImage;
