import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Header from "../../components/Admin/common/Header";
import StatCard from "../../components/Admin/common/StatCard";
import { CreditCard, DollarSign, ShoppingCart, TrendingUp, CheckCircle, Clock } from "lucide-react";
import SalesOverviewChart from "../../components/Admin/sales/SalesOverviewChart";
import SalesByCategoryChart from "../../components/Admin/sales/SalesByCategoryChart";
import DailySalesTrend from "../../components/Admin/sales/DailySalesTrend";

const SalesPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/orders/stats`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        
        // Calculate average order value
        const avgOrderValue = data.totalRevenue / (data.completedOrders || 1);
        
        setStats({
          totalRevenue: data.totalRevenue,
          totalOrders: data.totalOrders,
          completedOrders: data.completedOrders,
          pendingOrders: data.pendingOrders,
          averageOrderValue: avgOrderValue
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Bán Hàng' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* SALES STATS */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name='Tổng doanh thu' 
            icon={DollarSign} 
            value={formatCurrency(stats.totalRevenue)} 
            color='#6366F1' 
          />
          <StatCard
            name='Giá trị đơn trung bình'
            icon={ShoppingCart}
            value={formatCurrency(stats.averageOrderValue)}
            color='#10B981'
          />
          <StatCard
            name='Đơn hoàn thành'
            icon={CheckCircle}
            value={`${stats.completedOrders}/${stats.totalOrders}`}
            color='#F59E0B'
          />
          <StatCard 
            name='Đơn đang chờ' 
            icon={Clock} 
            value={stats.pendingOrders.toString()} 
            color='#EF4444' 
          />
        </motion.div>

        <SalesOverviewChart />

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          <SalesByCategoryChart />
          <DailySalesTrend />
        </div>
      </main>
    </div>
  );
};

export default SalesPage;