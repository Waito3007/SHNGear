import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderLookup } from "@/hooks/api/useOrderLookup";

const OrderLookup = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { orders, loading, error, searchOrdersByPhone } = useOrderLookup();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (phoneNumber.trim()) {
      searchOrdersByPhone(phoneNumber);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "CHO XAC NHAN";
      case "Processing":
        return "DA XAC NHAN";
      case "Shipped":
        return "DANG VAN CHUYEN";
      case "Delivered":
        return "DA GIAO HANG";
      case "Cancelled":
        return "DA HUY";
      case "Paid":
        return "DA THANH TOAN";
      default:
        return status?.toUpperCase();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
      case "Paid":
        return "text-green-500";
      case "Shipped":
        return "text-blue-500";
      case "Processing":
        return "text-yellow-500";
      case "Cancelled":
        return "text-red-500";
      default:
        return "text-black";
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-mono text-black">
      {/* Tech Header */}
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 relative overflow-hidden">
        {/* Corner indicators */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-black"></div>
        <div className="absolute top-2 right-2 w-3 h-3 bg-black"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-black"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-black"></div>

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        <div className="relative p-6">
          {/* Header row */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              </div>
              <span className="text-sm font-bold text-black">
                SYSTEM.LOOKUP
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs text-black">THOI GIAN HE THONG</div>
              <div className="text-sm font-bold text-black">
                {currentTime.toLocaleTimeString("vi-VN")}
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-black mb-2">
            TRA CUU DON HANG
          </h1>
          <div className="h-1 bg-black w-32 mb-6"></div>

          {/* Search Form */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-bold text-black mb-2">
                SO DIEN THOAI
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="VD: 0778706084"
                  className="w-full px-4 py-3 border-2 border-black font-mono text-lg text-black focus:outline-none focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="md:self-end">
              <button
                onClick={handleSearch}
                disabled={loading || !phoneNumber.trim()}
                className="w-full md:w-auto px-8 py-3 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>DANG TIM...</span>
                  </div>
                ) : (
                  "TRA CUU"
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-bold text-black">LOI HE THONG</span>
              </div>
              <p className="text-black mt-2">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {orders.length > 0 && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">KET QUA TRA CUU</h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-bold text-black">
                  {orders.length} DON HANG
                </span>
              </div>
            </div>
          </div>

          {/* Order Cards */}
          {orders.map((order, index) => (
            <div
              key={order.orderId}
              className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
            >
              {/* Order number indicator */}
              <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs font-bold">
                #{String(index + 1).padStart(2, "0")}
              </div>

              <div className="p-6 pt-12">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-black">
                      DON HANG #{order.orderId}
                    </h3>
                    <div className="h-1 bg-black w-24"></div>
                  </div>
                  <div
                    className={`mt-4 md:mt-0 px-4 py-2 border-2 border-black font-bold ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {getStatusLabel(order.orderStatus)}
                  </div>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="border-2 border-gray-300 p-4">
                    <div className="text-xs text-black font-bold mb-1">
                      NGAY DAT
                    </div>
                    <div className="font-bold text-black">
                      {order.orderDate}
                    </div>
                  </div>
                  <div className="border-2 border-gray-300 p-4">
                    <div className="text-xs text-black font-bold mb-1">
                      DU KIEN GIAO
                    </div>
                    <div className="font-bold text-black">
                      {order.estimatedDelivery}
                    </div>
                  </div>
                  <div className="border-2 border-gray-300 p-4">
                    <div className="text-xs text-black font-bold mb-1">
                      TONG TIEN
                    </div>
                    <div className="font-bold text-lg text-black">
                      {order.formattedTotal}
                    </div>
                  </div>
                  <div className="border-2 border-gray-300 p-4">
                    <div className="text-xs text-black font-bold mb-1">
                      PHUONG THUC
                    </div>
                    <div className="font-bold text-black">
                      {order.paymentMethod}
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-gray-50 border-2 border-gray-300 p-4 mb-6">
                  <h4 className="text-sm font-bold text-black mb-3">
                    THONG TIN GIAO HANG
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-wrap gap-4">
                      <span className="font-bold text-black">
                        {order.shippingInfo.fullName}
                      </span>
                      <span className="text-black">|</span>
                      <span className="text-black">
                        {order.shippingInfo.phone}
                      </span>
                    </div>
                    <div className="text-black">
                      {order.shippingInfo.address}
                    </div>
                    <div className="text-black">
                      Email: {order.shippingInfo.email}
                    </div>
                  </div>
                </div>

                {/* Products Table */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-black mb-3">
                    SAN PHAM DA DAT
                  </h4>
                  <div className="overflow-x-auto border-2 border-gray-300">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                          <th className="text-left p-3 font-bold text-black">
                            SAN PHAM
                          </th>
                          <th className="text-center p-3 font-bold text-black">
                            BIEN THE
                          </th>
                          <th className="text-right p-3 font-bold text-black">
                            SO LUONG
                          </th>
                          <th className="text-right p-3 font-bold text-black">
                            DON GIA
                          </th>
                          <th className="text-right p-3 font-bold text-black">
                            THANH TIEN
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.products.map((product, productIndex) => (
                          <tr
                            key={productIndex}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="p-3">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={
                                    product.image?.startsWith("http")
                                      ? product.image
                                      : `${process.env.REACT_APP_API_BASE_URL}/${product.image}`
                                  }
                                  alt={product.name || "Anh san pham"}
                                  className="w-12 h-12 object-contain border border-gray-300"
                                />
                                <span className="font-medium text-black">
                                  {product.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-center p-3">
                              <span className="px-2 py-1 bg-gray-200 border border-gray-400 text-xs font-bold text-black">
                                {product.variant}
                              </span>
                            </td>
                            <td className="text-right p-3 font-bold text-black">
                              {product.quantity}
                            </td>
                            <td className="text-right p-3 text-black">
                              {formatPrice(product.price)}
                            </td>
                            <td className="text-right p-3 font-bold text-black">
                              {formatPrice(product.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                    className="px-6 py-2 border-2 border-black bg-white text-black font-bold hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                  >
                    XEM CHI TIET
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                  >
                    IN HOA DON
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* System Stats Footer */}
          <div className="bg-gray-100 border-2 border-gray-400 p-4">
            <div className="flex justify-between items-center text-xs text-black">
              <div className="flex space-x-4">
                <span>ORDERS.FOUND: {orders.length}</span>
                <span>STATUS: ACTIVE</span>
                <span>VERSION: 2.1.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>SYSTEM.ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!loading && orders.length === 0 && phoneNumber && (
        <div className="bg-white border-2 border-gray-400 p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-6xl text-gray-300 mb-4">📭</div>
          <h3 className="text-xl font-bold text-black mb-2">
            KHONG TIM THAY DON HANG
          </h3>
          <p className="text-black">
            Khong co don hang nao voi so dien thoai {phoneNumber}
          </p>
          <div className="mt-4 text-xs text-black">
            Vui long kiem tra lai so dien thoai hoac lien he ho tro khach hang
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderLookup;
