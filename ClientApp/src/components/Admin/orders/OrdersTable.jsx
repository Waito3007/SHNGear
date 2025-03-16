import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Edit } from "lucide-react";
import axios from "axios";

const OrdersTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get("https://localhost:7107/api/orders");
                const ordersWithCustomerNames = await Promise.all(
                    response.data.map(async (order) => {
                        if (order.userId) {
                            try {
                                const userResponse = await axios.get(`https://localhost:7107/api/users/${order.userId}`);
                                order.customer = userResponse.data.fullName;
                            } catch (error) {
                                console.error(`Lỗi khi lấy dữ liệu người dùng với ID ${order.userId}:`, error);
                                order.customer = "Unknown";
                            }
                        } else {
                            order.customer = order.guestAddress || "Guest";
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
                <h2 className="text-xl font-semibold text-gray-100">Order List</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search orders..."
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
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Order Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide divide-gray-700">
                        {currentOrders.map((order) => (
                            <motion.tr
                                key={order.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                    {order.id}
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
                                    >
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <button className="text-indigo-400 hover:text-indigo-300 mr-2">
                                        <Eye size={18} />
                                    </button>
                                    <button className="text-yellow-400 hover:text-yellow-300">
                                        <Edit size={18} />
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
        </motion.div>
    );
};

export default OrdersTable;