import { BarChart2, DollarSign, Menu, ShoppingBag, ShoppingCart, Users, Home, MessageCircle, LayoutDashboard, FileText } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RateReview } from "@mui/icons-material";

const SIDEBAR_ITEMS = [
	{
		name: "Tổng quan",
		icon: BarChart2,
		color: "#6366f1",
		href: "/admin/overview",
	},
	{
		name: "Trang chủ",
		icon: LayoutDashboard,
		color: "#F97316",
		href: "/admin/homepage-dashboard",
	},
	{ name: "Sản Phẩm", icon: ShoppingBag, color: "#8B5CF6", href: "/admin/products" },
	{ name: "Người Dùng", icon: Users, color: "#EC4899", href: "/admin/users" },
	{ name: "Bán Hàng", icon: DollarSign, color: "#10B981", href: "/admin/sales" },
	{ name: "Đơn Hàng", icon: ShoppingCart, color: "#F59E0B", href: "/admin/orders" },
	{ name: "Đánh giá", icon: RateReview, color: "#FFD700", href: "/admin/reviews" },
	{ name: "Blog", icon: FileText, color: "#34D399", href: "/admin/blog" },
	{ name: "Chăm sóc khách hàng", icon: MessageCircle, color: "#06B6D4", href: "/admin/chat" },
	// { name: "Phân tích", icon: TrendingUp, color: "#3B82F6", href: "/admin/analytics" },
	{
		name: "Khách hàng thân thiết",
		icon: DollarSign,
		color: "#F43F5E",
		href: "/admin/lucky-spin",
	},
	// { name: "Settings", icon: Settings, color: "#6EE7B7", href: "/admin/settings" },
];

const Sidebar = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	return (
		<motion.div
			className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
				isSidebarOpen ? "w-64" : "w-20"
			}`}
			animate={{ width: isSidebarOpen ? 256 : 80 }}
		>
			<div className='h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
				>
					<Menu size={24} />
				</motion.button>
				
				<nav className='mt-8 flex-grow'>
					{/* Logo/Home Link */}
		<Link to="/" className="mb-6">
		  <motion.div 
			className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors"
			whileHover={{ scale: 1.05 }}
		  >
			<Home size={24} className="text-indigo-400" />
			<AnimatePresence>
			  {isSidebarOpen && (
				<motion.span
				  className="ml-3 text-xl font-bold text-white"
				  initial={{ opacity: 0, x: -10 }}
				  animate={{ opacity: 1, x: 0 }}
				  exit={{ opacity: 0, x: -10 }}
				  transition={{ duration: 0.2 }}
				>
				  SHN Gear
				</motion.span>
			  )}
			</AnimatePresence>
		  </motion.div>
		</Link>
					{SIDEBAR_ITEMS.map((item) => (
						<Link key={item.href} to={item.href}>
							<motion.div className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2'>
								<item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
								<AnimatePresence>
									{isSidebarOpen && (
										<motion.span
											className='ml-4 whitespace-nowrap'
											initial={{ opacity: 0, width: 0 }}
											animate={{ opacity: 1, width: "auto" }}
											exit={{ opacity: 0, width: 0 }}
											transition={{ duration: 0.2, delay: 0.3 }}
										>
											{item.name}
										</motion.span>
									)}
								</AnimatePresence>
							</motion.div>
						</Link>
					))}

					
				</nav>
			</div>
		</motion.div>
	);
};
export default Sidebar;
