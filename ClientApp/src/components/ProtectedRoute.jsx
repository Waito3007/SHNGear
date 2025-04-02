// src/components/ProtectedRoute.jsx
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) return <Navigate to="/" replace />;

  try {
    const decoded = jwtDecode(token);
    
    // Lấy role name từ standard claim hoặc Microsoft claim
    const roleName = (
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
      decoded.role || 
      ''
    ).toString().toLowerCase(); // Chuẩn hóa về chữ thường
    
    const isAdmin = roleName === 'Admin'; // So sánh không phân biệt hoa thường
    
    if (!isAdmin) return <Navigate to="/unauthorized" replace />;
    
    return children;
  } catch (error) {
    console.error("Token error:", error);
    return <Navigate to="/" replace />;
  }
};