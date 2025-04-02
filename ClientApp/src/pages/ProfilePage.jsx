import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const ProfilePage = () => {
  const location = useLocation();
  const activeTab = location.pathname.split("/profile/")[1] || "profile";

  const tabs = [
    { id: "info", label: "Thông tin cá nhân", icon: "👤" },
    { id: "address", label: "Sổ địa chỉ", icon: "🏠" },
    { id: "orders", label: "Đơn hàng", icon: "📦" },
    { id: "loyalty", label: "Tích điểm", icon: "⭐" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex flex-1 container mx-auto px-4 py-8 gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Tài khoản của tôi</h2>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={`/profile/${tab.id}`}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-180px)]">
            <Outlet />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;