import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';

const FeedbackPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumbs */}
                <nav className="flex mb-6" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-green-600">
                                Trang chủ
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Phản hồi</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <FeedbackForm />
            </div>
        </div>
    );
};

export default FeedbackPage;
