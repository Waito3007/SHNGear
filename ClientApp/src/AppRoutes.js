import Home from "./pages/Home/Home";
import Login from "./components/LoginAndRegister/Login";

const AppRoutes = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
];

export default AppRoutes;
