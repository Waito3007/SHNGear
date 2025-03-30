import React from "react";
import "./ProfileSidebar.css"; // Nếu có file CSS riêng

const ProfileSidebar = ({ setActiveTab }) => {

  return (
    <div className="profile-sidebar m-24">
      <ul>
        <li onClick={() => setActiveTab("profile")}>Thông tin cá nhân</li>
        <li onClick={() => setActiveTab("orders")}>Đơn hàng của tôi</li>
        <li onClick={() => setActiveTab("loyalty")}>Khách hàng thân thiết</li>
        <li onClick={() => setActiveTab("address")}> Sổ địa chỉ nhận hàng</li>
      </ul>
    </div>
  );
};

export default ProfileSidebar;
