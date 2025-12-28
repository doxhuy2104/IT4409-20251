import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import PrivateRoute from "../components/PrivateRoute";
import EmployeeManagement from "../pages/EmployeeManagement";
import AddEmployee from "../pages/AddEmployee";
import EditEmployee from "../pages/EditEmployee";
import ManagerLog from "../pages/ManagerLog";
import AddProduct from "../pages/AddProduct";
import ProductDetail from "../pages/ProductDetail";
import ProductEdit from "../pages/ProductEdit";
import ProductManagement from "../pages/ProductManagement";
export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/employees/add" element={<AddEmployee />} />
            <Route path="/employees/edit/:id" element={<EditEmployee />} />
            <Route path="/logs" element={<ManagerLog />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/edit/:id" element={<ProductEdit />} />
            <Route path="/products/detail/:id" element={<ProductDetail />} />
            <Route path="/products" element={<ProductManagement />} />
        </Route>
    </Routes>
  );
}
