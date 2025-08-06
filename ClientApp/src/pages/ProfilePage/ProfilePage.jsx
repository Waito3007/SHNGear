import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

const ProfilePage = () => {
  const location = useLocation();
  const activeTab = location.pathname.split("/profile/")[1] || "profile";

  const tabs = [
    {
      id: "info",
      label: "THÔNG_TIN_CÁ_NHÂN",
      icon: "👤",
      code: "USER_PROFILE",
    },
    { id: "address", label: "SỔ_ĐỊA_CHỈ", icon: "🏠", code: "ADDRESS_BOOK" },
    { id: "orders", label: "ĐƠN_HÀNG", icon: "📦", code: "ORDER_HISTORY" },
    { id: "loyalty", label: "TÍCH_ĐIỂM", icon: "⭐", code: "LOYALTY_SYSTEM" },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-mono relative overflow-hidden">
      {/* Tech Grid Background */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Corner Tech Indicators */}
      <div className="fixed top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-black z-10" />
      <div className="fixed top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-black z-10" />
      <div className="fixed bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-black z-10" />
      <div className="fixed bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-black z-10" />

      <Navbar />

      <div className="flex flex-1 container mx-auto px-6 py-8 gap-8 max-w-7xl relative z-20">
        {/* Tech Sidebar Navigation */}
        <div className="w-96 flex-shrink-0">
          <div className="bg-white border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sticky top-24 overflow-hidden">
            {/* Animated scan line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent animate-pulse opacity-30" />

            {/* System Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold tracking-wider">
                  SYSTEM_ONLINE
                </span>
              </div>
              <div className="text-xs font-bold tracking-wider">v2.1.0</div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-black tracking-wider border-b-2 border-black pb-3 relative">
              TÀI_KHOẢN_CỦA_TÔI
              <div className="absolute bottom-0 left-0 w-16 h-0.5 bg-black animate-pulse" />
            </h2>

            <nav className="space-y-3">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={`/profile/${tab.id}`}
                  className={({ isActive }) =>
                    `group relative block p-4 border-2 transition-all duration-300 transform hover:scale-[1.02] overflow-hidden ${
                      isActive
                        ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                        : "bg-white text-black border-gray-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Scan line animation */}
                      <div
                        className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
                          isActive ? "via-white" : "via-black"
                        }`}
                      />

                      <div className="flex items-center gap-4 relative z-10">
                        <div
                          className={`p-2 border-2 text-lg ${
                            isActive
                              ? "bg-white text-black border-white"
                              : "bg-gray-100 text-black border-gray-400 group-hover:border-black"
                          }`}
                        >
                          {tab.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm tracking-wider break-words leading-tight">
                            {tab.label}
                          </div>
                          <div
                            className={`text-xs font-mono mt-1 break-words ${
                              isActive ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {tab.code}
                          </div>
                        </div>
                        <div
                          className={`text-xs px-2 py-1 border font-mono ${
                            isActive
                              ? "bg-white text-black border-white"
                              : "bg-gray-100 text-gray-700 border-gray-400"
                          }`}
                        >
                          {isActive ? "ACTIVE" : "READY"}
                        </div>
                      </div>

                      {/* Tech corner indicator */}
                      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-gray-400 opacity-30" />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Tech Footer */}
            <div className="mt-6 pt-4 border-t-2 border-gray-200">
              <div className="flex justify-between items-center text-xs font-bold tracking-wider mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>NAVIGATION_READY</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>MENU_ACTIVE</span>
                </div>
              </div>
              <div className="text-center text-xs font-mono text-gray-500">
                © SHN_GEAR_TECH_v2.1.0
              </div>
            </div>
          </div>
        </div>

        {/* Main Tech Content */}
        <div className="flex-1">
          <div className="bg-white border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 min-h-[calc(100vh-180px)] relative overflow-hidden">
            {/* Content scan lines */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent animate-pulse opacity-20" />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent animate-pulse opacity-20" />

            {/* Tech corner indicators */}
            <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-black opacity-30" />
            <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-black opacity-30" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-black opacity-30" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-black opacity-30" />

            <div className="relative z-10">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
