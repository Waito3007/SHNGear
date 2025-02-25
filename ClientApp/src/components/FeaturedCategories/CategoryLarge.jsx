import React from "react";

const CategoryLarge = ({ name, image }) => {
  return (
    <div className="category-large">
      <img src={image} alt={name} />
      <span className="category-name">{name}</span>
    </div>
  );
};

export default CategoryLarge;
