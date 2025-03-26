import React from "react";
import { useNavigate } from "react-router-dom";

const CategorySmallGroup = ({ smallCategories }) => {
  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/ProductList?categoryId=${id}`);
  };

  return (
    <div className="category-small-group">
      {smallCategories.map((item, idx) => (
        <div
          key={idx}
          className="category-small cursor-pointer"
          onClick={() => handleClick(item.id)}
        >
          <img src={item.image} alt={item.name} />
          <span className="category-name">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CategorySmallGroup;
