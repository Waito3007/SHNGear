import { BarChart2, ShoppingBag, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import useSWR from "swr";

import Header from "../../components/Admin/common/Header";
import StatCard from "../../components/Admin/common/StatCard";
import SalesOverviewChart from "../../components/Admin/overview/SalesOverviewChart";
import CategoryDistributionChart from "../../components/Admin/overview/CategoryDistributionChart";
import { formatCurrency } from "../../utils/formatCurrency";

const fetcher = (url) => fetch(url).then(res => res.json());

const OverviewPage = () => {
  // Fetch data từ API
  const { data: statsData, error: statsError } = useSWR(`${process.env.REACT_APP_API_BASE_URL}/api/orders/stats`, fetcher);
  const { data: revenueData, error: revenueError } = useSWR(`${process.env.REACT_APP_API_BASE_URL}/api/orders/revenue`, fetcher);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (statsData || revenueData || statsError || revenueError) {
      setLoading(false);
    }
  }, [statsData, revenueData, statsError, revenueError]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (statsError || revenueError) {
    return <div>Error loading data</div>;
  }

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='Tổng quan' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* STATS */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name='Tổng doanh thu' 
            icon={Zap} 
            value={formatCurrency(statsData?.totalRevenue || 0)} 
            color='#6366F1' 
          />
          <StatCard 
            name='Đơn hàng hoàn thành' 
            icon={Users} 
            value={statsData?.completedOrders || 0} 
            color='#8B5CF6' 
          />
          <StatCard 
            name='Đơn hàng chờ xử lý' 
            icon={ShoppingBag} 
            value={statsData?.pendingOrders || 0} 
            color='#EC4899' 
          />
          <StatCard 
            name='Tổng số đơn hàng' 
            icon={BarChart2} 
            value={statsData?.totalOrders || 0} 
            color='#10B981' 
          />
        </motion.div>

        {/* CHARTS */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <SalesOverviewChart data={revenueData} />
          <CategoryDistributionChart />
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;