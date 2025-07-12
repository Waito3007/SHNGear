import HomePage from "@/pages/Home/HomePage";
import OverviewPage from "@/pages/Admin/OverviewPage";
import ProductsPage from "@/pages/Admin/ProductsPage";
import UsersPage from "@/pages/Admin/UsersPage";
import SalesPage from "@/pages/Admin/SalesPage";
import OrdersPage from "@/pages/Admin/OrdersPage";
import AnalyticsPage from "@/pages/Admin/AnalyticsPage";
import HomepageAdminPage from "@/pages/Admin/HomepageAdminPage";
import CategoryAdminPage from "@/pages/Admin/CategoryAdminPage";
import FlashSaleAdminPage from "@/pages/Admin/FlashSaleAdminPage";
import HomepageOverviewPage from "@/pages/Admin/HomepageOverviewPage";
import SettingsPage from "@/pages/Admin/SettingsPage";
import ProductPage from "@/pages/ProductPage/ProductPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import ProductList from "@/pages/ProductList/ProductList";
import Shoppingcart from "@/pages/shoppingcart/shoppingcart";
import Unauthorized from "@/pages/Unauthorized/Unauthorized";
import BestSellerAdminPage from "@/pages/Admin/BestSellerAdminPage";
import ReviewManagementPage from "@/pages/Admin/ReviewManagementPage";
import BlogList from "@/pages/blog/BlogList";
import BlogPostDetail from "@/pages/blog/BlogPostDetail";
import BlogPostEditor from "@/pages/blog/BlogPostEditor";
import LuckySpinPage from "@/pages/Admin/LuckySpinPage";
import LoyaltyPage from "@/pages/Loyalty/LoyaltyPage";
const AppRoutes = [

  {
    path: "/admin/reviews",
    element: <ReviewManagementPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/lucky-spin",
    element: <LuckySpinPage />,
    requiresAdmin: true,
  },
  // Loyalty routes
  {
    path: "/loyalty",
    element: <LoyaltyPage />,
  },
  // Blog routes
  {
    path: "/blog",
    element: <BlogList />,
  },
  {
    path: "/blog/:id",
    element: <BlogPostDetail />,
  },
  {
    path: "/admin/blog",
    element: <BlogList />,
    requiresAdmin: true,
  },
  {
    path: "/admin/blog/new",
    element: <BlogPostEditor />,
    requiresAdmin: true,
  },
  {
    path: "/admin/blog/edit/:id",
    element: <BlogPostEditor />,
    requiresAdmin: true,
  },
  {
    path: "/admin/best-sellers",
    element: <BestSellerAdminPage />,
    requiresAdmin: true,
  },
  {
    path: "/",
    element: <HomePage />,
  },
  // Admin routes - will be protected by ProtectedRoute
  {
    path: "/admin/overview",
    element: <OverviewPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/products",
    element: <ProductsPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/users",
    element: <UsersPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/sales",
    element: <SalesPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/orders",
    element: <OrdersPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/analytics",
    element: <AnalyticsPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/settings",
    element: <SettingsPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/homepage",
    element: <HomepageAdminPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/categories",
    element: <CategoryAdminPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/flash-sale",
    element: <FlashSaleAdminPage />,
    requiresAdmin: true,
  },
  {
    path: "/admin/homepage-dashboard",
    element: <HomepageOverviewPage />,
    requiresAdmin: true,
  },
  // Public routes
  {
    path: "/ProductPage/",
    element: <ProductPage />,
  },
  {
    path: "/Profile/",
    element: <ProfilePage />,
  },
  {
    path: "/productlist/",
    element: <ProductList />,
  },
  {
    path: "/shoppingcart/",
    element: <Shoppingcart />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
];

export default AppRoutes;
