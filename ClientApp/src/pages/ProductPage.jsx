import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import ProductImage from "../components/ProductInfoPage/ProductImage";
import ProductInfo from "../components/ProductInfoPage/ProductInfo";
import ProductVariants from "../components/ProductInfoPage/ProductVariants";
import Footer from "../components/Footer/Footer";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ProductReviews from "../components/ProductInfoPage/ProductReviews";
import RelatedProducts from "../components/ProductInfoPage/RelatedProducts";
import SpecificationDisplay from "../components/ProductInfoPage/ProductSpecifications";
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
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products/${id}`);
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

  const getProductType = () => {
    if (!product?.category?.name) return null;
    
    const categoryName = product.category.name.toLowerCase();
    if (categoryName.includes('phone') || categoryName.includes('điện thoại')) {
      return 'phone';
    } else if (categoryName.includes('laptop') || categoryName.includes('máy tính')) {
      return 'laptop';
    } else if (categoryName.includes('headphone') || categoryName.includes('tai nghe')) {
      return 'headphone';
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert severity="warning">Không tìm thấy sản phẩm</Alert>
      </div>
    );
  }

  const productType = getProductType();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8 pt-40 flex flex-col gap-10">
        <div className="grid md:grid-cols-2 gap-8">
          <ProductImage images={product.images || []} name={product.name} />
          <div className="flex flex-col gap-6">
            <ProductInfo product={product} />
            <ProductVariants variants={product.variants || []} />
          </div>
        </div>

        {productType && (
          <SpecificationDisplay 
            productType={productType} 
            productId={product.id} 
          />
        )}

        <div className="md:col-span-2 mt-16">
          <RelatedProducts 
            brandId={product.brand?.id} 
            currentProductId={id} 
          />
        </div>
      </div>
      
      <Commitment />
      <Footer />
    </div>
  );
};

export default ProductPage;