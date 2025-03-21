import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { Modal, Box, Typography, Button, Select, MenuItem } from "@mui/material";

const OrdersTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const ordersPerPage = 5;

    const getOrderStatusLabel = (status) => {
        switch (status) {
            case "Delivered":
                return "Đã giao hàng";
            case "Processing":
                return "Đang xử lý";
            case "Shipped":
                return "Đang vận chuyển";
            case "Cancelled":
                return "Đã hủy";
            default:
                return "Chờ xác nhận";
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get("https://localhost:7107/api/orders");
                const ordersWithCustomerNames = await Promise.all(
                    response.data.map(async (order) => {
                        try {
                            const addressResponse = await axios.get(`https://localhost:7107/api/address/${order.addressId}`);
                            order.customer = addressResponse.data.fullName;
                        } catch (error) {
                            console.error(`Lỗi khi lấy dữ liệu địa chỉ với ID ${order.addressId}:`, error);
                            order.customer = "Unknown";
                        }
                        return order;
                    })
                );
                setOrders(ordersWithCustomerNames);
                setFilteredOrders(ordersWithCustomerNames);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
            }
        };
        fetchOrders();
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        filterOrders(term, statusFilter);
    };

    const handleStatusFilter = (e) => {
        const status = e.target.value;
        setStatusFilter(status);
        filterOrders(searchTerm, status);
    };

    const filterOrders = (term, status) => {
        let filtered = orders.filter(
            (order) =>
                order.id.toString().toLowerCase().includes(term) ||
                order.customer.toLowerCase().includes(term)
        );
        if (status !== "All") {
            filtered = filtered.filter((order) => order.orderStatus === status);
        }
        setFilteredOrders(filtered);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
            try {
                await axios.delete(`https://localhost:7107/api/orders/${orderId}`);
                setOrders(orders.filter(order => order.id !== orderId));
                setFilteredOrders(filteredOrders.filter(order => order.id !== orderId));
                alert("Đơn hàng đã được xóa thành công!");
            } catch (error) {
                console.error("Lỗi khi xóa đơn hàng:", error);
                alert("Lỗi khi xóa đơn hàng, vui lòng thử lại.");
            }
        }
    };

    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.orderStatus);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedOrder(null);
    };

    const handleUpdateStatus = async () => {
        if (selectedOrder) {
            try {
                console.log(`Updating status for order ID: ${selectedOrder.id} to ${newStatus}`);
                const response = await axios.put(`https://localhost:7107/api/orders/${selectedOrder.id}/status`, { newStatus });
                console.log("Update response:", response.data);
                setOrders(orders.map(order => order.id === selectedOrder.id ? { ...order, orderStatus: newStatus } : order));
                setFilteredOrders(filteredOrders.map(order => order.id === selectedOrder.id ? { ...order, orderStatus: newStatus } : order));
                alert("Trạng thái đơn hàng đã được cập nhật thành công!");
                handleCloseModal();
            } catch (error) {
                console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
                console.error("Chi tiết lỗi:", error.response?.data);
                alert("Lỗi khi cập nhật trạng thái đơn hàng, vui lòng thử lại.");
            }
        }
    };

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Danh sách đơn hàng</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm đơn hàng..."
                        className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                <div className="relative">
                    <select
                        className="bg-gray-700 text-white rounded-lg pl-3 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={handleStatusFilter}
                    >
                        <option value="All">Tất cả</option>
                        <option value="Pending">Chờ xác nhận</option>
                        <option value="Processing">Đã xác nhận</option>
                        <option value="Shipped">Đang vận chuyển</option>
                        <option value="Delivered">Đã xong</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                STT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Khách Hàng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Tổng tiền
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Ngày đặt
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Tùy Chỉnh
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide divide-gray-700">
                        {currentOrders.map((order, index) => (
                            <motion.tr
                                key={order.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                    {indexOfFirstOrder + index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                    {order.customer}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                    {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            order.orderStatus === "Delivered"
                                                ? "bg-green-100 text-green-800"
                                                : order.orderStatus === "Processing"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : order.orderStatus === "Shipped"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                        onClick={() => handleOpenModal(order)}
                                    >
                                        {getOrderStatusLabel(order.orderStatus)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <button className="text-indigo-400 hover:text-indigo-300 mr-2">
                                        <Eye size={18} />
                                    </button>
                                    <button className="text-yellow-400 hover:text-yellow-300 mr-2">
                                        <Edit size={18} />
                                    </button>
                                    <button className="text-red-400 hover:text-red-300" onClick={() => handleDeleteOrder(order.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <button
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Previous
                </button>
                <span className="text-gray-400">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Next
                </button>
            </div>

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography variant="h6" component="h2">
                        Cập nhật trạng thái đơn hàng
                    </Typography>
                    <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        <MenuItem value="Pending">Chờ xác nhận</MenuItem>
                        <MenuItem value="Processing">Đã xác nhận</MenuItem>
                        <MenuItem value="Shipped">Đang vận chuyển</MenuItem>
                        <MenuItem value="Delivered">Đã xong</MenuItem>
                        <MenuItem value="Cancelled">Đã hủy</MenuItem>
                    </Select>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateStatus}
                        sx={{ mt: 2 }}
                    >
                        Cập nhật
                    </Button>
                </Box>
            </Modal>
        </motion.div>
    );
};

export default OrdersTable;