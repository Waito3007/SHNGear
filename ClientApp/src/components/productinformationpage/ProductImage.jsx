import React, { useState } from "react";

const ProductImage = ({ images, name }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="product-image-slider">
      <img src={images[currentIndex]} alt={name} />
      <div className="slider-controls">
        <button onClick={prevImage}>{"<"}</button>
        <button onClick={nextImage}>{">"}</button>
      </div>
    </div>
  );
};

export default ProductImage;
