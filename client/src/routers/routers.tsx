import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import CategoryPage from "../pages/CategoryPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import GoogleCallback from "../pages/auth/GoogleCallback";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import OrdersPage from "../pages/OrdersPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import PrivateRoute from "./PrivateRoute";
import AccountPage from "../pages/AccountPage";
import WishlistPage from "../pages/WishlistPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import ShoppingCart from "../pages/ShoppingCart";
import SearchResults from "../pages/SearchResults";
import PaymentCallback from "../pages/PaymentCallback";
import FeedbackPage from "../pages/FeedbackPage";

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
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/payment-success" element={<PaymentCallback />} />
        <Route path="/payment-failed" element={<PaymentCallback />} />
        <Route path="/notifications" element={<div className="container mx-auto p-8">Thông báo của tôi</div>} />
      </Route>

      {/* Search results */}
      <Route path="/search" element={<SearchResults />} />

      {/* Public routes - Category routes */}
      {/* Danh mục chính */}
      <Route path="/tinh-bot" element={<CategoryPage />} />
      <Route path="/hat-trai-cay-kho" element={<CategoryPage />} />
      <Route path="/banh-keo-snack" element={<CategoryPage />} />
      <Route path="/thuc-pham-dong-hop" element={<CategoryPage />} />
      <Route path="/gia-vi-nguyen-lieu" element={<CategoryPage />} />
      <Route path="/do-uong" element={<CategoryPage />} />
      <Route path="/thit-hai-san-tuoi" element={<CategoryPage />} />
      <Route path="/rau-qua-tuoi" element={<CategoryPage />} />
      <Route path="/do-chay-gia-man" element={<CategoryPage />} />
      <Route path="/viorganicmade" element={<CategoryPage />} />

      {/* Tinh bột */}
      <Route path="/gao" element={<CategoryPage />} />
      <Route path="/mien-pho-bun" element={<CategoryPage />} />
      <Route path="/mi-Y" element={<CategoryPage />} />
      <Route path="/tinh-bot-khac" element={<CategoryPage />} />

      {/* Hạt và trái cây khô */}
      <Route path="/hat-kho" element={<CategoryPage />} />
      <Route path="/trai-cay-kho" element={<CategoryPage />} />

      {/* Gia vị và nguyên liệu nấu ăn */}
      <Route path="/dau-an-giam" element={<CategoryPage />} />
      <Route path="/nguyen-lieu-nau-an" element={<CategoryPage />} />
      <Route path="/gia-vi-Viet-Nam" element={<CategoryPage />} />
      <Route path="/gia-vi-nuoc-ngoai" element={<CategoryPage />} />
      <Route path="/duong-chat-tao-ngot" element={<CategoryPage />} />
      <Route path="/muoi-nem-tieu" element={<CategoryPage />} />

      {/* Đồ uống */}
      <Route path="/tra" element={<CategoryPage />} />
      <Route path="/ca-phe" element={<CategoryPage />} />
      <Route path="/sua" element={<CategoryPage />} />
      <Route path="/nuoc-trai-cay" element={<CategoryPage />} />
      <Route path="/do-uong-khac" element={<CategoryPage />} />      <Route path="/phan-mem" element={<CategoryPage />} />

      {/* Trang phản hồi */}
      <Route path="/feedback" element={<FeedbackPage />} />

      {/* Thịt và hải sản */}
      <Route path="/thit-lon" element={<CategoryPage />} />
      <Route path="/thit-bo" element={<CategoryPage />} />
      <Route path="/thit-gia-cam" element={<CategoryPage />} />
      <Route path="/thit-khac" element={<CategoryPage />} />
      <Route path="/ca-va-hai-san" element={<CategoryPage />} />
      <Route path="/:categoryId" element={<CategoryPage />} />

      {/* Định tuyến cho chi tiết sản phẩm */}
      <Route path="/:category/:slug" element={<ProductDetailPage />} />

      {/* Trang 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
