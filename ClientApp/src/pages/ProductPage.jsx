import React, { useState, useEffect } from "react";
import ProductImage from "../components/productinformationpage/ProductImage";
import ProductInfo from "../components/productinformationpage/ProductInfo";
import ProductReviews from "../components/productinformationpage/ProductReviews";
import RelatedProducts from "../components/productinformationpage/RelatedProducts";
import "../pages/ProductPage.css";

const ProductPage = () => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => {
      try {
        // Dữ liệu sản phẩm
        const productData = {
          id: 1,
          name: "Laptop Dell XPS 13",
          price: "29.990.000₫",
          originalPrice: "33.990.000₫",
          discount: "Giảm 12%",
          installmentPrice: "3.000.000₫ / tháng",
          image: [
            "https://macstores.vn/wp-content/uploads/2024/03/dell-xps-13-9340-2024-1.jpg",
            "https://macstores.vn/wp-content/uploads/2024/03/dell-xps-13-9340-2024-2.jpg",
            "https://macstores.vn/wp-content/uploads/2024/03/dell-xps-13-9340-2024-3.jpg",
          ],
          configurations: ["Intel i7", "16GB RAM", "512GB SSD"],
          specifications: {
            processor: "Intel Core i7",
            ram: "16GB",
            storage: "512GB SSD",
            display: "13 inch Full HD",
          },
          reviews: [
            {
              user: "Lê trọng nghĩa",
              rating: 5,
              comment: "Sản phẩm tuyệt vời!",
            },
            {
              user: "Vũ phan hoài sang",
              rating: 4,
              comment: "Màn hình đẹp, nhưng pin hơi yếu.",
            },
          ],
        };

        // Dữ liệu sản phẩm liên quan
        const relatedProductData = [
          {
            id: 1,
            name: "Laptop HP Spectre x360",
            price: "28.000.000₫",
            image:
              "https://macstores.vn/wp-content/uploads/2024/03/dell-xps-13-9340-2024-1.jpg",
          },
          {
            id: 2,
            name: "Laptop HP Spectre x360",
            price: "28.000.000₫",
            image:
              "https://macstores.vn/wp-content/uploads/2024/03/dell-xps-13-9340-2024-1.jpg",
          },
          {
            id: 3,
            name: "MacBook Pro M1",
            price: "32.000.000₫",
            image:
              "https://macstores.vn/wp-content/uploads/2024/03/dell-xps-13-9340-2024-1.jpg",
          },
        ];

        setProduct(productData);
        setRelatedProducts(relatedProductData);
        setLoading(false);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu.");
        setLoading(false);
      }
    }, 2000);
  }, []);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return (
    <div className="product-page">
      <div className="product-details">
        <ProductImage images={product.image} name={product.name} />
        <ProductInfo product={product} />
      </div>
      <ProductReviews reviews={product.reviews} />
      <RelatedProducts relatedProducts={relatedProducts} />
    </div>
  );
};

export default ProductPage;
