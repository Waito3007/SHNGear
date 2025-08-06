import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Edit, Trash2, Filter, X } from "lucide-react";
import axios from "axios";
import { Modal, Box, Typography, Button, Select, MenuItem } from "@mui/material";
import OrderDetailDrawer from './OrderDetailDrawer';
import EditOrder from './EditOrder'; 
import useDebounce from 'utils/useDebounce'; // Giả sử bạn đã tạo hook này
import { getDateNDaysAgo, getToday } from 'utils/FormatInfo'; // Giả sử bạn đã tạo các hàm này

const OrdersTable = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [orderToEdit, setOrderToEdit] = useState(null);

    // States cho việc tìm kiếm và lọc
    const [searchInput, setSearchInput] = useState(""); // Giá trị input tức thời
    const debouncedSearchTerm = useDebounce(searchInput, 500); // Giá trị đã debounce
    const [statusFilter, setStatusFilter] = useState("All");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");

    const ordersPerPage = 5;

    // Hàm tiện ích (không đổi, có thể đặt ngoài component nếu không phụ thuộc state/props)
    const getAllowedStatuses = useCallback((currentStatus) => {
        switch (currentStatus) {
            case "Pending": return ["Processing", "Cancelled"];
            case "Processing": return ["Shipped", "Cancelled"];
            case "Shipped": return ["Delivered"];
            case "WaitingForPayment": return ["Paid", "Cancelled"];
            case "Paid": return ["ShippedPayment"];
            case "ShippedPayment": return ["Delivered"];
            default: return [];
        }
    }, []);

    const getStatusDisplayName = useCallback((status) => {
        switch (status) {
            case "Pending": return "Chờ xác nhận";
            case "Processing": return "Đã xác nhận";
            case "Shipped": return "Đang vận chuyển";
            case "Delivered": return "Đã xong";
            case "Cancelled": return "Đã hủy";
            case "WaitingForPayment": return "Chờ thanh toán";
            case "Paid": return "Đã thanh toán";
            case "ShippedPayment": return "Đang vận chuyển (đã thanh toán)";
            default: return status;
        }
    }, []);

    // Fetch dữ liệu ban đầu
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders`);
                const ordersWithCustomerNames = await Promise.all(
                    response.data.map(async (order) => {
                        try {
                            const addressResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/address/${order.addressId}`);
                            order.customer = addressResponse.data.fullName;
                        } catch (error) {
                            console.error(`Lỗi khi lấy dữ liệu địa chỉ với ID ${order.addressId}:`, error);
                            order.customer = "Unknown";
                        }
                        return order;
                    })
                );
                setOrders(ordersWithCustomerNames);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu đơn hàng:", error);
            }
        };
        fetchOrders();
    }, []); // Chỉ chạy một lần khi mount

    const handleOpenEditDrawer = useCallback((order) => {
        // console.log("Opening edit drawer for order:", order);
        setOrderToEdit(order); // Lưu đơn hàng cần sửa
        setIsEditDrawerOpen(true); // Mở drawer
    }, []);

    const handleCloseEditDrawer = useCallback(() => {
        setIsEditDrawerOpen(false);
        setOrderToEdit(null); // Xóa đơn hàng đang sửa khi đóng drawer
    }, []);
    const handleOrderUpdated = useCallback((updatedOrder) => {
        // Cập nhật lại danh sách 'orders' với thông tin đơn hàng mới
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
            )
        );
        // filteredOrders sẽ tự động cập nhật nhờ useMemo
        // EditOrder sẽ tự gọi onClose của nó (chính là handleCloseEditDrawer) sau khi cập nhật thành công
        // nên không cần gọi setIsEditDrawerOpen(false) ở đây nữa.
        alert("Đơn hàng đã được cập nhật thành công trong bảng!"); // Optional: thông báo ở OrdersTable
    }, [setOrders]); // setOrders là stable
    // Sử dụng useMemo để tính toán danh sách đơn hàng đã lọc
    const filteredOrders = useMemo(() => {
        let filtered = [...orders];
        const term = debouncedSearchTerm.toLowerCase();

        if (term) {
            filtered = filtered.filter(
                (order) =>
                    order.id.toString().toLowerCase().includes(term) ||
                    order.customer.toLowerCase().includes(term)
            );
        }
        if (statusFilter !== "All") {
            filtered = filtered.filter((order) => order.orderStatus === statusFilter);
        }
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Để bao gồm cả ngày kết thúc
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.orderDate);
                return orderDate >= start && orderDate <= end;
            });
        }
        if (minAmount || maxAmount) {
            const min = minAmount ? parseFloat(minAmount) : 0;
            const max = maxAmount ? parseFloat(maxAmount) : Infinity;
            filtered = filtered.filter(order => {
                const amount = order.totalAmount || 0;
                return amount >= min && amount <= max;
            });
        }
        return filtered;
    }, [orders, debouncedSearchTerm, statusFilter, startDate, endDate, minAmount, maxAmount]);

    // Reset về trang đầu tiên khi bộ lọc thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, statusFilter, startDate, endDate, minAmount, maxAmount]);


    const currentOrders = useMemo(() => {
        const indexOfLastOrder = currentPage * ordersPerPage;
        const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
        return filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    }, [filteredOrders, currentPage, ordersPerPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredOrders.length / ordersPerPage);
    }, [filteredOrders.length, ordersPerPage]);

    // Callbacks được memoize với useCallback
    const handleSearchChange = useCallback((e) => {
        setSearchInput(e.target.value);
    }, []);

    const handleStatusFilterChange = useCallback((e) => {
        setStatusFilter(e.target.value);
    }, []);
    
    const handleStartDateChange = useCallback((e) => {
        setStartDate(e.target.value);
    }, []);

    const handleEndDateChange = useCallback((e) => {
        setEndDate(e.target.value);
    }, []);

    const handleMinAmountChange = useCallback((e) => {
        setMinAmount(e.target.value);
    }, []);

    const handleMaxAmountChange = useCallback((e) => {
        setMaxAmount(e.target.value);
    }, []);
    
    // Nút "Áp dụng bộ lọc" không còn thực sự cần thiết nếu các filter áp dụng ngay,
    // nhưng nếu muốn giữ lại để áp dụng đồng thời các filter ngày/giá thì có thể dùng.
    // Hiện tại, logic filter đã được useMemo xử lý khi state thay đổi.
    // Tôi sẽ để lại hàm handleDateFilter trống hoặc bạn có thể bỏ nút này.
    // const handleApplyAdvancedFilters = useCallback(() => {
    //     // Các state đã được cập nhật, useMemo sẽ tự tính toán lại filteredOrders
    //     // Chỉ cần reset lại trang nếu cần
    //     setCurrentPage(1);
    //     console.log("Applying advanced filters (filters already applied by state changes)");
    // }, []);


    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    const handleDeleteOrder = useCallback(async (orderId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`);
                setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
                // filteredOrders sẽ tự cập nhật nhờ useMemo
                alert("Đơn hàng đã được xóa thành công!");
            } catch (error) {
                console.error("Lỗi khi xóa đơn hàng:", error);
                alert("Lỗi khi xóa đơn hàng, vui lòng thử lại.");
            }
        }
    }, []);

    const handleOpenModal = useCallback((order) => {
        setSelectedOrder(order);
        setNewStatus(order.orderStatus); // Khởi tạo newStatus bằng trạng thái hiện tại
        setOpenModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setOpenModal(false);
        setSelectedOrder(null);
    }, []);

    const handleUpdateStatus = useCallback(async () => {
        if (selectedOrder && newStatus && newStatus !== selectedOrder.orderStatus) {
            try {
                await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${selectedOrder.id}/status`, { newStatus });
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === selectedOrder.id ? { ...order, orderStatus: newStatus } : order
                    )
                );
                alert("Trạng thái đơn hàng đã được cập nhật thành công!");
                handleCloseModal();
            } catch (error) {
                console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
                alert("Lỗi khi cập nhật trạng thái đơn hàng, vui lòng thử lại.");
            }
        }
    }, [selectedOrder, newStatus, handleCloseModal]);


    // === BỔ SUNG HÀM XỬ LÝ CHO CÁC BỘ LỌC NGÀY MỚI ===
    const handleSetDateRangeAndResetFilters = useCallback((startDateStr, endDateStr) => {
        setStartDate(startDateStr);
        setEndDate(endDateStr);
        setSearchInput(""); // Reset các filter khác để ưu tiên filter ngày
        setStatusFilter("All");
        setMinAmount("");
        setMaxAmount("");
        // setCurrentPage(1) sẽ được xử lý bởi useEffect đã có
    }, [setStartDate, setEndDate, setSearchInput, setStatusFilter, setMinAmount, setMaxAmount]);


    const handleTodayOrders = useCallback(() => {
        const todayStr = getToday();
        handleSetDateRangeAndResetFilters(todayStr, todayStr);
    }, [handleSetDateRangeAndResetFilters]);

    const handleLast3DaysOrders = useCallback(() => {
        const todayStr = getToday();
        const threeDaysAgoStr = getDateNDaysAgo(2); // Bao gồm hôm nay, nên là (hôm nay - 2 ngày) đến hôm nay
        handleSetDateRangeAndResetFilters(threeDaysAgoStr, todayStr);
    }, [handleSetDateRangeAndResetFilters]);

    const handleLast7DaysOrders = useCallback(() => {
        const todayStr = getToday();
        const sevenDaysAgoStr = getDateNDaysAgo(6); // Bao gồm hôm nay, nên là (hôm nay - 6 ngày) đến hôm nay
        handleSetDateRangeAndResetFilters(sevenDaysAgoStr, todayStr);
    }, [handleSetDateRangeAndResetFilters])


    const handleResetFilters = useCallback(() => {
        setSearchInput("");
        setStatusFilter("All");
        setStartDate("");
        setEndDate("");
        setMinAmount("");
        setMaxAmount("");
        // filteredOrders sẽ tự cập nhật
    }, []);

    const handleViewOrder = useCallback((orderId) => {
        setSelectedOrderId(orderId);
        setDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setDrawerOpen(false);
        setSelectedOrderId(null); // Reset selectedOrderId khi đóng drawer
    }, []);


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
                            placeholder="Tìm đơn hàng (ID, Khách hàng)..."
                            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchInput}
                            onChange={handleSearchChange}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    <button
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${showAdvancedFilters ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
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
                                onChange={handleStatusFilterChange}
                            >
                                <option value="All">Tất cả trạng thái</option>
                                <option value="Pending">{getStatusDisplayName("Pending")}</option>
                                <option value="Processing">{getStatusDisplayName("Processing")}</option>
                                <option value="Shipped">{getStatusDisplayName("Shipped")}</option>
                                <option value="Delivered">{getStatusDisplayName("Delivered")}</option>
                                <option value="Cancelled">{getStatusDisplayName("Cancelled")}</option>
                                <option value="WaitingForPayment">{getStatusDisplayName("WaitingForPayment")}</option>
                                <option value="Paid">{getStatusDisplayName("Paid")}</option>
                                <option value="ShippedPayment">{getStatusDisplayName("ShippedPayment")}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Từ ngày</label>
                            <input
                                type="date"
                                className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={startDate}
                                onChange={handleStartDateChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Đến ngày</label>
                            <input
                                type="date"
                                className="w-full bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={endDate}
                                onChange={handleEndDateChange}
                                min={startDate} // Ngăn chọn ngày kết thúc trước ngày bắt đầu
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
                                    onChange={handleMinAmountChange}
                                />
                                <input
                                    type="number"
                                    placeholder="Đến"
                                    className="w-1/2 bg-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={maxAmount}
                                    onChange={handleMaxAmountChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        {/* Nút này có thể không cần thiết nếu filter đã tự áp dụng */}
                        {/* <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                            onClick={handleApplyAdvancedFilters} 
                        >
                            Áp dụng bộ lọc
                        </button> */}
                    
                        <button
                            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm"
                            onClick={handleTodayOrders}
                        >
                            Đơn hôm nay
                        </button>
                        <button
                            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm"
                            onClick={handleLast3DaysOrders}
                        >
                            3 ngày qua
                        </button>
                        <button
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
                            onClick={handleLast7DaysOrders}
                        >
                            7 ngày qua
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

            <div className="overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">STT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Khách Hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ngày đặt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tùy Chỉnh</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {currentOrders.length > 0 ? (
                            currentOrders.map((order, index) => (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="hover:bg-gray-700"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                        { (currentPage - 1) * ordersPerPage + index + 1}
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
                                                order.orderStatus === "Delivered" || order.orderStatus === "Paid"
                                                ? "bg-green-200 text-green-800 hover:bg-green-300"
                                                : order.orderStatus === "Processing"
                                                ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                                                : order.orderStatus === "Shipped" || order.orderStatus === "ShippedPayment"
                                                ? "bg-blue-200 text-blue-800 hover:bg-blue-300"
                                                : order.orderStatus === "Pending" || order.orderStatus === "WaitingForPayment"
                                                ? "bg-orange-200 text-orange-800 hover:bg-orange-300"
                                                : "bg-red-200 text-red-800 hover:bg-red-300" // Cancelled
                                            }`}
                                            onClick={() => handleOpenModal(order)}
                                        >
                                            {getStatusDisplayName(order.orderStatus)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <button 
                                            className="text-indigo-400 hover:text-indigo-300 mr-3 p-1 rounded hover:bg-gray-600"
                                            title="Xem chi tiết"
                                            onClick={() => handleViewOrder(order.id)}
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            className="text-yellow-400 hover:text-yellow-300 mr-3 p-1 rounded hover:bg-gray-600"
                                            title="Sửa đơn hàng"
                                            onClick={() => handleOpenEditDrawer(order)} // Gọi hàm mở drawer sửa
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-600"
                                            title="Xóa đơn hàng"
                                            onClick={() => handleDeleteOrder(order.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-400">
                                    Không tìm thấy đơn hàng nào phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredOrders.length > ordersPerPage && (
                 <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-400">
                        Hiển thị { (currentPage - 1) * ordersPerPage + 1} đến {Math.min(currentPage * ordersPerPage, filteredOrders.length)} trong tổng số {filteredOrders.length} đơn hàng
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className={`px-3 py-1 rounded-lg text-sm ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Trước
                        </button>
                        {/* Logic render các nút số trang có thể phức tạp hơn nếu có nhiều trang */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`px-3 py-1 rounded-lg text-sm ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className={`px-3 py-1 rounded-lg text-sm ${currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
           

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', width: 400,
                        bgcolor: 'rgba(31, 41, 55, 0.95)', // bg-gray-800 with opacity
                        backdropFilter: 'blur(5px)',
                        border: '1px solid #4B5563', // border-gray-600
                        boxShadow: 24, p: 4, borderRadius: '8px', color: '#F3F4F6' // text-gray-100
                    }}
                >
                    <Typography variant="h6" component="h2" sx={{ color: '#D1D5DB' /* text-gray-300 */ }}>
                        Cập nhật trạng thái đơn hàng #{selectedOrder?.id}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, mb: 2, color: '#9CA3AF' /* text-gray-400 */ }}>
                        Trạng thái hiện tại: <strong style={{ color: '#F3F4F6' }}>{getStatusDisplayName(selectedOrder?.orderStatus)}</strong>
                    </Typography>
                    <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        fullWidth
                        sx={{ 
                            mt: 2, 
                            bgcolor: '#4B5563', // bg-gray-600
                            color: 'white',
                            '& .MuiSvgIcon-root': { color: 'white' },
                            '&:hover': { bgcolor: '#374151' /* bg-gray-700 */ },
                            '.MuiOutlinedInput-notchedOutline': { borderColor: '#6B7280' /* border-gray-500 */ },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6' /* ring-blue-500 */ },
                         }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    bgcolor: '#374151', // bg-gray-700 for dropdown
                                    color: 'white',
                                },
                            },
                        }}
                    >
                        {selectedOrder && getAllowedStatuses(selectedOrder.orderStatus).length > 0 ? (
                             getAllowedStatuses(selectedOrder.orderStatus).map(status => (
                                <MenuItem key={status} value={status} sx={{ '&:hover': { bgcolor: '#4B5563'} }}>
                                    {getStatusDisplayName(status)}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled sx={{ '&:hover': { bgcolor: '#4B5563'} }}>Không có trạng thái để chuyển</MenuItem>
                        )}
                    </Select>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateStatus}
                        sx={{ 
                            mt: 3, 
                            bgcolor: '#3B82F6', /* bg-blue-500 */
                            '&:hover': { bgcolor: '#2563EB' /* hover:bg-blue-600 */},
                            '&.Mui-disabled': { bgcolor: '#4B5563', color: '#9CA3AF' }
                        }}
                        disabled={!newStatus || newStatus === selectedOrder?.orderStatus || getAllowedStatuses(selectedOrder?.orderStatus || "").length === 0}
                    >
                        Cập nhật
                    </Button>
                </Box>
            </Modal>
            
            <OrderDetailDrawer 
                orderId={selectedOrderId}
                open={drawerOpen}
                onClose={handleCloseDrawer}
            />

<EditOrder
                    open={isEditDrawerOpen}
                    onClose={handleCloseEditDrawer}
                    order={orderToEdit} // Truyền đơn hàng cần sửa
                    onOrderUpdated={handleOrderUpdated} // Truyền callback để cập nhật lại bảng
                />
        </motion.div>
    );
};

export default OrdersTable;