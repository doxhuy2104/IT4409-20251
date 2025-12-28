import { Route, Routes } from "react-router-dom";
import AccountPage from "../pages/AccountPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import GoogleCallback from "../pages/auth/GoogleCallback";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register.tsx";
import ResetPassword from "../pages/auth/ResetPassword";
import CategoryPage from "../pages/CategoryPage";
import FeedbackPage from "../pages/FeedbackPage";
import Home from "../pages/HomePage";
import NotFound from "../pages/NotFound";
import OrderDetailPage from "../pages/OrderDetailPage";
import OrdersPage from "../pages/OrdersPage";
import Paymentpage from "../pages/PaymentPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import SearchResults from "../pages/SearchResults";
import ShoppingCart from "../pages/ShoppingCart";
import WishlistPage from "../pages/WishlistPage";
import PrivateRoute from "./PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Authentication routes */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login/success" element={<GoogleCallback />} />

      {/* Protected routes - require authentication */}      <Route element={<PrivateRoute />}>
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/payment/:orderId" element={<Paymentpage />} />
        <Route path="/notifications" element={<div className="container mx-auto p-8">Thông báo của tôi</div>} />
      </Route>

      {/* Search results */}
      <Route path="/search" element={<SearchResults />} />
      {/* Feedback page */}
      <Route path="/feedback" element={<FeedbackPage />} />

      {/* Public routes - Category routes */}
      {/* Category routes - Danh mục chính */}
      <Route path="/qua-tang-trai-cay" element={<CategoryPage />} />
      <Route path="/qua-tang-tet" element={<CategoryPage />} />
      <Route path="/trai-cay-theo-mua" element={<CategoryPage />} />
      <Route path="/ready-to-eat" element={<CategoryPage />} />
      <Route path="/rau-cu-qua" element={<CategoryPage />} />
      <Route path="/tuoi-song" element={<CategoryPage />} />
      <Route path="/ready-to-cook" element={<CategoryPage />} />
      <Route path="/thuc-pham-kho" element={<CategoryPage />} />
      <Route path="/gia-vi-phu-lieu" element={<CategoryPage />} />

      {/* Subcategories - Trái Cây */}
      <Route path="/trai-cay-viet" element={<CategoryPage />} />
      <Route path="/trai-cay-nhap-khau" element={<CategoryPage />} />
      <Route path="/trai-cay-cat-san" element={<CategoryPage />} />

      {/* Subcategories - Rau Củ Quả */}
      <Route path="/rau-an-la" element={<CategoryPage />} />
      <Route path="/rau-cu" element={<CategoryPage />} />
      <Route path="/qua-tuoi" element={<CategoryPage />} />
      <Route path="/nam-tuoi" element={<CategoryPage />} />

      {/* Subcategories - Tươi Sống */}
      <Route path="/thit-heo" element={<CategoryPage />} />
      <Route path="/thit-bo" element={<CategoryPage />} />
      <Route path="/thit-ga" element={<CategoryPage />} />
      <Route path="/hai-san" element={<CategoryPage />} />
      <Route path="/trung" element={<CategoryPage />} />

      {/* Subcategories - Thực Phẩm Khô */}
      <Route path="/hat-dinh-duong" element={<CategoryPage />} />
      <Route path="/trai-cay-kho" element={<CategoryPage />} />
      <Route path="/hat-ngu-coc" element={<CategoryPage />} />
      <Route path="/bot" element={<CategoryPage />} />

      {/* Subcategories - Gia Vị & Phụ Liệu */}
      <Route path="/gia-vi" element={<CategoryPage />} />
      <Route path="/dau-an" element={<CategoryPage />} />
      <Route path="/nuoc-tuong-nuoc-mam" element={<CategoryPage />} />
      <Route path="/duong-muoi" element={<CategoryPage />} />

      {/* Subcategories - Ready To Eat */}
      <Route path="/com-hop" element={<CategoryPage />} />
      <Route path="/banh-mi" element={<CategoryPage />} />
      <Route path="/salad" element={<CategoryPage />} />
      <Route path="/do-an-nhanh" element={<CategoryPage />} />

      {/* Subcategories - Ready To Cook */}
      <Route path="/rau-cu-sach" element={<CategoryPage />} />
      <Route path="/thit-uop-san" element={<CategoryPage />} />
      <Route path="/ca-sach" element={<CategoryPage />} />
      <Route path="/do-chay" element={<CategoryPage />} />

      {/* Product detail route - must be before catch-all category route */}
      <Route path="/product/:slug" element={<ProductDetailPage />} />

      {/* Catch-all category route - must be last before 404 */}
      <Route path="/:categorySlug" element={<CategoryPage />} />

      {/* 404 Not Found - must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
