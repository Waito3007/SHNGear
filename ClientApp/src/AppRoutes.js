import Home from "./pages/Home/Home";
import OverviewPage from "./pages/Admin/OverviewPage";
import ProductsPage from "./pages/Admin/ProductsPage";
import UsersPage from "./pages/Admin/UsersPage";
import SalesPage from "./pages/Admin/SalesPage";
import OrdersPage from "./pages/Admin/OrdersPage";
import AnalyticsPage from "./pages/Admin/AnalyticsPage";
import SettingsPage from "./pages/Admin/SettingsPage";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";
import ProductList from "./pages/ProductList";

const AppRoutes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/admin/overview",
    element: <OverviewPage />,
  },
  {
    path: "/admin/products",
    element: <ProductsPage />,
  },
  {
    path: "/admin/users",
    element: <UsersPage />,
  },
  {
    path: "/admin/sales",
    element: <SalesPage />,
  },
  {
    path: "/admin/orders",
    element: <OrdersPage />,
  },
  {
    path: "/admin/analytics",
    element: <AnalyticsPage />,
  },
  {
    path: "/admin/settings",
    element: <SettingsPage />,
  },
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
];

export default AppRoutes;
