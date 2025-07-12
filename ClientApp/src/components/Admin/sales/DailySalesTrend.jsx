import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

const DailySalesTrend = () => {
  const [dailySalesData, setDailySalesData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("week"); // Đổi từ days sang range

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/orders/dashboard/sales-overview?range=${range}`
        );
        
        // API trả về {data: [], xAxisKey: "", timeRange: "", currency: "", summary: {}}
        const apiData = response.data.data || [];
        const summaryData = response.data.summary || {};
        
        // Transform data để phù hợp với chart (sử dụng đúng tên thuộc tính từ API)
        const transformedData = apiData.map(item => ({
          name: item.shortPeriod || item.formattedPeriod || item.period,
          sales: item.sales || 0,
          orderCount: item.orderCount || 0,
          fullDate: item.formattedPeriod || item.period,
          period: item.period
        }));
        
        setDailySalesData(transformedData);
        setSummary(summaryData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching daily sales data:", err);
      }
    };

    fetchData();
  }, [range]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-100">
          Doanh số theo thời gian
        </h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">7 ngày gần đây</option>
          <option value="month">30 ngày gần đây</option>
          <option value="year">12 tháng gần đây</option>
        </select>
      </div>

      {/* Summary Cards */}
      {summary && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {summary.totalSales !== undefined && (
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-gray-400">Tổng doanh số</div>
              <div className="text-xl font-bold text-green-400">
                {summary.totalSales?.toLocaleString()} VNĐ
              </div>
            </div>
          )}
          {summary.totalOrders !== undefined && (
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-gray-400">Tổng đơn hàng</div>
              <div className="text-xl font-bold text-blue-400">
                {summary.totalOrders}
              </div>
            </div>
          )}
          {summary.averageDailySales !== undefined && (
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-gray-400">Trung bình/ngày</div>
              <div className="text-xl font-bold text-yellow-400">
                {Math.round(summary.averageDailySales || 0).toLocaleString()} VNĐ
              </div>
            </div>
          )}
          {(summary.bestDay || summary.bestMonth) && (
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-gray-400">Tốt nhất</div>
              <div className="text-xl font-bold text-purple-400">
                {summary.bestDay || summary.bestMonth}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={dailySalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value, index) => {
                // Hiển thị label ngắn gọn
                return value;
              }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value;
              }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'sales') {
                  return [`${Number(value).toLocaleString()} VNĐ`, 'Doanh số'];
                } else if (name === 'orderCount') {
                  return [`${Number(value)} đơn`, 'Số đơn hàng'];
                }
                return [Number(value).toLocaleString(), name];
              }}
              labelFormatter={(label) => {
                const item = dailySalesData.find(d => d.name === label);
                return item?.fullDate || label;
              }}
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.95)",
                borderColor: "#4B5563",
                borderRadius: "0.5rem",
                border: "1px solid #4B5563"
              }}
              itemStyle={{ color: "#E5E7EB" }}
              labelStyle={{ color: "#F3F4F6" }}
            />
            <Bar
              dataKey="sales"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Info */}
      <div className="mt-4 text-sm text-gray-400 text-center">
        {dailySalesData.length > 0 ? (
          `Hiển thị ${dailySalesData.length} ${range === 'year' ? 'tháng' : 'ngày'} • 
           Tổng: ${dailySalesData.reduce((sum, item) => sum + item.sales, 0).toLocaleString()} VNĐ`
        ) : (
          "Chưa có dữ liệu"
        )}
      </div>
    </motion.div>
  );
};

export default DailySalesTrend;
