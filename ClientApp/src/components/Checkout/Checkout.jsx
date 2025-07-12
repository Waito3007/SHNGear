import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    selectedItems = [],
    totalAmount = 0,
    voucherCode = "",
    discountAmount = 0,
  } = location.state || {};

  const [userId, setUserId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [guestAddress, setGuestAddress] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [voucherId, setVoucherId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("1"); // 1 = Tiền mặt, 2 = MoMo, 3 = PayPal
  const [momoPaymentType, setMomoPaymentType] = useState("qr");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [error, setError] = useState(null);
  const [finalAmount, setFinalAmount] = useState(totalAmount);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for tech feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const id = parseInt(decoded.sub, 10);
        if (!Number.isInteger(id)) return;
        setUserId(id);
        fetchAddresses(id);
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
      }
    }

    if (voucherCode) {
      fetchVoucherId(voucherCode);
    }

    fetchPaymentMethods();
  }, [voucherCode]);

  const fetchAddresses = async (userId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/address/user/${userId}`
      );
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy địa chỉ:", error);
      setError("Lỗi khi tải địa chỉ giao hàng");
    }
  };

  const fetchVoucherId = async (code) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/vouchers/code/${code}`
      );
      setVoucherId(response.data.id);
    } catch (error) {
      console.error("Lỗi khi lấy voucher:", error);
      setError("Mã giảm giá không hợp lệ hoặc đã hết hạn");
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/PaymentMethod`
      );
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy phương thức thanh toán:", error);
      setError("Lỗi khi tải phương thức thanh toán");
    }
  };

  const removePaidItemsFromCart = async () => {
    if (!userId) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/cart/remove-paid-items?userId=${userId}`
      );
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm đã thanh toán:", error);
    }
  };

  const removeGuestCartItems = () => {
    const sessionCart = sessionStorage.getItem("Cart");
    if (!sessionCart) return;

    const cartItems = JSON.parse(sessionCart) || [];
    const paidProductVariantIds = selectedItems.map(
      (item) => item.productVariantId
    );
    const remainingItems = cartItems.filter(
      (item) => !paidProductVariantIds.includes(item.productVariantId)
    );

    sessionStorage.setItem("Cart", JSON.stringify(remainingItems));
  };
  const handlePlaceOrder = async () => {
    setError(null);

    // Xử lý giỏ hàng cho cả khách và người dùng đã đăng nhập
    if (!userId) {
      removeGuestCartItems();
    } else {
      await removePaidItemsFromCart();
    }

    if (userId && !selectedAddress) {
      setError("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    let addressId = selectedAddress ? selectedAddress.id : null;

    if (!userId && !addressId) {
      if (
        !guestAddress.fullName ||
        !guestAddress.phoneNumber ||
        !guestAddress.addressLine1 ||
        !guestAddress.city ||
        !guestAddress.state ||
        !guestAddress.country
      ) {
        setError("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/address/add`,
          {
            userId: null,
            ...guestAddress,
          }
        );
        addressId = response.data.addressId;
      } catch (error) {
        console.error("Lỗi khi thêm địa chỉ:", error);
        setError("Lỗi khi thêm địa chỉ, vui lòng thử lại.");
        setIsLoading(false);
        return;
      }
    }

    const orderDto = {
      userId: userId || null,
      orderDate: new Date().toISOString(),
      totalAmount: finalAmount,
      orderStatus: "Pending",
      addressId: addressId,
      paymentMethodId: parseInt(paymentMethod),
      orderItems: selectedItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: item.productDiscountPrice || item.productPrice,
      })),
      voucherId: voucherId || null,
    };

    try {
      setIsLoading(true);

      const headers = { "Content-Type": "application/json" };

      if (paymentMethod === "2" && momoPaymentType === "card") {
        headers["Payment-Method"] = "card";
      }

      // Handle PayPal payment
      if (paymentMethod === "3") {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/paypal/create-order`,
          orderDto,
          { headers }
        );

        if (response.data.approvalUrl) {
          // Lưu thông tin đơn hàng để sử dụng sau khi thanh toán thành công
          localStorage.setItem(
            "currentOrder",
            JSON.stringify({
              orderId: response.data.orderId,
              paymentMethod: paymentMethod,
              orderItems: selectedItems,
              totalAmount: totalAmount,
              discountAmount: discountAmount,
              voucherCode: voucherCode,
              finalAmount: finalAmount,
              paymentMethodName: "PayPal",
            })
          );
          window.location.href = response.data.approvalUrl;
          return;
        }
      }

      // Handle MoMo payment
      else if (paymentMethod === "2") {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/orders`,
          orderDto,
          { headers }
        );

        if (response.data.paymentUrl) {
          localStorage.setItem(
            "currentOrder",
            JSON.stringify({
              orderId: response.data.orderId,
              paymentMethod: paymentMethod,
              orderItems: selectedItems,
              totalAmount: totalAmount,
              discountAmount: discountAmount,
              voucherCode: voucherCode,
              finalAmount: finalAmount,
              paymentMethodName:
                momoPaymentType === "card"
                  ? "MoMo - Thẻ Visa/MasterCard"
                  : "MoMo - QR Code",
            })
          );

          window.location.href = response.data.paymentUrl;
          return;
        }
      }
      // Handle cash payment
      else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/orders`,
          orderDto,
          { headers }
        );
        navigate("/payment-success", {
          state: {
            orderId: response.data.orderId,
            orderItems: selectedItems,
            totalAmount: totalAmount,
            discountAmount: discountAmount,
            voucherCode: voucherCode,
            finalAmount: finalAmount,
            paymentMethodName:
              paymentMethods.find((pm) => pm.id.toString() === paymentMethod)
                ?.name || "Tiền mặt",
          },
        });
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      setError(
        error.response?.data?.message ||
          "Lỗi khi tạo đơn hàng, vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent animate-pulse opacity-30" />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div
                className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="w-3 h-3 bg-red-500 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 text-green-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
              </div>
              <div className="w-4 h-4 text-black">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="w-4 h-4 text-blue-500 animate-pulse">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-2">
            <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 border border-black">
              HỆ THỐNG THANH TOÁN
            </span>
            <span className="text-xs font-mono text-gray-600">v3.0.0</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-black font-mono tracking-wider mb-4">
            THANH TOÁN ĐƠN HÀNG
          </h1>

          <div className="flex space-x-1 mb-4">
            <div className="w-12 h-1 bg-black" />
            <div className="w-6 h-1 bg-gray-400" />
            <div className="w-3 h-1 bg-gray-300" />
          </div>

          <div className="text-xs font-mono text-gray-500 flex justify-between">
            <span>HỆ THỐNG THỜI GIAN:</span>
            <span>
              {currentTime.toLocaleTimeString("vi-VN", { hour12: false })}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8">
            <div className="bg-white border-2 border-red-500 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 text-red-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-mono text-red-600 font-bold">
                  {error}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
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
                    THÔNG TIN GIAO HÀNG
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-gray-600">
                      HOẠT ĐỘNG
                    </span>
                  </div>
                </div>

                {userId ? (
                  <div className="space-y-4">
                    <div className="text-sm font-mono text-gray-600 mb-4">
                      CHỌN ĐỊA CHỈ GIAO HÀNG:
                    </div>
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border-2 p-4 cursor-pointer transition-all ${
                            selectedAddress?.id === address.id
                              ? "border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onClick={() => setSelectedAddress(address)}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 border-2 border-black ${
                                selectedAddress?.id === address.id
                                  ? "bg-black"
                                  : "bg-white"
                              }`}
                            >
                              {selectedAddress?.id === address.id && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white"></div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-mono font-bold text-black">
                                {address.fullName} - {address.phoneNumber}
                              </div>
                              <div className="text-sm font-mono text-gray-600 mt-1">
                                {address.addressLine1}
                                {address.addressLine2 &&
                                  `, ${address.addressLine2}`}
                                , {address.city}, {address.state},{" "}
                                {address.country}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-600 mb-2">
                          HỌ VÀ TÊN *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestAddress.fullName}
                          onChange={(e) =>
                            setGuestAddress({
                              ...guestAddress,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-300 font-mono text-black focus:border-black focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-600 mb-2">
                          SỐ ĐIỆN THOẠI *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestAddress.phoneNumber}
                          onChange={(e) =>
                            setGuestAddress({
                              ...guestAddress,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-300 font-mono text-black focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-600 mb-2">
                        ĐỊA CHỈ *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestAddress.addressLine1}
                        onChange={(e) =>
                          setGuestAddress({
                            ...guestAddress,
                            addressLine1: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-gray-300 font-mono text-black focus:border-black focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-gray-600 mb-2">
                        ĐỊA CHỈ BỔ SUNG (TÙY CHỌN)
                      </label>
                      <input
                        type="text"
                        value={guestAddress.addressLine2}
                        onChange={(e) =>
                          setGuestAddress({
                            ...guestAddress,
                            addressLine2: e.target.value,
                          })
                        }
                        className="w-full p-3 border-2 border-gray-300 font-mono text-black focus:border-black focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-600 mb-2">
                          THÀNH PHỐ *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestAddress.city}
                          onChange={(e) =>
                            setGuestAddress({
                              ...guestAddress,
                              city: e.target.value,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-300 font-mono text-black focus:border-black focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-600 mb-2">
                          TỈNH/THÀNH *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestAddress.state}
                          onChange={(e) =>
                            setGuestAddress({
                              ...guestAddress,
                              state: e.target.value,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-300 font-mono text-black focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-gray-600 mb-2">
                          MÃ BƯU ĐIỆN
                        </label>
                        <input
                          type="text"
                          value={guestAddress.zipCode}
                          onChange={(e) =>
                            setGuestAddress({
                              ...guestAddress,
                              zipCode: e.target.value,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-300 font-mono text-black focus:border-black focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-gray-600 mb-2">
                          QUỐC GIA *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestAddress.country}
                          onChange={(e) =>
                            setGuestAddress({
                              ...guestAddress,
                              country: e.target.value,
                            })
                          }
                          className="w-full p-3 border-2 border-gray-300 font-mono text-black focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
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
                    PHƯƠNG THỨC THANH TOÁN
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-gray-600">
                      CẬP NHẬT
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="space-y-2">
                      <div
                        className={`border-2 p-4 cursor-pointer transition-all ${
                          paymentMethod === method.id.toString()
                            ? "border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() => setPaymentMethod(method.id.toString())}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 border-2 border-black ${
                              paymentMethod === method.id.toString()
                                ? "bg-black"
                                : "bg-white"
                            }`}
                          >
                            {paymentMethod === method.id.toString() && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white"></div>
                              </div>
                            )}
                          </div>
                          <span className="font-mono font-bold text-black">
                            {method.name}
                          </span>
                        </div>
                      </div>

                      {/* MoMo Sub-options */}
                      {method.id === 2 && paymentMethod === "2" && (
                        <div className="ml-7 space-y-2">
                          <div
                            className={`border p-3 cursor-pointer transition-all ${
                              momoPaymentType === "qr"
                                ? "border-black bg-gray-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => setMomoPaymentType("qr")}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 border border-black ${
                                  momoPaymentType === "qr"
                                    ? "bg-black"
                                    : "bg-white"
                                }`}
                              />
                              <span className="text-sm font-mono text-black">
                                QUÉT QR CODE
                              </span>
                            </div>
                          </div>
                          <div
                            className={`border p-3 cursor-pointer transition-all ${
                              momoPaymentType === "card"
                                ? "border-black bg-gray-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={() => setMomoPaymentType("card")}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-3 h-3 border border-black ${
                                  momoPaymentType === "card"
                                    ? "bg-black"
                                    : "bg-white"
                                }`}
                              />
                              <span className="text-sm font-mono text-black">
                                THẺ VISA/MASTERCARD
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Payment Info */}
                {paymentMethod === "2" && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-300">
                    <span className="text-xs font-mono text-gray-600">
                      {momoPaymentType === "card"
                        ? "BẠN SẼ ĐƯỢC CHUYỂN HƯỚNG ĐẾN TRANG THANH TOÁN BẰNG THẺ VISA/MASTERCARD"
                        : "BẠN SẼ ĐƯỢC CHUYỂN HƯỚNG ĐẾN TRANG THANH TOÁN QR MOMO"}
                    </span>
                  </div>
                )}

                {paymentMethod === "3" && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-300">
                    <span className="text-xs font-mono text-gray-600">
                      BẠN SẼ ĐƯỢC CHUYỂN HƯỚNG ĐẾN TRANG THANH TOÁN PAYPAL
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden sticky top-8">
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
                    ĐƠN HÀNG CỦA BẠN
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-gray-600">
                      {selectedItems.length} SP
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {selectedItems.map((item) => (
                    <div
                      key={item.productVariantId}
                      className="border-b border-gray-200 pb-4 last:border-b-0"
                    >
                      <div className="flex space-x-3">
                        <div className="relative">
                          <img
                            src={
                              item.productImage.startsWith("http")
                                ? item.productImage
                                : `${process.env.REACT_APP_API_BASE_URL}/${item.productImage}`
                            }
                            alt="Product"
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
                            {item.isFlashSale &&
                            item.productPrice !== item.productDiscountPrice ? (
                              <div className="space-y-1">
                                <div className="text-xs font-mono text-gray-500 line-through">
                                  {item.productPrice.toLocaleString()}₫
                                </div>
                                <div className="text-sm font-mono font-bold text-red-600">
                                  {item.productDiscountPrice.toLocaleString()}₫
                                </div>
                                <div className="inline-block bg-red-500 text-white text-xs font-mono px-1 py-0.5">
                                  FLASH SALE
                                </div>
                              </div>
                            ) : item.productDiscountPrice &&
                              item.productPrice !==
                                item.productDiscountPrice ? (
                              <div className="space-y-1">
                                <div className="text-xs font-mono text-gray-500 line-through">
                                  {item.productPrice.toLocaleString()}₫
                                </div>
                                <div className="text-sm font-mono font-bold text-red-600">
                                  {item.productDiscountPrice.toLocaleString()}₫
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm font-mono font-bold text-black">
                                {item.productPrice.toLocaleString()}₫
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Calculation */}
                <div className="space-y-3 border-t-2 border-gray-200 pt-4">
                  {(() => {
                    const originalTotal = selectedItems.reduce(
                      (sum, item) => sum + item.productPrice * item.quantity,
                      0
                    );
                    const currentTotal = selectedItems.reduce(
                      (sum, item) =>
                        sum +
                        (item.productDiscountPrice || item.productPrice) *
                          item.quantity,
                      0
                    );
                    const productSavings = originalTotal - currentTotal;
                    const finalTotal = currentTotal - discountAmount;

                    return (
                      <>
                        <div className="flex justify-between font-mono text-sm">
                          <span className="text-gray-600">TỔNG GIÁ GỐC:</span>
                          <span className="text-black">
                            {originalTotal.toLocaleString()}₫
                          </span>
                        </div>

                        {productSavings > 0 && (
                          <div className="flex justify-between font-mono text-sm">
                            <span className="text-gray-600">
                              TIẾT KIỆM TỪ SẢN PHẨM:
                            </span>
                            <span className="text-green-600">
                              -{productSavings.toLocaleString()}₫
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between font-mono text-sm">
                          <span className="text-gray-600">TẠM TÍNH:</span>
                          <span className="text-black">
                            {currentTotal.toLocaleString()}₫
                          </span>
                        </div>

                        {voucherCode && (
                          <div className="bg-gray-50 border border-gray-300 p-3">
                            <div className="flex justify-between font-mono text-sm mb-1">
                              <span className="text-gray-600">
                                MÃ GIẢM GIÁ: {voucherCode}
                              </span>
                            </div>
                            <div className="flex justify-between font-mono text-sm">
                              <span className="text-gray-600">
                                GIẢM GIÁ TỪ VOUCHER:
                              </span>
                              <span className="text-green-600">
                                -{discountAmount.toLocaleString()}₫
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="border-t-2 border-gray-200 pt-3">
                          <div className="flex justify-between font-mono text-lg font-bold">
                            <span className="text-black">TỔNG CỘNG:</span>
                            <span className="text-red-600">
                              {finalTotal.toLocaleString()}₫
                            </span>
                          </div>

                          {productSavings + discountAmount > 0 && (
                            <div className="text-center mt-2">
                              <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-1 border border-green-200">
                                TỔNG TIẾT KIỆM:{" "}
                                {(
                                  productSavings + discountAmount
                                ).toLocaleString()}
                                ₫
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading || selectedItems.length === 0}
                  className="w-full mt-6 bg-black text-white p-4 font-mono font-bold tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>ĐANG XỬ LÝ...</span>
                    </div>
                  ) : paymentMethod === "2" ? (
                    momoPaymentType === "card" ? (
                      "THANH TOÁN BẰNG THẺ VISA/MASTERCARD"
                    ) : (
                      "THANH TOÁN BẰNG QR MOMO"
                    )
                  ) : paymentMethod === "3" ? (
                    "THANH TOÁN BẰNG PAYPAL"
                  ) : (
                    "THANH TOÁN VỚI TIỀN MẶT"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Footer Stats */}
        <div className="mt-16 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs font-mono text-gray-500 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>HỆ THỐNG THANH TOÁN HOẠT ĐỘNG</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>BẢO MẬT SSL</span>
            </div>
          </div>

          <div className="text-center text-xs font-mono text-gray-400">
            © SHN GEAR CHECKOUT SYSTEM v3.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
