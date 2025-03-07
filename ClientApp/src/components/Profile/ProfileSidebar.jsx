import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileSidebar.css"; // Nếu có file CSS riêng

const ProfileSidebar = ({ setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    sessionStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <div className="profile-sidebar">
      <ul>
        <li onClick={() => setActiveTab("profile")}>Thông tin cá nhân</li>
        <li onClick={() => setActiveTab("orders")}>Đơn hàng của tôi</li>
        <li onClick={() => setActiveTab("loyalty")}>Khách hàng thân thiết</li>
        <li onClick={() => setActiveTab("address")}> Sổ địa chỉ nhận hàng</li>
        <li onClick={() => setActiveTab("viewed")}>Sản phẩm đã xem</li>
        <li className="logout" onClick={handleLogout}>Đăng xuất</li>
      </ul>
    </div>
  );
};

export default ProfileSidebar;
