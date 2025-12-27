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

const formatDate = (dateString: string) => {
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

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      try {
        const res = await api.get("/feedbacks");
        setFeedbacks(res.data.data || []);
      } catch (err) {
        setFeedbacks([]);
      }
      setLoading(false);
    };
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
      try {
        await api.delete(`/feedbacks/${id}`);
        setFeedbacks(feedbacks.filter((fb) => fb.id !== id));
      } catch (err) {
        alert("Xóa thất bại!");
      }
    }
  };

  const formatData = (data: Feedback[]) => {
    return data.map(fb => ({
      ...fb,
      createdAt: formatDate(fb.createdAt)
    }));
  };

  return (
    <div className="p-2">
      <h1 className="text-xl font-bold mb-4">Quản lý phản hồi</h1>
      <div className="p-4">
        {loading ? (
          <LoadingSpinner message="Đang tải phản hồi..." />
        ) : (
          <ManagementTable
            headers={headers}
            columns={columns}
            data={formatData(feedbacks)}
            onDetail={(id) => {
              const fb = feedbacks.find(f => f.id === id);
              if (fb) setSelectedFeedback(fb);
            }}
            onDelete={handleDelete}
            showActions={true}
          />
        )}
      </div>
      {/* Popup hiển thị nội dung feedback */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300"
          onClick={() => setSelectedFeedback(null)}
          style={{ animation: 'fadeIn 0.2s' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full relative animate-popup"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-red-500 transition-colors duration-200"
              onClick={() => setSelectedFeedback(null)}
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