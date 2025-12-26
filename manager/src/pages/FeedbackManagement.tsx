import { useState, useEffect } from "react";
import ManagementTable from "../components/ManagementTable";
import api from "../services/api";
import LoadingSpinner from "../components/Loading";

const headers = ["ID", "User ID", "Tiêu đề", "Ngày gửi"];
const columns = ["id", "userId", "name", "createdAt"];

interface Feedback {
  id: number;
  userId: number | null;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Format date to Vietnamese locale
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Validate feedback data
 */
const validateFeedback = (feedback: Feedback): boolean => {
  if (!feedback.name || feedback.name.trim().length === 0) {
    return false;
  }
  if (!feedback.description || feedback.description.trim().length === 0) {
    return false;
  }
  return true;
};

/**
 * Filter feedbacks by search term
 */
const filterFeedbacks = (feedbacks: Feedback[], searchTerm: string): Feedback[] => {
  if (!searchTerm) return feedbacks;
  const lower = searchTerm.toLowerCase();
  return feedbacks.filter(fb => 
    fb.name.toLowerCase().includes(lower) ||
    fb.description.toLowerCase().includes(lower) ||
    (fb.userId?.toString() || '').includes(lower)
  );
};

/**
 * Sort feedbacks by date
 */
const sortFeedbacksByDate = (feedbacks: Feedback[], ascending: boolean = false): Feedback[] => {
  return [...feedbacks].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAscending, setSortAscending] = useState(false);

  /**
   * Fetch all feedbacks from API
   */
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/feedbacks");
      const data = res.data.data || [];
      setFeedbacks(data);
      setFilteredFeedbacks(data);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setFeedbacks([]);
      setFilteredFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  /**
   * Apply search and sort filters
   */
  useEffect(() => {
    let result = filterFeedbacks(feedbacks, searchTerm);
    result = sortFeedbacksByDate(result, sortAscending);
    setFilteredFeedbacks(result);
  }, [searchTerm, sortAscending, feedbacks]);

  /**
   * Handle delete feedback
   */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
      return;
    }

    try {
      await api.delete(`/feedbacks/${id}`);
      setFeedbacks(feedbacks.filter((fb) => fb.id !== id));
      alert("Xóa thành công!");
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert("Xóa thất bại!");
    }
  };

  /**
   * Handle view feedback details
   */
  const handleViewDetail = (id: number) => {
    const fb = feedbacks.find(f => f.id === id);
    if (fb) {
      setSelectedFeedback(fb);
    }
  };

  /**
   * Handle close detail modal
   */
  const handleCloseDetail = () => {
    setSelectedFeedback(null);
  };

  /**
   * Toggle sort order
   */
  const toggleSortOrder = () => {
    setSortAscending(!sortAscending);
  };

  /**
   * Format data for table display
   */
  const formatData = (data: Feedback[]) => {
    return data.map(fb => ({
      ...fb,
      createdAt: formatDate(fb.createdAt)
    }));
  };

  /**
   * Get statistics
   */
  const getStatistics = () => {
    return {
      total: feedbacks.length,
      withUser: feedbacks.filter(fb => fb.userId !== null).length,
      anonymous: feedbacks.filter(fb => fb.userId === null).length,
    };
  };

  const stats = getStatistics();

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-4">Quản lý phản hồi</h1>
      
      {/* Statistics Section */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-gray-600">Tổng số</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-gray-600">Có tài khoản</div>
          <div className="text-2xl font-bold">{stats.withUser}</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <div className="text-sm text-gray-600">Ẩn danh</div>
          <div className="text-2xl font-bold">{stats.anonymous}</div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm phản hồi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={toggleSortOrder}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          {sortAscending ? "↑ Cũ nhất" : "↓ Mới nhất"}
        </button>
        <button
          onClick={fetchFeedbacks}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          🔄 Làm mới
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <LoadingSpinner message="Đang tải phản hồi..." />
        ) : (
          <ManagementTable
            headers={headers}
            columns={columns}
            data={formatData(filteredFeedbacks)}
            onDetail={handleViewDetail}
            onDelete={handleDelete}
            showActions={true}
          />
        )}
      </div>

      {/* Popup hiển thị nội dung feedback */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300"
          onClick={handleCloseDetail}
          style={{ animation: 'fadeIn 0.2s' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full relative animate-popup"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-red-500 transition-colors duration-200"
              onClick={handleCloseDetail}
              title="Đóng"
            >
              ×
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-green-500 text-2xl">💬</span>
              <h2 className="text-2xl font-bold text-gray-800">Nội dung phản hồi</h2>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-600">Tiêu đề:</span>
              <span className="ml-2 text-gray-800">{selectedFeedback.name}</span>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-600">Người gửi (User ID):</span>
              <span className="ml-2 text-gray-800">{selectedFeedback.userId ?? '-'}</span>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-gray-600">Ngày gửi:</span>
              <span className="ml-2 text-gray-800">{formatDate(selectedFeedback.createdAt)}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-600">Nội dung:</span>
              <div className="mt-1 p-3 bg-gray-50 rounded text-gray-700 border">{selectedFeedback.description}</div>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .animate-popup { animation: popupScale 0.2s; }
            @keyframes popupScale { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
