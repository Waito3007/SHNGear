import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for tech feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Lấy dữ liệu từ state hoặc localStorage
    const stateData = location.state;
    const localStorageData = localStorage.getItem("currentOrder");

    if (stateData) {
      setOrderData(stateData);
    } else if (localStorageData) {
      try {
        const parsedData = JSON.parse(localStorageData);
        setOrderData(parsedData);
        // Xóa dữ liệu khỏi localStorage sau khi sử dụng
        localStorage.removeItem("currentOrder");
      } catch (error) {
        console.error("Lỗi khi parse dữ liệu localStorage:", error);
      }
    }
  }, [location.state]);

  const handleTrackOrder = () => {
    if (orderData?.orderId) {
      navigate(`/order-tracking/${orderData.orderId}`);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };
  if (!orderData) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        {/* Tech Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="text-center">
          <div className="bg-white border-2 border-orange-500 shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] p-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-4 h-4 text-orange-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-mono text-orange-600 font-bold">
                KHÔNG TÌM THẤY THÔNG TIN ĐƠN HÀNG
              </span>
            </div>
            <button
              onClick={handleGoHome}
              className="bg-black text-white px-6 py-3 font-mono font-bold tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              VỀ TRANG CHỦ
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
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
        {/* Tech Header */}
        <div className="relative mb-16 pb-8 border-b-2 border-gray-200">
          {/* Animated Scan Line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse opacity-50" />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div
                className="w-3 h-3 bg-green-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="w-3 h-3 bg-green-500 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 text-green-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="w-4 h-4 text-green-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
              </div>
              <div className="w-4 h-4 text-green-500 animate-pulse">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-2">
            <span className="text-xs font-mono text-gray-600 bg-green-100 px-2 py-1 border border-green-500">
              THANH TOÁN THÀNH CÔNG
            </span>
            <span className="text-xs font-mono text-gray-600">v3.0.0</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-black font-mono tracking-wider mb-4">
            ĐẶT HÀNG THÀNH CÔNG
          </h1>

          <div className="flex space-x-1 mb-4">
            <div className="w-12 h-1 bg-green-500" />
            <div className="w-6 h-1 bg-green-400" />
            <div className="w-3 h-1 bg-green-300" />
          </div>

          <div className="text-xs font-mono text-gray-500 flex justify-between">
            <span>HỆ THỐNG THỜI GIAN:</span>
            <span>
              {currentTime.toLocaleTimeString("vi-VN", { hour12: false })}
            </span>
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-4xl mx-auto">
          {/* Success Icon and Message */}
          <div className="text-center mb-12">
            <div className="bg-white border-2 border-green-500 shadow-[8px_8px_0px_0px_rgba(34,197,94,1)] p-8 inline-block mb-6">
              <div className="w-24 h-24 mx-auto mb-4 text-green-500">
                <svg
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  className="w-full h-full"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="font-mono text-green-600 font-bold text-lg tracking-wider">
                GIAO DỊCH HOÀN TẤT
              </div>
            </div>

            <div className="font-mono text-gray-600 max-w-2xl mx-auto">
              CẢM ƠN BẠN ĐÃ MUA HÀNG. ĐƠN HÀNG CỦA BẠN ĐÃ ĐƯỢC XÁC NHẬN VÀ SẼ
              ĐƯỢC XỬ LÝ TRONG THỜI GIAN SỚM NHẤT.
            </div>
          </div>

          {/* Order Information */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              {/* Tech Grid Background */}
              <div
                className="absolute inset-0 opacity-3"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                                   linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
                  backgroundSize: "15px 15px",
                }}
              />

              {/* Tech Corner Indicators */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-black" />
              <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-black" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-black" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-black" />

              <div className="p-6 relative z-10">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-black text-white px-4 py-2 font-mono text-sm font-bold tracking-wider">
                    THÔNG TIN ĐƠN HÀNG
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-gray-600">
                      XÁC NHẬN
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Order ID */}
                  <div className="border-b border-gray-200 pb-3">
                    <label className="block text-xs font-mono text-gray-600 mb-1">
                      MÃ ĐƠN HÀNG:
                    </label>
                    <div className="bg-gray-50 border border-gray-300 p-3 font-mono font-bold text-black">
                      #{orderData.orderId}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="border-b border-gray-200 pb-3">
                    <label className="block text-xs font-mono text-gray-600 mb-1">
                      PHƯƠNG THỨC THANH TOÁN:
                    </label>
                    <div className="bg-gray-50 border border-gray-300 p-3 font-mono font-bold text-black">
                      {orderData.paymentMethodName}
                    </div>
                  </div>

                  {/* Order Status */}
                  <div>
                    <label className="block text-xs font-mono text-gray-600 mb-1">
                      TRẠNG THÁI:
                    </label>
                    <div className="bg-green-50 border border-green-300 p-3 font-mono font-bold text-green-600">
                      ĐANG XỬ LÝ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              {/* Tech Grid Background */}
              <div
                className="absolute inset-0 opacity-3"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                                   linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
                  backgroundSize: "15px 15px",
                }}
              />

              {/* Tech Corner Indicators */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-black" />
              <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-black" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-black" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-black" />

              <div className="p-6 relative z-10">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-black text-white px-4 py-2 font-mono text-sm font-bold tracking-wider">
                    SẢN PHẨM ĐÃ MUA
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-gray-600">
                      {orderData.orderItems?.length || 0} SP
                    </span>
                  </div>
                </div>

                {/* Product List */}
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {orderData.orderItems?.map((item, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      <div className="flex space-x-3">
                        <div className="relative">
                          <img
                            src={
                              item.productImage?.startsWith("http")
                                ? item.productImage
                                : `${process.env.REACT_APP_API_BASE_URL}/${item.productImage}`
                            }
                            alt={item.productName}
                            className="w-16 h-16 object-cover border-2 border-gray-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/64";
                            }}
                          />
                          {/* Quantity Badge */}
                          <div className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 flex items-center justify-center text-xs font-mono font-bold">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-mono text-sm font-bold text-black mb-1">
                            {item.productName}
                          </div>
                          <div className="text-xs font-mono text-gray-600 mb-2">
                            {item.variantColor} - {item.variantStorage}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-mono font-bold text-black">
                              {(
                                item.productDiscountPrice || item.productPrice
                              )?.toLocaleString()}
                              ₫
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mt-8">
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden max-w-md mx-auto">
              {/* Tech Grid Background */}
              <div
                className="absolute inset-0 opacity-3"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                                   linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
                  backgroundSize: "15px 15px",
                }}
              />

              {/* Tech Corner Indicators */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-black" />
              <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-black" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-black" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-black" />

              <div className="p-6 relative z-10">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-black text-white px-4 py-2 font-mono text-sm font-bold tracking-wider">
                    TỔNG KẾT THANH TOÁN
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-gray-600">TẠM TÍNH:</span>
                    <span className="text-black">
                      {(
                        (orderData.totalAmount || 0) +
                        (orderData.discountAmount || 0)
                      ).toLocaleString()}
                      ₫
                    </span>
                  </div>

                  {orderData.discountAmount > 0 && (
                    <>
                      <div className="bg-green-50 border border-green-300 p-3">
                        <div className="flex justify-between font-mono text-sm mb-1">
                          <span className="text-gray-600">
                            MÃ GIẢM GIÁ: {orderData.voucherCode}
                          </span>
                        </div>
                        <div className="flex justify-between font-mono text-sm">
                          <span className="text-gray-600">GIẢM GIÁ:</span>
                          <span className="text-green-600">
                            -{orderData.discountAmount.toLocaleString()}₫
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="border-t-2 border-gray-200 pt-3">
                    <div className="flex justify-between font-mono text-lg font-bold">
                      <span className="text-black">TỔNG CỘNG:</span>
                      <span className="text-red-600">
                        {(
                          orderData.finalAmount ||
                          orderData.totalAmount ||
                          0
                        ).toLocaleString()}
                        ₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTrackOrder}
              className="bg-white text-black px-6 py-3 font-mono font-bold tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all flex items-center justify-center space-x-2"
            >
              <div className="w-4 h-4">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>TRA CỨU ĐƠN HÀNG</span>
            </button>

            <button
              onClick={handleGoHome}
              className="bg-black text-white px-6 py-3 font-mono font-bold tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all flex items-center justify-center space-x-2"
            >
              <div className="w-4 h-4">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </div>
              <span>VỀ TRANG CHỦ</span>
            </button>
          </div>

          {/* Footer Message */}
          <div className="mt-8 text-center">
            <div className="bg-gray-50 border border-gray-300 p-4 inline-block">
              <span className="text-xs font-mono text-gray-600">
                BẠN SẼ NHẬN ĐƯỢC EMAIL XÁC NHẬN ĐƠN HÀNG TRONG ÍT PHÚT.
              </span>
            </div>
          </div>
        </div>

        {/* Tech Footer Stats */}
        <div className="mt-16 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs font-mono text-gray-500 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>GIAO DỊCH HOÀN TẤT</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>BẢO MẬT SSL</span>
            </div>
          </div>

          <div className="text-center text-xs font-mono text-gray-400">
            © SHN GEAR PAYMENT SUCCESS v3.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
