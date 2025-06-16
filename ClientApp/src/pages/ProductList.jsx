import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import CategoryMenu from "../components/List/CategoryMenu";
import FilterSection from "../components/List/FilterSection";
import ProductGrid from "../components/List/ProductGrid";
import Commitment from "../components/Commitment/Commitment";
import Footer from "../components/Footer/Footer";

const ProductList = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("categoryId");

  // Quản lý bộ lọc
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState(null);

 

  return (
    <div style={styles.productListPage}>
      <Navbar />
      <CategoryMenu />
      <div style={styles.mainContainer}>
        <FilterSection
          onPriceChange={setSelectedPriceRange}
          onBrandChange={setSelectedBrand}
        />

        <ProductGrid
          selectedCategory={categoryId ? parseInt(categoryId) : null}
          selectedPriceRange={selectedPriceRange}
          selectedBrand={selectedBrand}
        />
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
