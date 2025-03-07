import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddressBook.css";

const AddressBook = ({ userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  // 🔄 Load danh sách địa chỉ từ API
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/address/${userId}`);
      setAddresses(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa chỉ:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.addressLine1) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      if (formData.id) {
        await axios.put(`http://localhost:5000/api/address/update/${formData.id}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/address/add", { ...formData, userId });
      }
      setIsEditing(false);
      fetchAddresses(); // Reload danh sách địa chỉ
      setFormData({
        id: null,
        fullName: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      });
    } catch (error) {
      console.error("Lỗi khi lưu địa chỉ:", error);
    }
  };

  const handleEdit = (address) => {
    setIsEditing(true);
    setFormData(address);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/address/remove/${id}`);
      fetchAddresses();
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
    }
  };

  return (
    <div className="address-book-container">
      <h2 className="address-title">📍 Sổ địa chỉ nhận hàng</h2>

      {isEditing ? (
        <div className="edit-form">
          <label>Họ và tên</label>
          <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />

          <label>Số điện thoại</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />

          <label>Địa chỉ</label>
          <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} />

          <label>Địa chỉ bổ sung</label>
          <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />

          <label>Thành phố</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} />

          <label>Tỉnh/Bang</label>
          <input type="text" name="state" value={formData.state} onChange={handleChange} />

          <label>Mã Zip</label>
          <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} />

          <label>Quốc gia</label>
          <input type="text" name="country" value={formData.country} onChange={handleChange} />

          <button className="save-btn" onClick={handleSave}>
            {formData.id ? "Cập nhật địa chỉ" : "Thêm địa chỉ"}
          </button>
        </div>
      ) : (
        <>
          {addresses.length === 0 ? (
            <p className="no-address">Chưa có địa chỉ, vui lòng thêm địa chỉ.</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="address-card">
                <div className="address-info">
                  <p>
                    <strong>{addr.fullName}</strong> ({addr.phoneNumber})
                  </p>
                  <p>{addr.addressLine1}, {addr.addressLine2}</p>
                  <p>{addr.city}, {addr.state}, {addr.zipCode}, {addr.country}</p>
                </div>
                <div className="address-actions">
                  <button onClick={() => handleEdit(addr)}>✏️ Sửa</button>
                  <button onClick={() => handleDelete(addr.id)}>🗑️ Xóa</button>
                </div>
              </div>
            ))
          )}

          <button className="add-address-btn" onClick={() => setIsEditing(true)}>
            ➕ Thêm địa chỉ mới
          </button>
        </>
      )}
    </div>
  );
};

export default AddressBook;
