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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7); // Mặc định 7 ngày

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/orders/dashboard/sales-overview?range=${days}`
        );
        setDailySalesData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching daily sales data:", err);
      }
    };

    fetchData();
  }, [days]);

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
          Doanh số hàng ngày
        </h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-gray-700 text-white rounded px-3 py-1"
        >
          <option value={7}>7 ngày gần đây</option>
          <option value={14}>14 ngày gần đây</option>
          <option value={30}>30 ngày gần đây</option>
        </select>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              tickFormatter={(value, index) => {
                // Hiển thị cả ngày và tháng cho khoảng thời gian dài
                if (days > 7) return dailySalesData[index]?.fullDate || value;
                return value;
              }}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              formatter={(value) => [
                `${Number(value).toLocaleString()} VNĐ`,
                "Sales",
              ]}
              labelFormatter={(label) => {
                const fullDate = dailySalesData.find(
                  (d) => d.name === label
                )?.fullDate;
                return fullDate ? `${label}, ${fullDate}` : label;
              }}
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
                borderRadius: "0.5rem",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
            <Bar
              dataKey="sales"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              animationDuration={2000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default DailySalesTrend;
