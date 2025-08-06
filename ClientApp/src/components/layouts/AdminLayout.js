import React from "react";
import Sidebar from "@/components/Admin/common/Sidebar.jsx";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden relative">
      {/* BG */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
      </div>

      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col relative z-10 min-h-0 overflow-hidden md:ml-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="min-h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
