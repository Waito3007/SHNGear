import React, { useEffect, useState } from "react";
import axios from "axios";

const LuckySpinManager = () => {
  const [config, setConfig] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", description: "", dropRate: 0, voucherCode: "", isLuckyNextTime: false });
  const [spinCost, setSpinCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchConfig();
    fetchItems();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/LoyaltySpin/config`);
      setConfig(res.data);
      setSpinCost(res.data?.spinCost || 0);
    } catch (err) {
      setError("Không thể tải cấu hình vòng quay");
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/LoyaltySpin/items`);
      setItems(res.data);
    } catch (err) {
      setError("Không thể tải vật phẩm vòng quay");
    }
  };

  const handleSpinCostChange = (e) => setSpinCost(e.target.value);

  const handleUpdateSpinCost = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/LoyaltySpin/config`,{ spinCost });
      fetchConfig();
    } catch (err) {
      setError("Cập nhật giá quay thất bại");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddItem = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/LoyaltySpin/items`, newItem);
      setNewItem({ name: "", description: "", dropRate: 0, voucherCode: "", isLuckyNextTime: false });
      fetchItems();
    } catch (err) {
      setError("Thêm vật phẩm thất bại");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Quản lý Vòng Quay May Mắn</h2>
        {error && <div className="text-red-500 mb-4 font-semibold">{error}</div>}
        {/* Cấu hình giá quay */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
          <label className="font-semibold min-w-[180px] text-gray-700 dark:text-gray-200">Giá mỗi lượt quay (điểm):</label>
          <div className="flex gap-2 items-center">
            <input type="number" value={spinCost} onChange={handleSpinCostChange} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            <button onClick={handleUpdateSpinCost} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition disabled:opacity-60" disabled={loading}>{loading ? "Đang cập nhật..." : "Cập nhật"}</button>
          </div>
        </div>
        {/* Thêm vật phẩm mới */}
        <div className="mb-10">
          <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-200">Thêm vật phẩm mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2">
            <input name="name" placeholder="Tên vật phẩm" value={newItem.name} onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            <input name="description" placeholder="Mô tả" value={newItem.description} onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            <input name="dropRate" type="number" step="0.01" placeholder="Tỉ lệ trúng (0-1)" value={newItem.dropRate} onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            <input name="voucherCode" placeholder="Mã voucher (nếu có)" value={newItem.voucherCode} onChange={handleInputChange} className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            <div className="flex items-center gap-2">
              <input name="isLuckyNextTime" type="checkbox" checked={newItem.isLuckyNextTime} onChange={handleInputChange} className="h-5 w-5" />
              <span className="text-gray-700 dark:text-gray-200">Chúc may mắn lần sau</span>
            </div>
          </div>
          <button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow transition disabled:opacity-60" disabled={loading}>{loading ? "Đang thêm..." : "Thêm vật phẩm"}</button>
        </div>
        {/* Danh sách vật phẩm */}
        <div className="overflow-x-auto">
          <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-200">Danh sách vật phẩm vòng quay</h3>
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-900">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <th className="border px-4 py-2 text-gray-700 dark:text-gray-200">Tên</th>
                <th className="border px-4 py-2 text-gray-700 dark:text-gray-200">Mô tả</th>
                <th className="border px-4 py-2 text-gray-700 dark:text-gray-200">Tỉ lệ trúng</th>
                <th className="border px-4 py-2 text-gray-700 dark:text-gray-200">Voucher</th>
                <th className="border px-4 py-2 text-gray-700 dark:text-gray-200">Chúc may mắn</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="border px-4 py-2 font-medium text-gray-700 dark:text-gray-200">{item.name}</td>
                  <td className="border px-4 py-2 text-gray-700 dark:text-gray-200">{item.description}</td>
                  <td className="border px-4 py-2 text-gray-700 dark:text-gray-200">{item.dropRate}</td>
                  <td className="border px-4 py- text-gray-700 dark:text-gray-200">{item.voucherCode}</td>
                  <td className="border px-4 py-2 text-center text-gray-700 dark:text-gray-200">{item.isLuckyNextTime ? "✔" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LuckySpinManager;
