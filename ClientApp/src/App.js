import React, { Component, useEffect } from "react";
import { useAuthContext } from "@/hooks/auth/useAuth";
import SessionExpiredModal from "@/components/SessionExpiredModal";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import AdminLayout from "@/components/layouts/AdminLayout";
import ProductPage from "@/pages/ProductPage";
import ProfilePage from "@/pages/ProfilePage";
import ProfileInfo from "@/components/Profile/ProfileInfo";
import AddressBook from "@/components/Profile/AddressBook";
import UserOrders from "@/components/Profile/UserOrders";
import LoyaltyProgram from "@/components/Profile/LoyaltyProgram";
import ProductList from "@/pages/ProductList";
import Shoppingcart from "@/pages/shoppingcart";
import Checkout from "@/components/Checkout/Checkout";
import PaymentSuccess from "@/components/PaymentSuccess/PaymentSuccess";
// import OrderLookup from "@/components/Order/OrderLookup";
import ComparePage from "@/components/CompareProduct/ComparePage";
import Unauthorized from "@/pages/Unauthorized";
import { jwtDecode } from "jwt-decode";

// Import Chat Components
import ChatWidget from "@/components/Chat/ChatWidget";
import AdminChatDashboard from "@/components/Chat/AdminChatDashboard";

// Protected Route Component - Phiên bản tối ưu
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const isAdmin = decoded.roleId === "1"; // So sánh trực tiếp với string "1"

    // Nếu route yêu cầu admin mà user không phải admin
    if (adminOnly && !isAdmin) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  } catch (error) {
    console.error("Token error:", error);
    localStorage.removeItem("token"); // Clear token invalid
    return <Navigate to="/" replace />;
  }
};

// Component to conditionally render ChatWidget
const ConditionalChatWidget = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  // Don't show ChatWidget on admin pages
  if (isAdminPage) {
    return null;
  }

  return <ChatWidget />;
};

// Functional App component để dùng hook
const App = () => {
  const { sessionExpired, logout } = useAuthContext();
  const location = useLocation();

  useEffect(() => {
    if (sessionExpired) {
      logout();
    }
  }, [sessionExpired, logout]);

  const handleLoginRedirect = () => {
    window.location.href = "/"; // hoặc chuyển hướng đến trang đăng nhập nếu có
  };

  return (
    <>
      <SessionExpiredModal open={sessionExpired} onLogin={handleLoginRedirect} />
      <Routes>
        {/* Các route đặc biệt không cần bảo vệ */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/shoppingcart" element={<Shoppingcart />} />
        <Route path="/productlist" element={<ProductList />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/order-lookup" element={<React.Suspense fallback={<div>Đang tải trang tra cứu đơn hàng...</div>}>
          {React.createElement(require("@/pages/OrderLookupPage.jsx").default)}
        </React.Suspense>} />
        <Route path="/compare" element={<ComparePage />} />

        {/* Admin Chat Dashboard Route */}
        <Route
          path="/admin/chat"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminChatDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Profile routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfileInfo />} />
          <Route path="info" element={<ProfileInfo />} />
          <Route path="address" element={<AddressBook />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="loyalty" element={<LoyaltyProgram />} />
        </Route>
        {/* Xử lý các route từ AppRoutes */}
        {AppRoutes.map((route) => {
          const isAdminRoute = route.path?.startsWith("/admin");

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                isAdminRoute ? (
                  <ProtectedRoute adminOnly={true}>
                    <AdminLayout>{route.element}</AdminLayout>
                  </ProtectedRoute>
                ) : (
                  route.element
                )
              }
            />
          );
        })}
      </Routes>

      {/* Chat Widget - ẩn trên các trang admin */}
      <ConditionalChatWidget />
    </>
  );
};

export default App;
