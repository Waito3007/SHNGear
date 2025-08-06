import React from "react";
import Navbar from "@/components/Navbar/Navbar";
import OrderLookup from "@/components/Order/OrderLookup";
import Footer from "@/components/Footer/Footer";

const OrderLookupPage = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white relative overflow-hidden">
        {/* Tech Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Tech Corner Indicators */}
        <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-black" />
        <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-black" />
        <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-black" />
        <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-black" />

        <div className="container mx-auto px-4 py-16 relative">
          <OrderLookup />
        </div>
      </main>
    </>
  );
};

export default OrderLookupPage;
