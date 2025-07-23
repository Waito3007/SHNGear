import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Input, Pagination, Modal, Form, Checkbox } from 'antd';
import 'antd/dist/reset.css';

const LuckySpinManager = () => {
  const [config, setConfig] = useState(null);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
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

  // Chỉnh sửa vật phẩm
  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const handleEditModalCancel = () => {
    setEditModalOpen(false);
    setEditingItem(null);
  };

  const handleEditModalOk = async (values) => {
    setLoading(true);
    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/LoyaltySpin/items/${editingItem.id}`, values);
      fetchItems();
      setEditModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      setError("Cập nhật vật phẩm thất bại");
    }
    setLoading(false);
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
          <Table
            dataSource={items.slice((currentPage-1)*pageSize, currentPage*pageSize)}
            rowKey="id"
            pagination={false}
            columns={[
              { title: 'Tên', dataIndex: 'name', key: 'name' },
              { title: 'Mô tả', dataIndex: 'description', key: 'description' },
              { title: 'Tỉ lệ trúng', dataIndex: 'dropRate', key: 'dropRate' },
              { title: 'Voucher', dataIndex: 'voucherCode', key: 'voucherCode' },
              { title: 'Chúc may mắn', dataIndex: 'isLuckyNextTime', key: 'isLuckyNextTime', render: v => v ? '✔' : '' },
              {
                title: 'Thao tác',
                key: 'action',
                render: (_, item) => (
                  <Button type="link" onClick={() => handleEditItem(item)}>Sửa</Button>
                )
              }
            ]}
          />
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={items.length}
            onChange={setCurrentPage}
            showSizeChanger
            onShowSizeChange={(_, size) => setPageSize(size)}
            style={{ marginTop: 16, textAlign: 'right' }}
          />
          <Modal
            title="Chỉnh sửa vật phẩm"
            open={editModalOpen}
            onCancel={handleEditModalCancel}
            footer={null}
          >
            {editingItem && (
              <Form
                initialValues={editingItem}
                onFinish={handleEditModalOk}
                layout="vertical"
              >
                <Form.Item name="name" label="Tên vật phẩm" rules={[{ required: true, message: 'Nhập tên vật phẩm' }]}> <Input /> </Form.Item>
                <Form.Item name="description" label="Mô tả"> <Input /> </Form.Item>
                <Form.Item name="dropRate" label="Tỉ lệ trúng" rules={[{ required: true, message: 'Nhập tỉ lệ trúng' }]}> <Input type="number" step="0.01" /> </Form.Item>
                <Form.Item name="voucherCode" label="Mã voucher"> <Input /> </Form.Item>
                <Form.Item name="isLuckyNextTime" valuePropName="checked" label="Chúc may mắn lần sau"> <Checkbox /> </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>Lưu</Button>
                </Form.Item>
              </Form>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default LuckySpinManager;
