import { useState, useEffect } from "react";
import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

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
		activeUsers: 0,
		retentionRate: "0%", // Thay churnRate thành retentionRate
	});

	useEffect(() => {
		const fetchUserStats = async () => {
			try {
				const response = await axios.get("https://localhost:7107/api/users/statistics");
				setUserStats(response.data);
			} catch (error) {
				console.error("Lỗi khi lấy dữ liệu người dùng:", error);
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
						name='Total Users'
						icon={UsersIcon}
						value={userStats.totalUsers.toLocaleString()}
						color='#6366F1'
					/>
					<StatCard
						name='New Users Today'
						icon={UserPlus}
						value={userStats.newUsersToday.toLocaleString()}
						color='#10B981'
					/>
					<StatCard
						name='Active Users'
						icon={UserCheck}
						value={userStats.activeUsers.toLocaleString()}
						color='#F59E0B'
					/>
					<StatCard
						name='Retention Rate' // Cập nhật tên
						icon={UserCheck} // Có thể giữ UserCheck hoặc đổi icon phù hợp
						value={userStats.retentionRate}
						color='#34D399' // Màu xanh lá thể hiện mức độ giữ chân tốt hơn
					/>
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
