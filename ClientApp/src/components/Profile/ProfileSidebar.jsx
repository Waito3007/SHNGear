import React, { useState, useEffect } from "react";
import {
  User,
  ShoppingBag,
  Award,
  MapPin,
  ChevronRight,
  Monitor,
  Wifi,
  Activity,
} from "lucide-react";

const ProfileSidebar = ({ setActiveTab }) => {
  const [activeItem, setActiveItem] = useState("info");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for tech feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    {
      id: "info",
      label: "THÔNG_TIN_CÁ_NHÂN",
      icon: User,
      code: "USER_PROFILE",
      status: "ACTIVE",
    },
    {
      id: "orders",
      label: "ĐƠN_HÀNG_CỦA_TÔI",
      icon: ShoppingBag,
      code: "ORDER_HISTORY",
      status: "READY",
    },
    {
      id: "loyalty",
      label: "KHÁCH_HÀNG_THÂN_THIẾT",
      icon: Award,
      code: "LOYALTY_PROGRAM",
      status: "VIP",
    },
    {
      id: "address",
      label: "SỔ_ĐỊA_CHỈ_NHẬN_HÀNG",
      icon: MapPin,
      code: "ADDRESS_BOOK",
      status: "SYNC",
    },
  ];

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    setActiveTab(itemId);
  };

  return (
    <div className="bg-white rounded-none border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 m-6 h-fit relative overflow-hidden">
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
      <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-black" />
      <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-black" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-black" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-black" />

      {/* Tech Header */}
      <div className="relative mb-6 pb-4 border-b-2 border-gray-200">
        {/* Animated Scan Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent animate-pulse opacity-30" />

        <div className="flex items-center justify-between mb-3">
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

        <div className="flex items-center space-x-3 mb-2">
          <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded border border-black">
            NAVIGATION_MENU
          </span>
          <span className="text-xs font-mono text-gray-600">v2.1.0</span>
        </div>

        <h2 className="text-xl font-bold text-black font-mono tracking-wider mb-2">
          ĐIỀU_KHIỂN_HỒ_SƠ
        </h2>

        <div className="flex space-x-1 mb-3">
          <div className="w-8 h-1 bg-black rounded-full" />
          <div className="w-4 h-1 bg-gray-400 rounded-full" />
          <div className="w-2 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* System Time */}
        <div className="text-xs font-mono text-gray-500 flex justify-between">
          <span>HỆ_THỐNG_THỜI_GIAN:</span>
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`group relative cursor-pointer rounded-none p-4 border-2 transition-all duration-500 transform hover:scale-[1.02] overflow-hidden min-h-[80px] ${
                isActive
                  ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                  : "bg-gray-50 text-black border-gray-300 hover:border-black hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
              }`}
            >
              {/* Animated Scan Line on Hover */}
              <div
                className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
                  isActive ? "via-white" : "via-black"
                }`}
              />

              <div className="flex items-start gap-3 relative z-10">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 p-2.5 rounded-none border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-white text-black border-white"
                      : "bg-white text-black border-gray-400 group-hover:border-black"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-xs font-mono font-bold tracking-wider break-words leading-tight mb-1">
                    {item.label}
                  </div>
                  <div
                    className={`text-xs font-mono break-words leading-tight ${
                      isActive ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {item.code}
                  </div>
                </div>

                {/* Right Side Status & Arrow */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  {/* Status Indicator */}
                  <div
                    className={`text-xs font-mono px-2 py-1 rounded-none border transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? "bg-white text-black border-white"
                        : item.status === "VIP"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : item.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : item.status === "READY"
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : "bg-gray-100 text-gray-800 border-gray-300"
                    }`}
                  >
                    {item.status}
                  </div>

                  {/* Arrow Indicator */}
                  <ChevronRight
                    className={`w-4 h-4 transition-all duration-300 ${
                      isActive
                        ? "transform rotate-90"
                        : "group-hover:transform group-hover:translate-x-1"
                    }`}
                  />
                </div>
              </div>

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
              )}

              {/* Tech Pattern Overlay */}
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-gray-300 opacity-20" />
            </div>
          );
        })}
      </nav>

      {/* Tech Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs font-mono text-gray-500 mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>HỆ_THỐNG_HOẠT_ĐỘNG</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>MENU_SẴN_SÀNG</span>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 border border-gray-300 rounded-none p-2 text-center">
            <div className="text-black font-bold text-xs font-mono">CPU</div>
            <div className="text-green-600 text-xs font-mono">98%</div>
          </div>
          <div className="bg-gray-50 border border-gray-300 rounded-none p-2 text-center">
            <div className="text-black font-bold text-xs font-mono">RAM</div>
            <div className="text-blue-600 text-xs font-mono">64%</div>
          </div>
        </div>

        <div className="text-center text-xs font-mono text-gray-400">
          © SHN_GEAR_NAVIGATION_v2.1.0
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
