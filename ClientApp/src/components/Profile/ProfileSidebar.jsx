import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa dữ liệu đăng nhập (nếu có)
    localStorage.removeItem("userToken"); // Nếu dùng token
    sessionStorage.removeItem("userToken"); // Nếu dùng sessionStorage

    // Chuyển hướng về trang đăng nhập
    navigate("/login");
  };

  return (
    <div className="profile-sidebar">
      <ul>
        <li>🛒 Đơn hàng của tôi</li>
        <li>❤️ Khách hàng thân thiết</li>
        <li>📍 Sổ địa chỉ nhận hàng</li>
        <li className="logout" onClick={handleLogout}>
          🚪 Đăng xuất
        </li>
      </ul>
    </div>
  );
};

export default ProfileSidebar;
