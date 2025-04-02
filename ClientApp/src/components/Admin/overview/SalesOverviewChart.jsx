import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatCurrency } from "../../../utils/formatCurrency";

const SalesOverviewChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/revenue-year`);
        const data = await response.json();
        
        // Chuyển đổi dữ liệu từ API sang định dạng phù hợp
        const processedData = data.map(item => ({
          name: new Date(item.date).toLocaleString('default', { month: 'short' }),
          sales: item.revenue,
          fullDate: item.date,
          year: item.year
        })).sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
        
        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchSalesData();
  }, []);

  const formatCurrency = (value) => {
  if (value >= 1_000_000) {
    const millions = Math.floor(value / 1_000_000); // Lấy phần triệu
    const remainder = Math.floor((value % 1_000_000) / 100_000); // Lấy phần trăm ngàn (sau dấu phẩy)

    return remainder > 0 ? `${millions}tr${remainder}` : `${millions}tr`;
  } 
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`; // Hiển thị nghìn
  }
  return value.toLocaleString('vi-VN'); // Hiển thị số bình thường
};


  return (
    <motion.div
      className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className='text-lg font-medium mb-4 text-gray-100'>Sales Overview</h2>

      <div className='h-80'>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#4B5563' opacity={0.5} />
              <XAxis 
                dataKey="name"
                stroke='#9ca3af'
                tick={{ fill: '#E5E7EB' }}
              />
              <YAxis 
  stroke='#9ca3af'
  tick={{ fill: '#E5E7EB' }}
  tickFormatter={(value) => formatCurrency(value)}
  width={80}
/>
<Tooltip
  contentStyle={{
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    borderColor: "#4B5563",
    borderRadius: "0.5rem",
  }}
  itemStyle={{ color: "#E5E7EB" }}
  formatter={(value) => [formatCurrency(value), 'Revenue']}
  labelFormatter={(label) => {
    const monthData = chartData.find(item => item.name === label);
    return monthData ? `${label} ${monthData.year}` : label;
  }}
/>

              <Line
                type="monotone"
                dataKey="sales"
                stroke='#6366F1'
                strokeWidth={2}
                dot={{ fill: "#6366F1", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No sales data available
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SalesOverviewChart;