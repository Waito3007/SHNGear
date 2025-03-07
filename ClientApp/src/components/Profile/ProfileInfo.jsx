import React, { useState } from "react";

const ProfileInfo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Quy Khach",
    phone: "0903029424",
    gender: "Nam",
    email: "",
    day: "",
    month: "",
    year: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
  };

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

        {isEditing ? (
          <div className="edit-form">
            <label>Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />

            <label>Số điện thoại</label>
            <input
              type="text"
              value={formData.phone}
              disabled
              className="disabled-input"
            />

            <label>Giới tính</label>
            <div className="gender-options">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Nam"
                  checked={formData.gender === "Nam"}
                  onChange={handleChange}
                />
                Nam
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="Nữ"
                  checked={formData.gender === "Nữ"}
                  onChange={handleChange}
                />
                Nữ
              </label>
            </div>

            <label>Ngày sinh</label>
            <div className="birth-date">
              <select name="day" value={formData.day} onChange={handleChange}>
                <option value="">Ngày</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
              >
                <option value="">Tháng</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <select name="year" value={formData.year} onChange={handleChange}>
                <option value="">Năm</option>
                {[...Array(100)].map((_, i) => (
                  <option key={2024 - i} value={2024 - i}>
                    {2024 - i}
                  </option>
                ))}
              </select>
            </div>

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <button className="save-btn" onClick={handleSave}>
              Cập nhật thông tin
            </button>
          </div>
        ) : (
          <div className="profile-details">
            <div className="profile-row">
              <span className="profile-label">Họ và tên</span>
              <span className="profile-value">{formData.fullName}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Số điện thoại</span>
              <span className="profile-value">{formData.phone}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Giới tính</span>
              <span className="profile-value">{formData.gender}</span>
            </div>
            <button
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfo;
