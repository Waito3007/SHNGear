import { useState, useEffect } from "react";
import { CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

import Header from "../../components/Admin/common/Header";
import StatCard from "../../components/Admin/common/StatCard";
import DailyOrders from "../../components/Admin/orders/DailyOrders";
import OrderDistribution from "../../components/Admin/orders/OrderDistribution";
import OrdersTable from "../../components/Admin/orders/OrdersTable";

const OrdersPage = () => {
    const [orderStats, setOrderStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
    });

    useEffect(() => {
        const fetchOrderStats = async () => {
            try {
                const [totalOrdersRes, pendingOrdersRes, completedOrdersRes, totalRevenueRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders`),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/pending-orders`),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/completed-orders`),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/total-revenue`),
                ]);

                setOrderStats({
                    totalOrders: totalOrdersRes.data.length,
                    pendingOrders: pendingOrdersRes.data.pendingOrders,
                    completedOrders: completedOrdersRes.data.completedOrders,
                    totalRevenue: totalRevenueRes.data.totalRevenue,
                });
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu thống kê đơn hàng:", error);
            }
        };

        fetchOrderStats();
    }, []);

    return (
        <div className='flex-1 relative z-10 overflow-auto'>
            <Header title={"Orders"} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Tổng đơn hàng' icon={ShoppingBag} value={orderStats.totalOrders} color='#6366F1' />
                    <StatCard name='Đơn chờ xác nhận' icon={Clock} value={orderStats.pendingOrders} color='#F59E0B' />
                    <StatCard
                        name='Đơn hàng đã hoàn thành'
                        icon={CheckCircle}
                        value={orderStats.completedOrders}
                        color='#10B981'
                    />
                    <StatCard name='Tổng tiền dự tính' icon={DollarSign} value={orderStats.totalRevenue+" VND"} color='#EF4444' />
                </motion.div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                </div>

                <OrdersTable />
            </main>
        </div>
    );
};

export default OrdersPage;