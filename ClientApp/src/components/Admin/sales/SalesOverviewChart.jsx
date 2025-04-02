import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";

const SalesOverviewChart = () => {
    const [selectedTimeRange, setSelectedTimeRange] = useState("month");
    const [chartData, setChartData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [xAxisKey, setXAxisKey] = useState("day");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSalesData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/orders/dashboard/sales-overview`,
                    { params: { range: selectedTimeRange } }
                );
                console.log("Response Data:", response.data);
                if (!response.data || !response.data.data) { // Sửa thành response.data.data
                    throw new Error("Dữ liệu API không đúng định dạng");
                }
                const { data, xAxisKey, summary } = response.data; // Sửa destructuring
                setChartData(data || []);
                setXAxisKey(xAxisKey || "day");
                setSummary(summary || null);
            } catch (error) {
                setError("Không thể tải dữ liệu doanh thu: " + error.message);
                console.error("Error fetching sales data:", error);
                setChartData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSalesData();
    }, [selectedTimeRange]);

    const formatCurrency = (value) => {
  if (value >= 1000000) {
    // Chia số tiền cho triệu
    const millions = Math.floor(value / 1000000);  // Lấy phần nguyên (triệu)
    const remainder = Math.floor((value % 1000000) / 100000);  // Lấy phần thập phân, làm tròn đến 100 ngàn

    // Nếu có phần thập phân
    if (remainder > 0) {
      return `${millions}tr${remainder}`;
    } else {
      return `${millions}tr`;  // Nếu không có phần thập phân, chỉ hiển thị triệu
    }
  } else if (value >= 1000) {
    // Chuyển thành nghìn (k) nếu cần
    return `${(value / 1000).toFixed(0)}k`;
  } else {
    return value.toLocaleString('vi-VN');  // Nếu không phải triệu hoặc nghìn, giữ nguyên
  }
};

    const getTitle = () => {
        switch (selectedTimeRange) {
            case "week": return "Tổng Quan Doanh Thu Tuần";
            case "month": return "Tổng Quan Doanh Thu Tháng";
            case "year": return "Tổng Quan Doanh Thu Năm";
            default: return "Tổng Quan Doanh Thu";
        }
    };

    const getXAxisLabel = () => {
        return xAxisKey === "month" ? "Tháng" : "Ngày";
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>{getTitle()}</h2>
                <select
                    className='bg-gray-700 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    disabled={isLoading}
                >
                    <option value="week">Tuần Này</option>
                    <option value="month">Tháng Này</option>
                    <option value="year">Năm Này</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-80">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center h-80 flex items-center justify-center">
                    {error}
                </div>
            ) : (
                <>
                    {console.log("Chart Data:", chartData)}
                    <div className='w-full h-80'>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
    <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
    <XAxis 
        dataKey="shortPeriod"
        stroke='#9CA3AF'
        label={{ value: getXAxisLabel(), position: 'insideBottom', offset: -5 }}
    />
    <YAxis 
        stroke='#9CA3AF'
        tickFormatter={(value) => formatCurrency(value)}  // Sử dụng hàm định dạng tiền
        label={{ value: 'Doanh thu (VND)', angle: -90, position: 'insideLeft' }}
    />
    <Tooltip
        contentStyle={{ backgroundColor: "rgba(31, 41, 55, 0.8)", borderColor: "#4B5563" }}
        itemStyle={{ color: "#E5E7EB" }}
        formatter={(value, name) => [formatCurrency(value), "Doanh thu"]}
        labelFormatter={(label) => chartData.find(d => d.shortPeriod === label)?.formattedPeriod || label}
    />
    <Bar 
        dataKey='sales'
        fill='#8B5CF6'
        name="Doanh thu"
    />
</BarChart>
                        </ResponsiveContainer>
                    </div>

                    {summary && (
                        <div className='mt-4 text-gray-100 grid grid-cols-1 md:grid-cols-2 gap-2'>
                            <p>Tổng doanh thu: {formatCurrency(summary.totalSales)}</p>
                            {summary.averageDailySales && (
                                <p>Doanh thu trung bình ngày: {formatCurrency(summary.averageDailySales)}</p>
                            )}
                            {summary.averageMonthlySales && (
                                <p>Doanh thu trung bình tháng: {formatCurrency(summary.averageMonthlySales)}</p>
                            )}
                            {summary.bestMonth && <p>Tháng tốt nhất: {summary.bestMonth}</p>}
                            {summary.worstMonth && <p>Tháng thấp nhất: {summary.worstMonth}</p>}
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default SalesOverviewChart;