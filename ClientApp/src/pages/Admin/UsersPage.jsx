import { useEffect, useState } from "react";
import axios from "axios";
import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../../components/Admin/common/Header";
import StatCard from "../../components/Admin/common/StatCard";
import UsersTable from "../../components/Admin/users/UsersTable";
import UserGrowthChart from "../../components/Admin/users/UserGrowthChart";
import UserActivityHeatmap from "../../components/Admin/users/UserActivityHeatmap";
import UserDemographicsChart from "../../components/Admin/users/UserDemographicsChart";

const UsersPage = () => {
    const [userStats, setUserStats] = useState({
        totalUsers: 0,
        newUsersToday: 0,
        activeUsers: 0, // Placeholder, có thể cập nhật sau
        churnRate: "0%", // Placeholder, có thể cập nhật sau
    });

    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                const response = await axios.get("https://localhost:7107/api/users/stats");
                console.log("User stats fetched:", response.data); // Log dữ liệu thống kê
                setUserStats({
                    ...userStats,
                    totalUsers: response.data.totalUsers,
                    newUsersToday: response.data.newUsersToday,
                });
            } catch (error) {
                console.error("Error fetching user stats:", error); // Log lỗi
            }
        };

        fetchUserStats();
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Users' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard
                        name='Số người dùng'
                        icon={UsersIcon}
                        value={userStats.totalUsers.toLocaleString()}
                        color='#6366F1'
                    />
                    <StatCard
                        name='Số người dùng mới hôm nay'
                        icon={UserPlus}
                        value={userStats.newUsersToday}
                        color='#10B981'
                    />
                    {/* <StatCard
                        name='Active Users'
                        icon={UserCheck}
                        value={userStats.activeUsers.toLocaleString()}
                        color='#F59E0B'
                    />
                    <StatCard
                        name='Churn Rate'
                        icon={UserX}
                        value={userStats.churnRate}
                        color='#EF4444'
                    /> */}
                </motion.div>

                <UsersTable />

                {/* USER CHARTS */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
                    <UserGrowthChart />
                    <UserActivityHeatmap />
                    <UserDemographicsChart />
                </div>
            </main>
        </div>
    );
};

export default UsersPage;
