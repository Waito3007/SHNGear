import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import ProductImage from "../components/productinformationpage/ProductImage";
import ProductInfo from "../components/productinformationpage/ProductInfo";
import ProductVariants from "../components/productinformationpage/ProductVariants";
import Footer from "../components/Footer/Footer";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ProductReviews from "../components/productinformationpage/ProductReviews";
import RelatedProducts from "../components/productinformationpage/RelatedProducts";
import Commitment from "../components/Commitment/Commitment";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://localhost:7107/api/Products/${id}`
        );
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu sản phẩm.");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert severity="error">{error}</Alert>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Nội dung chính (Thêm padding trên cùng để tránh bị Navbar che) */}
      <div className="container mx-auto px-4 py-8 pt-40 flex flex-col gap-10">
        {/* Ảnh và thông tin sản phẩm */}
        <div className="grid md:grid-cols-2 gap-8">
          <ProductImage images={product?.images} name={product?.name} />
          <div className="flex flex-col gap-6">
            <ProductInfo product={product} />
            <ProductVariants variants={product?.variants} />
          </div>
        </div>

        {/* Đánh giá sản phẩm */}
        <div className="md:col-span-2 mt-16s">
          <ProductReviews reviews={product?.reviews} />
        </div>

        {/* Sản phẩm liên quan */}
        <div className="md:col-span-2 mt-16">
          <RelatedProducts category={product?.category} currentProductId={id} />
        </div>
      </div>
      <Commitment />
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductPage;
