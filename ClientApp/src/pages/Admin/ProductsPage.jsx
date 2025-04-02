import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import Header from "../../components/Admin/common/Header";
import StatCard from "../../components/Admin/common/StatCard";
// import CardProduct from "../../components/Admin/common/CardProduct";

import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import CategoryDistributionChart from "../../components/Admin/overview/CategoryDistributionChart";
import SalesTrendChart from "../../components/Admin/products/SalesTrendChart";
import ProductsTable from "../../components/Admin/products/ProductsTable";

const ProductsPage = () => {
	const [totalProducts, setTotalProducts] = useState(0);
	const [lowStockProducts, setLowStockProducts] = useState(0);
	const [topSelling, setTopSelling] = useState(0);


	// Hàm fetch thống kê sản phẩm
	const fetchStats = useCallback(async () => {
		try {
			const [lowStockRes, totalProductsRes] = await Promise.all([
				axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Products/low-stock`),
				axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Products/count`)			]);

			setLowStockProducts(lowStockRes.data);
			setTotalProducts(totalProductsRes.data);
		} catch (error) {
			console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
		}
	}, []);
	// Gọi API khi component mount và khi filterType thay đổi
	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Sản Phẩm' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* STATS */}
				<motion.div
					className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1 }}
				>
					<StatCard name='Tổng sản phẩm' icon={Package} value={totalProducts} color='#6366F1' />
					<StatCard
						name="Bán chạy"
						icon={TrendingUp}
						value={topSelling}
						color="#10B981"
					/>
					<StatCard name='Gần hết hàng' icon={AlertTriangle} value={lowStockProducts} color='#F59E0B' />
					<StatCard name='Tổng thu' icon={DollarSign} value={"145002000VND"} color='#EF4444' />
				</motion.div>

				<ProductsTable />

				{/* CHARTS */}
				<div className='grid grid-col-1 lg:grid-cols-2 gap-8'>
					<SalesTrendChart />
					<CategoryDistributionChart />
				</div>
			</main>
		</div>
	);
};

export default ProductsPage;
