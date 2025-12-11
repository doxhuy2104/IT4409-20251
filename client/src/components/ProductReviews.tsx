import React, { useState, useEffect, useCallback } from 'react';
import { Star, Edit, Trash, Check, X } from 'lucide-react';
import reviewService, { Review, CreateReviewParams, UpdateReviewParams } from '../services/review.service';
import useAuth from '../hooks/useAuth';

interface ProductReviewsProps {
    productId: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
    const { user } = useAuth();
    // State for reviews
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
    const [reviewStats, setReviewStats] = useState<{
        averageRating: number;
        totalReviews: number;
        ratingDistribution: { [key: number]: number };
    }>({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });

    // Review form state
    const [reviewFormData, setReviewFormData] = useState<{
        rating: number;
        comment: string;
    }>({
        rating: 5,
        comment: ''
    });
    const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
    const [reviewFormVisible, setReviewFormVisible] = useState<boolean>(false);

    // Edit review state
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [editReviewData, setEditReviewData] = useState<{
        rating: number;
        comment: string;
    }>({
        rating: 5,
        comment: ''
    });
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    console.log('ProductReviews component mounted with productId:', productId);

    // Fetch reviews for the current product
    const fetchReviews = useCallback(async () => {
        try {
            setReviewsLoading(true);
            const response = await reviewService.getReviewsByProductId(productId);
            console.log('Reviews response:', response);

            if (response.data) {
                setReviews(response.data);

                // Calculate review statistics
                const total = response.data.length;
                if (total > 0) {
                    // Calculate average rating
                    const sum = response.data.reduce((acc, review) => acc + review.rating, 0);
                    const average = sum / total;

                    // Calculate rating distribution
                    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    response.data.forEach(review => {
                        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
                    });

                    // Convert to percentages
                    const distributionPercentage: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                    Object.keys(distribution).forEach(rating => {
                        const key = parseInt(rating);
                        distributionPercentage[key] = Math.round((distribution[key] / total) * 100);
                    });

                    setReviewStats({
                        averageRating: Number(average.toFixed(1)),
                        totalReviews: total,
                        ratingDistribution: distributionPercentage
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
            // Set empty reviews on error
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId, fetchReviews]);

    // Submit a new review
    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setReviewSubmitting(true);

            const reviewData: CreateReviewParams = {
                productId: productId,
                rating: reviewFormData.rating,
                comment: reviewFormData.comment
            };

            const response = await reviewService.createReview(reviewData);
            console.log('Review submit response:', response);

            if (response.data) {
                // Add the new review to the list
                setReviews(prevReviews => [response.data, ...prevReviews]);

                // Reset the form
                setReviewFormData({
                    rating: 5,
                    comment: ''
                });

                // Hide the form
                setReviewFormVisible(false);

                // Refresh review stats
                fetchReviews();
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    // Edit a review
    const handleEditReview = (review: Review) => {
        setEditingReviewId(review.id);
        setEditReviewData({
            rating: review.rating,
            comment: review.comment
        });
    };

    const handleSaveEditReview = async () => {
        if (editingReviewId === null) return;

        try {
            const updateData: UpdateReviewParams = {
                rating: editReviewData.rating,
                comment: editReviewData.comment
            };

            const response = await reviewService.updateReview(editingReviewId, updateData);
            console.log('Edit review response:', response);

            if (response.data) {
                setReviews(prevReviews =>
                    prevReviews.map(review =>
                        review.id === editingReviewId ? response.data : review
                    )
                );
                setEditingReviewId(null);

                // Refresh review stats after update
                fetchReviews();
            }
        } catch (err) {
            console.error('Error editing review:', err);
            alert('Có lỗi xảy ra khi chỉnh sửa đánh giá. Vui lòng thử lại sau.');
        }
    };

    const handleCancelEditReview = () => {
        setEditingReviewId(null);
    };

    // Delete a review
    const handleDeleteReview = async (reviewId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
            return;
        }

        try {
            setIsDeleting(true);
            await reviewService.deleteReview(reviewId);
            setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));

            // Refresh review stats after deletion
            fetchReviews();
        } catch (err) {
            console.error('Error deleting review:', err);
            alert('Có lỗi xảy ra khi xóa đánh giá. Vui lòng thử lại sau.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Format date to a readable string
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div>
            {reviewsLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Rating overview */}
                    <div className="md:w-1/3 bg-gray-50 p-4 rounded-lg flex items-center md:flex-col">
                        <div className="text-center mb-2">
                            <div className="text-5xl font-bold text-green-600">
                                {reviewStats.averageRating || 0}
                                <span className="text-xl text-gray-500">/5</span>
                            </div>

                            <div className="flex justify-center mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={20}
                                        fill={star <= reviewStats.averageRating ? "#FFC107" : "none"}
                                        color={star <= reviewStats.averageRating ? "#FFC107" : "#E5E7EB"}
                                    />
                                ))}
                            </div>

                            <div className="text-sm text-gray-500 mt-1">
                                {reviewStats.totalReviews} đánh giá
                            </div>
                        </div>

                        <div className="w-full">
                            {/* Rating distribution */}
                            <div className="space-y-2 mt-4">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className="flex items-center">
                                        <div className="flex items-center w-10">
                                            <span>{rating}</span>
                                            <Star size={12} fill="#FFC107" color="#FFC107" className="ml-0.5" />
                                        </div>
                                        <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full"
                                                style={{ width: `${reviewStats.ratingDistribution[rating]}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-500 w-8">{reviewStats.ratingDistribution[rating]}%</span>
                                    </div>
                                ))}
                            </div>                            <button
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg py-2.5 px-4 w-full mt-4 font-medium shadow-md transition-all"
                                onClick={() => setReviewFormVisible(!reviewFormVisible)}
                            >
                                Viết đánh giá
                            </button>
                        </div>
                    </div>

                    {/* Review form */}
                    {reviewFormVisible && (
                        <div className="bg-white p-4 rounded-lg shadow-md mb-4 w-full">
                            <h3 className="font-medium text-lg mb-3">Viết đánh giá của bạn</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Đánh giá</label>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                type="button"
                                                key={rating}
                                                onClick={() => setReviewFormData({ ...reviewFormData, rating })}
                                                className="mr-1"
                                            >
                                                <Star
                                                    size={24}
                                                    fill={rating <= reviewFormData.rating ? "#FFC107" : "none"}
                                                    color={rating <= reviewFormData.rating ? "#FFC107" : "#E5E7EB"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="comment" className="block text-gray-700 mb-2">Nhận xét</label>
                                    <textarea
                                        id="comment"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={reviewFormData.comment}
                                        onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                                        required
                                    ></textarea>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                                        onClick={() => setReviewFormVisible(false)}
                                    >
                                        Hủy
                                    </button>                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg disabled:opacity-50 hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
                                        disabled={reviewSubmitting}
                                    >
                                        {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Review list */}
                    <div className={`${reviewFormVisible ? 'w-full' : 'md:w-2/3'}`}>
                        {reviews.length > 0 ? (
                            <>
                                {reviews.map((review, index) => (
                                    <div key={review.id} className={`${index < reviews.length - 1 ? 'border-b pb-4 mb-4' : ''}`}>
                                        {editingReviewId === review.id ? (<div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 mb-2">Đánh giá</label>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((rating) => (
                                                        <button
                                                            type="button"
                                                            key={rating}
                                                            onClick={() => setEditReviewData({ ...editReviewData, rating })}
                                                            className="mr-1"
                                                        >
                                                            <Star
                                                                size={24}
                                                                fill={rating <= editReviewData.rating ? "#FFC107" : "none"}
                                                                color={rating <= editReviewData.rating ? "#FFC107" : "#E5E7EB"}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label htmlFor="editComment" className="block text-gray-700 mb-2">Nhận xét</label>
                                                <textarea
                                                    id="editComment"
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    value={editReviewData.comment}
                                                    onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                                                    required
                                                ></textarea>
                                            </div>                                                <div className="flex justify-end space-x-2">
                                                <button
                                                    type="button"
                                                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                                    onClick={handleCancelEditReview}
                                                >
                                                    <X size={16} className="mr-1" /> Hủy
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-md transition-all"
                                                    onClick={handleSaveEditReview}
                                                >
                                                    <Check size={16} className="mr-1" /> Cập nhật
                                                </button>
                                            </div>
                                        </div>
                                        ) : (
                                            <div>
                                                <div className="flex justify-between">
                                                    <div>
                                                        <div className="font-medium">{review.customer?.fullName || 'Khách hàng'}</div>
                                                        <div className="text-gray-500 text-sm">{formatDate(review.createdAt)}</div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    size={16}
                                                                    fill={star <= review.rating ? "#FFC107" : "none"}
                                                                    color={star <= review.rating ? "#FFC107" : "#E5E7EB"}
                                                                />
                                                            ))}
                                                        </div>                                                        {user && String(user.id) === String(review.customerId) && (
                                                            <div className="flex space-x-2 ml-2">
                                                                <button
                                                                    className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-full hover:bg-green-50"
                                                                    onClick={() => handleEditReview(review)}
                                                                    title="Chỉnh sửa đánh giá"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-50"
                                                                    onClick={() => handleDeleteReview(review.id)}
                                                                    disabled={isDeleting}
                                                                    title="Xóa đánh giá"
                                                                >
                                                                    <Trash size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-gray-700">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}                                {reviews.length > 5 && (
                                    <div className="mt-6 flex justify-center">
                                        <button className="border-2 border-green-500 text-green-600 hover:bg-green-50 font-medium rounded-lg px-6 py-2 transition-colors">
                                            Xem thêm đánh giá
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
