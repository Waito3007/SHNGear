import React from "react";
import { FaShoppingCart } from "react-icons/fa";

const ProductInfo = ({ product }) => {
  return (
    <div className="product-info">
      <h2>{product.name}</h2>
      <div className="price-details">
        <div>
          <div className="price">
            <span>Mua ngay với giá</span>
          </div>
          <div className="price-number">{product.price}</div>
        </div>
        <div>
          <div className="price">
            <span>Trả góp</span>
          </div>
          <div className="price-bernum">{product.installmentPrice}</div>
        </div>
      </div>
      <div className="original-price-discount">
        <p className="original-price">{product.originalPrice}</p>
        <p className="discount">{product.discount}</p>
      </div>
      <div className="product-specifications">
        <table>
          <tbody>
            {Object.keys(product.specifications).map((key) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{product.specifications[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="purchase-options">
        <button className="add-to-cart">
          <FaShoppingCart className="cart-icon" />
        </button>
        <button className="buy-now">Mua ngay</button>
        <button className="installment">Trả góp</button>
      </div>
    </div>
  );
};

export default ProductInfo;
