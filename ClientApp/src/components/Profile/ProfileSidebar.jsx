import React from "react";

const ProfileSidebar = () => {
  return (
    <div className="profile-sidebar">
      <ul>
        <li>🛒 Đơn hàng của tôi</li>
        <li>❤️ Khách hàng thân thiết</li>
        <li>📍 Sổ địa chỉ nhận hàng</li>
        <li className="logout">🚪 Đăng xuất</li>
      </ul>
    </div>
  );
};
export default ProfileSidebar;
