import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CategoryMenu = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  // Chuyển hướng đến danh sách sản phẩm khi chọn danh mục
  const handleCategorySelect = (categoryId) => {
    navigate(`/ProductList?categoryId=${categoryId}`);
  };

  return (
    <div style={styles.categoryMenu}>
      {categories.map((category) => (
        <div
          key={category.id}
          style={styles.categoryItem}
          onClick={() => handleCategorySelect(category.id)}
        >
          {/* Hiển thị hình ảnh danh mục */}
          <img
    src={
        category.image?.startsWith("http")
            ? category.image // Full external URL
            : `${process.env.REACT_APP_API_BASE_URL}${category.image}`
    }
    alt={`${category.name} logo`}
    className="size-10 rounded-full"
    onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://via.placeholder.com/50";
    }}
/>
          <span>{category.name}</span>
        </div>
      ))}
    </div>
  );
};

const styles = {
  categoryMenu: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "30px",
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
    marginTop: "96px", // Tăng từ 60px để phù hợp với navbar height mới (80px desktop + margin)
  },
  categoryItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "12px",
    background: "#f7f7f7",
    transition: "all 0.3s ease",
  },
  categoryImage: {
    width: "32px",
    height: "32px",
    objectFit: "cover",
  },
};

export default CategoryMenu;
