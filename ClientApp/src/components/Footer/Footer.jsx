import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Monitor,
  Shield,
  Headphones,
  CreditCard,
  Wifi,
  Activity,
} from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for tech feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOrderLookup = () => {
    navigate("/order-lookup");
  };

  return (
    <footer className="bg-white text-black font-mono relative overflow-hidden border-t-2 border-black">
      {/* Tech Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Top Section with Tech Header */}
      <div className="relative border-b-2 border-black p-6">
        {/* Animated scan line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent animate-pulse opacity-30" />

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* System Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
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
                  <Wifi className="w-4 h-4 text-green-500" />
                  <Monitor className="w-4 h-4 text-black" />
                  <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                </div>
              </div>

              <h3 className="text-2xl font-bold tracking-wider mb-2 relative">
                HỆ_THỐNG_SHN_GEAR_TOÀN_QUỐC
                <div className="absolute bottom-0 left-0 w-20 h-0.5 bg-black animate-pulse" />
              </h3>
              <p className="text-sm leading-relaxed text-gray-700 max-w-2xl">
                BAO_GỒM: CỬA_HÀNG_SHN_GEAR | TRUNG_TÂM_LAPTOP | F.STUDIO |
                S.STUDIO | GARMIN_BRAND_STORE
              </p>
              <div className="mt-4 text-xs flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>SYSTEM_TIME: {currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-gray-100 border border-black text-xs">
                    ONLINE
                  </span>
                  <span className="px-2 py-1 bg-green-100 border border-green-300 text-xs">
                    24/7
                  </span>
                </div>
              </div>
            </div>

            {/* Tech Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleOrderLookup}
                className="group relative bg-black text-white px-8 py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                {/* Scan line animation */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <div className="flex items-center space-x-3 relative z-10">
                  <Monitor className="w-5 h-5" />
                  <span className="font-bold tracking-wider">
                    TRA_CỨU_ĐƠN_HÀNG
                  </span>
                </div>

                {/* Tech corner indicator */}
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-white opacity-30" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="relative p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Social & Contact Section */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition-all duration-300 relative overflow-hidden group">
              {/* Scan line */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <h4 className="text-lg font-bold tracking-wider mb-4 flex items-center">
                <Headphones className="w-5 h-5 mr-2" />
                KẾT_NỐI_SHN_GEAR
              </h4>

              {/* Social Icons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  {
                    src: "https://img.icons8.com/?size=96&id=118497&format=png",
                    alt: "FACEBOOK",
                    label: "FB",
                  },
                  {
                    src: "https://img.icons8.com/?size=96&id=0m71tmRjlxEe&format=png",
                    alt: "ZALO",
                    label: "ZL",
                  },
                  {
                    src: "https://img.icons8.com/?size=96&id=9a46bTk3awwI&format=png",
                    alt: "YOUTUBE",
                    label: "YT",
                  },
                  {
                    src: "https://img.icons8.com/?size=100&id=118638&format=png",
                    alt: "TIKTOK",
                    label: "TT",
                  },
                ].map((social, index) => (
                  <div
                    key={index}
                    className="group relative bg-white border-2 border-gray-400 hover:border-black p-3 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  >
                    <img
                      src={social.src}
                      alt={social.alt}
                      className="w-8 h-8 mx-auto filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                    <div className="text-xs text-center mt-1 font-bold">
                      {social.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="border-l-2 border-black pl-3">
                  <div className="font-bold text-xs tracking-wider mb-1">
                    TỔNG_ĐÀI_MIỄN_PHÍ
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Phone className="w-4 h-4" />
                    <span className="font-bold">0338397638</span>
                    <span className="text-xs bg-green-100 px-1">(TƯ_VẤN)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-bold">0797841166</span>
                    <span className="text-xs bg-red-100 px-1">(KHIẾU_NẠI)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Us Section */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <h4 className="text-lg font-bold tracking-wider mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                VỀ_CHÚNG_TÔI
              </h4>

              <ul className="space-y-2 text-sm">
                {[
                  "GIỚI_THIỆU_CÔNG_TY",
                  "QUY_CHẾ_HOẠT_ĐỘNG",
                  "DỰ_ÁN_DOANH_NGHIỆP",
                  "TIN_TỨC_KHUYẾN_MẠI",
                  "HƯỚNG_DẪN_MUA_HÀNG",
                  "TRA_CỨU_HÓA_ĐƠN",
                  "CÂU_HỎI_THƯỜNG_GẶP",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 hover:text-black cursor-pointer transition-colors duration-300 group/item"
                  >
                    <div className="w-2 h-2 bg-gray-400 group-hover/item:bg-black transition-colors duration-300" />
                    <span className="text-xs tracking-wide">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policy Section */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <h4 className="text-lg font-bold tracking-wider mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                CHÍNH_SÁCH
              </h4>

              <ul className="space-y-2 text-sm">
                {[
                  "CHÍNH_SÁCH_BẢO_HÀNH",
                  "CHÍNH_SÁCH_ĐỔI_TRẢ",
                  "CHÍNH_SÁCH_BẢO_MẬT",
                  "CHÍNH_SÁCH_TRẢ_GÓP",
                  "CHÍNH_SÁCH_GIAO_HÀNG",
                  "XỬ_LÝ_DỮ_LIỆU_CÁ_NHÂN",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 hover:text-black cursor-pointer transition-colors duration-300 group/item"
                  >
                    <div className="w-2 h-2 bg-gray-400 group-hover/item:bg-black transition-colors duration-300" />
                    <span className="text-xs tracking-wide">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment & Certification Section */}
            <div className="bg-gray-50 border-2 border-gray-300 rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <h4 className="text-lg font-bold tracking-wider mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                HỖ_TRỢ_THANH_TOÁN
              </h4>

              {/* Payment Icons */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  {
                    src: "https://img.icons8.com/?size=96&id=13608&format=png",
                    alt: "VISA",
                  },
                  {
                    src: "https://img.icons8.com/?size=96&id=Sq0VNi1Afgmj&format=png",
                    alt: "MASTERCARD",
                  },
                  {
                    src: "https://img.icons8.com/?size=160&id=ikCy0r3I68vX&format=png",
                    alt: "MOMO",
                  },
                  {
                    src: "https://img.icons8.com/?size=96&id=0m71tmRjlxEe&format=png",
                    alt: "ZALOPAY",
                  },
                  {
                    src: "https://img.icons8.com/?size=160&id=cFdvD3H13wdO&format=png",
                    alt: "APPLE_PAY",
                  },
                  {
                    src: "https://img.icons8.com/?size=160&id=PjkFdGXiQbvY&format=png",
                    alt: "SAMSUNG_PAY",
                  },
                ].map((payment, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-400 hover:border-black p-2 transition-all duration-300 transform hover:scale-105 cursor-pointer group/payment"
                  >
                    <img
                      src={payment.src}
                      alt={payment.alt}
                      className="w-full h-8 object-contain filter grayscale group-hover/payment:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <h5 className="font-bold text-sm tracking-wider mb-3">
                CHỨNG_NHẬN
              </h5>
              <div className="flex space-x-2">
                {[
                  {
                    src: "https://th.bing.com/th?id=OIP.vZ2cjkL0u4w45jFKiHnkyQHaHa&w=104&h=104&c=7&bgcl=552c98&r=0&o=6&dpr=1.3&pid=13.1",
                    alt: "DMCA",
                  },
                  {
                    src: "https://th.bing.com/th?id=OIP.JWsl39NXvjcGkxk3H3aB8wHaCz&w=349&h=132&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
                    alt: "BỘ_CÔNG_THƯƠNG",
                  },
                ].map((cert, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-400 hover:border-black p-2 transition-all duration-300 transform hover:scale-105 cursor-pointer group/cert"
                  >
                    <img
                      src={cert.src}
                      alt={cert.alt}
                      className="w-16 h-12 object-contain filter grayscale group-hover/cert:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Footer */}
      <div className="border-t-2 border-black bg-gray-100 p-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            {/* System Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-mono font-bold tracking-wider">
                  SYSTEM_ONLINE
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="font-mono font-bold tracking-wider">
                  FOOTER_ACTIVE
                </span>
              </div>
              <div className="flex space-x-3">
                <div className="bg-white border border-gray-400 px-2 py-1">
                  <span className="font-mono font-bold">CPU: 99%</span>
                </div>
                <div className="bg-white border border-gray-400 px-2 py-1">
                  <span className="font-mono font-bold">RAM: 85%</span>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center font-mono font-bold tracking-wider">
              © 2024 SHN_GEAR_TECH_SYSTEM_v2.1.0 | ALL_RIGHTS_RESERVED
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
