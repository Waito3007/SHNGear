import Home from "@/pages/Home/Home";
import OverviewPage from "@/pages/Admin/OverviewPage";
import ProductsPage from "@/pages/Admin/ProductsPage";
import UsersPage from "@/pages/Admin/UsersPage";
import SalesPage from "@/pages/Admin/SalesPage";
import OrdersPage from "@/pages/Admin/OrdersPage";
import AnalyticsPage from "@/pages/Admin/AnalyticsPage";
import SettingsPage from "@/pages/Admin/SettingsPage";
import ProductPage from "@/pages/ProductPage";
import ProfilePage from "@/pages/ProfilePage";
import ProductList from "@/pages/ProductList";
import Shoppingcart from "@/pages/shoppingcart";
import Unauthorized from "@/pages/Unauthorized";
import ManageHomePage from "./pages/Admin/ManageHomePage";


const AppRoutes = [
  {
    path: "/",
    element: <Home />,
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
    requiresAdmin: true 
  },
  {
    path: "/admin/home",
    element: <ManageHomePage/>,
    requiresAdmin: true
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
