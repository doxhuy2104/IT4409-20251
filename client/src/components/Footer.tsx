import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <div className="mt-6 mb-6 text-center">
            <div className="flex justify-center space-x-4 mb-3">
                <Link to="/" className="text-sm text-green-600 hover:text-green-800 transition">
                    Trang chủ
                </Link>
                <Link to="/feedback" className="text-sm text-green-600 hover:text-green-800 transition">
                    Phản hồi
                </Link>
                <Link to="/about" className="text-sm text-green-600 hover:text-green-800 transition">
                    Giới thiệu
                </Link>
            </div>
            <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Organic. All rights reserved.
            </p>
        </div>
    )
}