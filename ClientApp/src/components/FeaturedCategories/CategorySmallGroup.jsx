import React from "react";

const CategorySmallGroup = ({ smallCategories }) => {
  return (
    <div className="category-small-group">
      {smallCategories.map((item, idx) => (
        <div key={idx} className="category-small">
          <img src={item.image} alt={item.name} />
          <span className="category-name">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CategorySmallGroup;
