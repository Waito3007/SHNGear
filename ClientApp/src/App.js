import React, { Component, useEffect } from "react";
import { useAuthContext } from "@/hooks/auth/useAuth";
import SessionExpiredModal from "@/components/SessionExpiredModal";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import AdminLayout from "@/components/layouts/AdminLayout"; // Add this line back
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ProductPage from "@/pages/ProductPage/ProductPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import ProfileInfo from "@/components/Profile/ProfileInfo";
import AddressBook from "@/components/Profile/AddressBook";
import UserOrders from "@/components/Profile/UserOrders";
import LoyaltyProgram from "@/components/Profile/LoyaltyProgram";
import ProductList from "@/pages/ProductList/ProductList";
import Shoppingcart from "@/pages/shoppingcart/shoppingcart";
import Checkout from "@/components/Checkout/Checkout";
import PaymentSuccess from "@/components/PaymentSuccess/PaymentSuccess";
// import OrderLookup from "@/components/Order/OrderLookup";
import ComparePage from "@/components/CompareProduct/ComparePage";
import Unauthorized from "@/pages/Unauthorized/Unauthorized";
import { jwtDecode } from "jwt-decode";
import { AuthModalProvider } from "@/contexts/AuthModalContext";

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
const AppContent = () => {
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
      <SessionExpiredModal
        open={sessionExpired}
        onLogin={handleLoginRedirect}
      />
      <Routes>
        {/* Các route đặc biệt không cần bảo vệ */}
        <Route
          path="/checkout"
          element={
            <DefaultLayout>
              <Checkout />
            </DefaultLayout>
          }
        />
        <Route
          path="/shoppingcart"
          element={
            <DefaultLayout>
              <Shoppingcart />
            </DefaultLayout>
          }
        />
        <Route
          path="/productlist"
          element={
            <DefaultLayout>
              <ProductList />
            </DefaultLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <DefaultLayout>
              <ProfilePage />
            </DefaultLayout>
          }
        />
        <Route
          path="/product/:id"
          element={
            <DefaultLayout>
              <ProductPage />
            </DefaultLayout>
          }
        />
        <Route
          path="/unauthorized"
          element={
            <DefaultLayout>
              <Unauthorized />
            </DefaultLayout>
          }
        />
        <Route
          path="/payment-success"
          element={
            <DefaultLayout>
              <PaymentSuccess />
            </DefaultLayout>
          }
        />
        <Route
          path="/order-lookup"
          element={
            <DefaultLayout>
              <React.Suspense
                fallback={<div>Đang tải trang tra cứu đơn hàng...</div>}
              >
                {React.createElement(
                  require("@/pages/OrderLookupPage/OrderLookupPage.jsx").default
                )}
              </React.Suspense>
            </DefaultLayout>
          }
        />
        <Route
          path="/compare"
          element={
            <DefaultLayout>
              <ComparePage />
            </DefaultLayout>
          }
        />

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
                  <DefaultLayout>{route.element}</DefaultLayout>
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

// Main App component with AuthModalProvider
const App = () => {
  return (
    <AuthModalProvider>
      <AppContent />
    </AuthModalProvider>
  );
};

export default App;
