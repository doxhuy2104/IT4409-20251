import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X, CheckCircle, AlertTriangle } from 'lucide-react';
import feedbackService, { CreateFeedbackParams } from '../services/feedback.service';

const FeedbackForm: React.FC = () => {
    const [feedbackData, setFeedbackData] = useState<CreateFeedbackParams>({
        name: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (success || error) {
            setShowToast(true);
            const timer = setTimeout(() => {
                setShowToast(false);
                setSuccess(false);
                setError(null);
            }, 6000);

            return () => clearTimeout(timer);
        }
    }, [success, error]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFeedbackData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            await feedbackService.createFeedback(feedbackData);
            setSuccess(true);
            setFeedbackData({
                name: '',
                description: ''
            });
        } catch (err) {
            console.error('Lỗi khi gửi phản hồi:', err);
            setError('Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseToast = () => {
        setShowToast(false);
        setSuccess(false);
        setError(null);
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                    <h1 className="text-2xl font-bold text-green-600">Gửi phản hồi</h1>
                </div>

                <p className="text-gray-600 mb-8">
                    Chúng tôi luôn đánh giá cao phản hồi của bạn để có thể cải thiện dịch vụ của mình.
                    Vui lòng chia sẻ ý kiến, góp ý hoặc báo cáo lỗi bạn gặp phải.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Tiêu đề phản hồi
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={feedbackData.name}
                            onChange={handleChange}
                            required
                            placeholder="Ví dụ: Góp ý về giao diện trang chủ"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Nội dung phản hồi
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={feedbackData.description}
                            onChange={handleChange}
                            required
                            placeholder="Mô tả chi tiết phản hồi của bạn..."
                            rows={5}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 cursor-pointer text-white font-medium py-3 px-6 rounded-lg transition duration-300 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
                        {!loading && <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>

            {/* Toast Notifications */}
            {showToast && (success || error) && (
                <div className={`fixed bottom-6 right-6 flex items-center gap-3 p-4 rounded-lg shadow-lg ${success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'} animate-fade-in-up`}>
                    {success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    <p className={`text-sm ${success ? 'text-green-700' : 'text-red-700'}`}>
                        {success ? 'Phản hồi của bạn đã được gửi thành công!' : error}
                    </p>
                    <button onClick={handleCloseToast} className="ml-2 text-gray-500 hover:text-gray-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedbackForm;
