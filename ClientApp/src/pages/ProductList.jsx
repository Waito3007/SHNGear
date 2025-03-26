import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import Navbar from "../components/Navbar/Navbar";
import CategoryMenu from "../components/List/CategoryMenu";
import FilterSection from "../components/List/FilterSection";
import ProductGrid from "../components/List/ProductGrid";
import Commitment from "../components/Commitment/Commitment";
import Footer from "../components/Footer/Footer";

const ProductList = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Lấy categoryId từ URL
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("categoryId");

  // Thêm state để quản lý danh mục được chọn
  const [selectedCategory, setSelectedCategory] = useState(
    location.state?.selectedCategory || null
  );

  useEffect(() => {
    if (!categoryId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://localhost:7107/api/products?categoryId=${categoryId}`);
        if (!response.ok) throw new Error("Không thể tải sản phẩm");
        const data = await response.json();
        setProducts(data.$values || data || []);
      } catch (error) {
        setError("Không thể tải sản phẩm: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  useEffect(() => {
    // Khi thay đổi danh mục, điều hướng để cập nhật state trên URL
    if (selectedCategory) {
      navigate("/ProductList", { state: { selectedCategory } });
    }
  }, [selectedCategory, navigate]);

  // Khi chọn danh mục từ menu
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div style={styles.productListPage}>
      <Navbar />
      <CategoryMenu onSelectCategory={handleCategorySelect} />
      <div style={styles.mainContainer}>
        <FilterSection />
        <ProductGrid selectedCategory={selectedCategory} />
      </div>
      <Commitment />
      <Footer />
    </div>
  );
};

const styles = {
  productListPage: { padding: "20px", fontFamily: "Arial, sans-serif" },
  mainContainer: { display: "flex", gap: "20px" },
};

export default ProductList;
