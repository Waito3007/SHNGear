import React from "react";

const ProfileInfo = () => {
  return (
    <div className="profile-info-container">
      <h2 className="profile-title">Thông tin cá nhân</h2>
      <div className="profile-card">
        <div className="avatar-container">
          <img
            src="https://thuthuatnhanh.com/wp-content/uploads/2018/07/anh-dai-dien-dep.jpg"
            alt="Avatar"
            className="profile-avatar"
          />
        </div>
        <div className="profile-details">
          <div className="profile-row">
            <span className="profile-label">Họ và tên</span>
            <span className="profile-value">Quy Khach</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Số điện thoại</span>
            <span className="profile-value">0903029424</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Giới tính</span>
            <span className="profile-value">Nam</span>
          </div>
        </div>
        <button className="edit-profile-btn">Chỉnh sửa thông tin</button>
      </div>
    </div>
  );
};

export default ProfileInfo;
