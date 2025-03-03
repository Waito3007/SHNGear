import React from "react";
import { FaMobileAlt, FaLaptop, FaHeadphones } from "react-icons/fa";

const categories = [
  { name: "Laptop & PC", icon: <FaLaptop /> },
  { name: "Điện thoại", icon: <FaMobileAlt /> },
  { name: "Phụ kiện", icon: <FaHeadphones /> },
];

const CategoryMenu = () => {
  return (
    <div style={styles.categoryMenu}>
      {categories.map((category, index) => (
        <div key={index} style={styles.categoryItem}>
          {category.icon} <span>{category.name}</span>
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
    marginTop: "60px",
  },
  categoryItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default CategoryMenu;
