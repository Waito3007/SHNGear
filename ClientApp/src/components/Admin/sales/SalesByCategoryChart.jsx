import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

const SalesByCategoryChart = () => {
    const [salesByCategory, setSalesByCategory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders/sales-by-category`);
                console.log("Sales by category response:", response.data);
                
                // Chuyển đổi dữ liệu để phù hợp với PieChart
                const chartData = response.data.data.map(item => ({
                    name: item.categoryName,
                    value: item.totalSales,
                    orders: item.totalOrders,
                    quantity: item.totalQuantity
                }));
                
                setSalesByCategory(chartData);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error("Error fetching sales data:", err);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <motion.div
                className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className='text-lg font-medium mb-4 text-gray-100'>Doanh số theo danh mục</h2>
                <div className='flex justify-center items-center' style={{ height: 300 }}>
                    <div className='text-gray-300'>Đang tải...</div>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className='text-lg font-medium mb-4 text-gray-100'>Doanh số theo danh mục</h2>
                <div className='flex justify-center items-center' style={{ height: 300 }}>
                    <div className='text-red-400'>Lỗi: {error}</div>
                </div>
            </motion.div>
        );
    }

    if (!salesByCategory || salesByCategory.length === 0) {
        return (
            <motion.div
                className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className='text-lg font-medium mb-4 text-gray-100'>Doanh số theo danh mục</h2>
                <div className='flex justify-center items-center' style={{ height: 300 }}>
                    <div className='text-gray-300'>Không có dữ liệu</div>
                </div>
            </motion.div>
        );
    }

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Tỉ lệ đơn hàng theo danh mục</h2>

            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={salesByCategory}
                            cx='50%'
                            cy='50%'
                            outerRadius={80}
                            fill='#8884d8'
                            dataKey='value'
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {salesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name, props) => [
                                `${Number(value).toLocaleString()} VNĐ`,
                                "Doanh số",
                                `Đơn hàng: ${props.payload?.orders || 0}`,
                                `Số lượng: ${props.payload?.quantity || 0}`
                            ]}
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                                borderRadius: "0.5rem",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default SalesByCategoryChart;