import React from "react";
import Navbar from "../components/Navbar/Navbar";
import CategoryMenu from "../components/List/CategoryMenu";
import FilterSection from "../components/List/FilterSection";
import ProductGrid from "../components/List/ProductGrid";
import Footer from "../components/Footer/Footer";

const ProductList = () => {
  return (
    <div>
      <div style={styles.productListPage}>
        <Navbar />
        <CategoryMenu />
        <div style={styles.mainContainer}>
          <FilterSection />
          <ProductGrid />
        </div>
        <Footer />
      </div>
    </div>
  );
};

const styles = {
  productListPage: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  mainContainer: {
    display: "flex",
    gap: "20px",
  },
};

export default ProductList;
