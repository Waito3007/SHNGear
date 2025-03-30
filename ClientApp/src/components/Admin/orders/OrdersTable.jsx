import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Edit, Trash2, Filter, X } from "lucide-react";
import axios from "axios";
import { Modal, Box, Typography, Button, Select, MenuItem } from "@mui/material";
import OrderDetailDrawer from './OrderDetailDrawer';
const OrdersTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const ordersPerPage = 5;
    //state edit 
    
    //state cho drawer OrderDetail
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
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
        // hàm mở drawer Detail
        const handleViewOrder = (orderId) => {
        setSelectedOrderId(orderId);
        setDrawerOpen(true);
        };
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        applyFilters(term, statusFilter, startDate, endDate, minAmount, maxAmount);
    };

    const handleStatusFilter = (e) => {
        const status = e.target.value;
        setStatusFilter(status);
        applyFilters(searchTerm, status, startDate, endDate, minAmount, maxAmount);
    };

    const applyFilters = (term, status, startDate, endDate, minAmount, maxAmount) => {
        let filtered = [...orders];

        // Lọc theo từ khóa tìm kiếm
        if (term) {
            filtered = filtered.filter(
                (order) =>
                    order.id.toString().toLowerCase().includes(term) ||
                    order.customer.toLowerCase().includes(term)
            );
        }

        // Lọc theo trạng thái
        if (status !== "All") {
            filtered = filtered.filter((order) => order.orderStatus === status);
        }

        // Lọc theo khoảng ngày
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.orderDate);
                return orderDate >= start && orderDate <= end;
            });
        }

        // Lọc theo khoảng giá
        if (minAmount || maxAmount) {
            const min = minAmount ? parseFloat(minAmount) : 0;
            const max = maxAmount ? parseFloat(maxAmount) : Infinity;
            filtered = filtered.filter(order => {
                const amount = order.totalAmount || 0;
                return amount >= min && amount <= max;
            });
        }

        setFilteredOrders(filtered);
        setCurrentPage(1); // Reset về trang đầu tiên khi áp dụng bộ lọc mới
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

    const handleDateFilter = () => {
        applyFilters(searchTerm, statusFilter, startDate, endDate, minAmount, maxAmount);
    };

    const handleTodayOrders = () => {
        const today = new Date().toISOString().split("T")[0];
        const filtered = orders.filter((order) => {
            const orderDate = new Date(order.orderDate).toISOString().split("T")[0];
            return orderDate === today;
        });
        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("All");
        setStartDate("");
        setEndDate("");
        setMinAmount("");
        setMaxAmount("");
        setFilteredOrders(orders);
        setCurrentPage(1);
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
                <div className="flex items-center space-x-4">
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
                    <button
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${showAdvancedFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                        <Filter size={18} />
                        <span>Bộ lọc</span>
                    </button>
                </div>
            </div>

            {showAdvancedFilters && (
                <motion.div
                    className="bg-gray-700 p-4 rounded-lg mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-300">Bộ lọc nâng cao</h3>
                        <button
                            className="text-gray-400 hover:text-white"
                            onClick={() => setShowAdvancedFilters(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Trạng thái</label>
                            <select
                                className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter}
                                onChange={handleStatusFilter}
                            >
                                <option value="All">Tất cả trạng thái</option>
                                <option value="Pending">Chờ xác nhận</option>
                                <option value="Processing">Đã xác nhận</option>
                                <option value="Shipped">Đang vận chuyển</option>
                                <option value="Delivered">Đã xong</option>
                                <option value="Cancelled">Đã hủy</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Từ ngày</label>
                            <input
                                type="date"
                                className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Đến ngày</label>
                            <input
                                type="date"
                                className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Khoảng giá</label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Từ"
                                    className="w-1/2 bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Đến"
                                    className="w-1/2 bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                            onClick={handleDateFilter}
                        >
                            Áp dụng bộ lọc
                        </button>
                        <button
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                            onClick={handleTodayOrders}
                        >
                            Đơn hôm nay
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                            onClick={handleResetFilters}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300">
                                STT
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300">
                                Khách Hàng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300">
                                Tổng tiền
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300">
                                Ngày đặt
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Tùy Chỉnh
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide divide-gray-700">
                        {currentOrders.length > 0 ? (
                            currentOrders.map((order, index) => (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="hover:bg-gray-700"
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
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                                                order.orderStatus === "Delivered"
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : order.orderStatus === "Processing"
                                                    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                                    : order.orderStatus === "Shipped"
                                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                    : "bg-red-100 text-red-800 hover:bg-red-200"
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
                                        <button 
                                            className="text-indigo-400 hover:text-indigo-300 mr-2"
                                            onClick={() => handleViewOrder(order.id)}
                                            >
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-400">
                                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-400">
                    Hiển thị {indexOfFirstOrder + 1} đến {Math.min(indexOfLastOrder, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hàng
                </div>
                <div className="flex space-x-2">
                    <button
                        className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`px-4 py-2 rounded-lg ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Sau
                    </button>
                </div>
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
            <OrderDetailDrawer 
            orderId={selectedOrderId}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            />
        </motion.div>
    );
};

export default OrdersTable;