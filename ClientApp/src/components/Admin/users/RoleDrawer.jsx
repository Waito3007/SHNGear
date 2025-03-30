import React, { useState, useEffect } from "react";
import { Drawer, Button, Table, Space, Modal, Form, Input, message } from "antd";
import { Pencil, Trash, Plus } from "lucide-react";

const RoleDrawer = ({ visible, onClose }) => {
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) fetchRoles();
  }, [visible]);

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/roles`);
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu");
    }
  };

  const handleAddOrEdit = async (values) => {
    try {
      if (editingRole) {
        // API cập nhật
        await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/roles/${editingRole.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("Cập nhật role thành công");
        setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? { ...r, ...values } : r)));
      } else {
        // API thêm mới
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const newRole = await res.json();
        message.success("Thêm role thành công");
        setRoles((prev) => [...prev, newRole]);
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingRole(null);
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xóa Role",
      content: "Bạn có chắc muốn xóa role này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/roles/${id}`, { method: "DELETE" });
          message.success("Xóa role thành công");
          setRoles((prev) => prev.filter((r) => r.id !== id));
        } catch (error) {
          message.error("Không thể xóa role vì đang được sử dụng.");
        }
      },
    });
  };

  const columns = [
    { title: "Tên Role", dataIndex: "name", key: "name" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<Pencil size={18} />}
            onClick={() => {
              setEditingRole(record);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          />
          <Button icon={<Trash size={18} />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Drawer title="Quản lý Role" open={visible} onClose={onClose} width={500}>
      <Button type="primary" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
        Quản lý Role
      </Button>
      <Table columns={columns} dataSource={roles} rowKey="id" style={{ marginTop: 20 }} />
      
      <Modal
        title={editingRole ? "Chỉnh sửa Role" : "Thêm Role"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingRole(null);
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddOrEdit}>
          <Form.Item name="name" label="Tên Role" rules={[{ required: true, message: "Nhập tên role" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};

export default RoleDrawer;
