import { Navigate } from 'react-router-dom';
import { useAuth } from "../AuthContext";
import LoadingSpinner from './Loading';

const Header = () => {
  const { currentUser, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return 'OG';
    return fullName
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <LoadingSpinner message="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!loading && !currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">Tổng quan</p>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>

      <div className="flex items-center gap-5">



        <div className="flex items-center gap-4 pl-5 border-l border-gray-200">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-gray-900">{currentUser?.fullName}</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
            {getInitials(currentUser?.fullName)}
          </div>
          <button
            className="px-4 py-2 rounded-full text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
