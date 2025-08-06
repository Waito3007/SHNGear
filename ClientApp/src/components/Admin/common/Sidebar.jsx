import {
  BarChart2,
  DollarSign,
  Menu,
  ShoppingBag,
  ShoppingCart,
  Users,
  Home,
  MessageCircle,
  LayoutDashboard,
  FileText,
} from "lucide-react";
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
  {
    name: "Sản Phẩm",
    icon: ShoppingBag,
    color: "#8B5CF6",
    href: "/admin/products",
  },
  { name: "Người Dùng", icon: Users, color: "#EC4899", href: "/admin/users" },
  {
    name: "Bán Hàng",
    icon: DollarSign,
    color: "#10B981",
    href: "/admin/sales",
  },
  {
    name: "Đơn Hàng",
    icon: ShoppingCart,
    color: "#F59E0B",
    href: "/admin/orders",
  },
  {
    name: "Đánh giá",
    icon: RateReview,
    color: "#FFD700",
    href: "/admin/reviews",
  },
  { name: "Blog", icon: FileText, color: "#34D399", href: "/admin/blog" },
  {
    name: "Chăm sóc khách hàng",
    icon: MessageCircle,
    color: "#06B6D4",
    href: "/admin/chat",
  },
  // { name: "Phân tích", icon: TrendingUp, color: "#3B82F6", href: "/admin/analytics" },
  {
    name: "Khách hàng thân thiết",
    icon: DollarSign,
    color: "#F43F5E",
    href: "/admin/lucky-spin",
  },
  // { name: "Settings", icon: Settings, color: "#6EE7B7", href: "/admin/settings" },
];

// Mobile Sidebar Component
const MobileSidebar = ({ isOpen, setIsOpen }) => {
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.div
        className={`fixed left-0 top-0 h-full w-80 bg-gray-800 bg-opacity-95 backdrop-blur-md z-50 md:hidden transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="h-full p-4 flex flex-col overflow-y-auto">
          {/* Close button */}
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="flex items-center">
              <Home size={24} className="text-indigo-400 mr-3" />
              <span className="text-xl font-bold text-white">SHN Gear</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <Menu size={24} className="text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-grow">
            {SIDEBAR_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                  <item.icon
                    size={20}
                    style={{ color: item.color }}
                    className="flex-shrink-0"
                  />
                  <span className="ml-4 whitespace-nowrap">{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </motion.div>
    </>
  );
};

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
          isSidebarOpen ? "w-64" : "w-20"
        } hidden md:block`}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
      >
        <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700 overflow-y-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit mb-4"
          >
            <Menu size={24} />
          </motion.button>

          <nav className="flex-grow">
            {/* Logo/Home Link */}
            <Link to="/" className="mb-6 block">
              <motion.div
                className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Home size={24} className="text-indigo-400 flex-shrink-0" />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className="ml-3 text-xl font-bold text-white truncate"
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
                <motion.div className="flex items-center p-3 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                  <item.icon
                    size={20}
                    style={{ color: item.color, minWidth: "20px" }}
                    className="flex-shrink-0"
                  />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        className="ml-3 whitespace-nowrap overflow-hidden text-ellipsis"
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

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-30 p-3 bg-gray-800 bg-opacity-90 backdrop-blur-md rounded-lg md:hidden hover:bg-gray-700 transition-colors"
      >
        <Menu size={24} className="text-white" />
      </button>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} />
    </>
  );
};
export default Sidebar;
