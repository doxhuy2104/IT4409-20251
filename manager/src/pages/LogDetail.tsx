import { useEffect, useState } from "react";
import api from "../services/api";
import BackButton from "../components/BackButton";
import { useNavigate, useParams } from "react-router-dom";

interface AdminLog {
  id: number;
  adminId: number;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  createdAt: string;
  updatedAt: string;
  admin: {
    username: string;
    email: string;
  };
}

const HistoryDetail = () => {
  const [log, setLog] = useState<AdminLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDetail, setPreviewDetail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchLog = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/manager/admin-log/${id}`);
        setLog(res.data.data);
      } catch (err) {
        setError("Không thể tải lịch sử admin log.");
      }
      setLoading(false);
    };
    fetchLog();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!log) return <div className="p-4">Không tìm thấy log.</div>;

  return (
    <div className="p-8 w-full min-h-screen bg-white">
      <BackButton onClick={handleBack} label="Quay lại" />
      <h1 className="text-2xl font-bold mb-8 text-center">Chi tiết thao tác Admin</h1>
      <div className="bg-white shadow-lg rounded-xl p-10 space-y-8 max-w-3xl mx-auto">
        <div className="space-y-4 text-lg">
          <div><span className="font-semibold">ID: </span>{log.id}</div>
          <div><span className="font-semibold">Admin: </span>{log.admin?.username}</div>
          <div><span className="font-semibold">Email: </span>{log.admin?.email}</div>
          <div><span className="font-semibold">Hành động: </span>{log.action}</div>
          <div><span className="font-semibold">Đối tượng: </span>{log.entityType}</div>
          <div><span className="font-semibold">ID đối tượng: </span>{log.entityId}</div>
          <div><span className="font-semibold">Thời gian: </span>{new Date(log.createdAt).toLocaleString()}</div>
          <div>
            <span className="font-semibold">Chi tiết: </span>
            <button
              className="text-green-600 underline hover:text-green-800 ml-2"
              onClick={() => setPreviewDetail(log.details)}
            >
              Xem JSON
            </button>
          </div>
        </div>
      </div>
      {/* Overlay xem chi tiết log */}
      {previewDetail && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300"
          onClick={() => setPreviewDetail(null)}
          style={{ animation: 'fadeIn 0.2s' }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-10 max-w-2xl max-h-[80vh] overflow-auto w-full relative animate-popup"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-red-500 transition-colors duration-200"
              onClick={() => setPreviewDetail(null)}
              title="Đóng"
            >
              ×
            </button>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết thao tác</h2>
            </div>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto border text-gray-700">
              {JSON.stringify(JSON.parse(previewDetail), null, 2)}
            </pre>
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

export default HistoryDetail;
