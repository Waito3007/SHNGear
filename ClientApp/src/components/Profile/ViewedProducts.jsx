import React from "react";

const products = [
  {
    id: 1,
    name: "Samsung Galaxy S25 Ultra 5G",
    price: "31.990.000 ₫",
    oldPrice: "33.990.000 ₫",
    discount: "-6%",
    img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-ultra.png",
  },
  {
    id: 2,
    name: "iPhone 15 Pro Max 256GB",
    price: "29.090.000 ₫",
    oldPrice: "35.000.000 ₫",
    discount: "-17%",
    img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-ultra.png",
  },
  {
    id: 3,
    name: "Xiaomi 14 Ultra 512GB",
    price: "26.990.000 ₫",
    oldPrice: "29.300.000 ₫",
    discount: "-8%",
    img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-ultra.png",
  },
  {
    id: 4,
    name: "OPPO Find X7 Ultra 1TB",
    price: "27.990.000 ₫",
    oldPrice: "31.100.000 ₫",
    discount: "-10%",
    img: "https://cdn2.cellphones.com.vn/358x/media/catalog/product/x/i/xiaomi-14-ultra.png",
  },
];

const ViewedProducts = () => {
  return (
    <div className="viewed-products">
      <h2>Sản phẩm đã xem</h2>
      <div className="products-row">
        {products.map((product) => (
          <div key={product.id} className="product-item">
            <img src={product.img} alt={product.name} />
            <p>{product.name}</p>
            <div className="price-container">
              <s className="old-price">{product.oldPrice}</s>
              <span className="discount">{product.discount}</span>
            </div>
            <p className="price">{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewedProducts;
