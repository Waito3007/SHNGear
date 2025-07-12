import React from "react";
import Navbar from "@/components/Navbar/Navbar";
import OrderLookup from "@/components/Order/OrderLookup";
import Footer from "@/components/Footer/Footer";

const OrderLookupPage = () => {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "70vh",
          background: "#f5f5f5",
          paddingTop: 48,
          paddingBottom: 48,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1200 }}>
          <OrderLookup />
        </div>
      </main>
    </>
  );
};

export default OrderLookupPage;
