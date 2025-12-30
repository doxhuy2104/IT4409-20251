import { Route, Routes } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import AddEmployee from "../pages/AddEmployee";
import AddProduct from "../pages/AddProduct";
import CustomerDetail from "../pages/CustomerDetail";
import CustomerManagement from "../pages/CustomerManagement";
import EditEmployee from "../pages/EditEmployee";
import EmployeeManagement from "../pages/EmployeeManagement";
import FeedbackManagement from "../pages/FeedbackManagement";
import Home from "../pages/Home";
import Login from "../pages/Login";
import ManagerLog from "../pages/ManagerLog";
import NotFound from "../pages/NotFound";
import OrderDetail from "../pages/OrderDetail";
import OrderManagement from "../pages/OrderManagement";
import ProductDetail from "../pages/ProductDetail";
import ProductEdit from "../pages/ProductEdit";
import ProductManagement from "../pages/ProductManagement";
import LogDetail from "../pages/LogDetail";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/employees" element={<EmployeeManagement />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/edit/:id" element={<EditEmployee />} />
        <Route path="/logs" element={<ManagerLog />} />
        <Route path="/logs/detail/:id" element={<LogDetail />} />
        <Route path="/products/add" element={<AddProduct />} />
        <Route path="/products/edit/:id" element={<ProductEdit />} />
        <Route path="/products/detail/:id" element={<ProductDetail />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/orders/detail/:id" element={<OrderDetail />} />
        <Route path="/customers" element={<CustomerManagement />} />
        <Route path="/customers/detail/:id" element={<CustomerDetail />} />
        <Route path="/feedback" element={<FeedbackManagement />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
