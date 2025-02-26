import React from "react";

const RelatedProducts = ({ relatedProducts }) => {
  return (
    <div className="related-products">
      <h3>Sản phẩm liên quan</h3>
      <div className="products-grid">
        {relatedProducts.map((relatedProduct) => (
          <div key={relatedProduct.id} className="product-card">
            <img src={relatedProduct.image} alt={relatedProduct.name} />
            <h3>{relatedProduct.name}</h3>
            <p className="price">{relatedProduct.price}</p>
            <button className="add-to-cart">Thêm vào giỏ hàng</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
