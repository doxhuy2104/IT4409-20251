import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

interface ManagementTableProps {
  headers: string[];
  data: { [key: string]: any }[];
  columns?: string[];
  onDetail?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

const ManagementTable: React.FC<ManagementTableProps> = ({
  headers,
  data,
  columns,
  onDetail,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const handleDetail = (id: number) => {
    if (onDetail) {
      onDetail(id);
    }
  };

  const handleEdit = (id: number) => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = (id: number) => {
    if (onDelete) {
      onDelete(id);
    }
  };

  if (data.length === 0) {
    return <div className="text-center text-gray-500">Không có dữ liệu</div>;
  }

  if (headers.length === 0) {
    return <div className="text-center text-gray-500">Không có tiêu đề</div>;
  }

  const hasActions = showActions && (onDetail || onEdit || onDelete);
  const dataKeys = columns && columns.length === headers.length ? columns : headers.map(h => h.toLowerCase());

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-center">
            {headers.map((header, index) => (
              <th key={index} className="border-none p-2">{header}</th>
            ))}
            {hasActions && (
              <th className="border-none p-2">Thao tác</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="text-center hover:bg-gray-100 transition-colors">
              {dataKeys.map((key, index) => (
                <td key={index} className="border-b border-gray-200 p-2">
                  {item[key] ?? '-'}
                </td>
              ))}
              {hasActions && (
                <td className="border-b border-gray-200 p-2">
                  <div className="flex justify-center gap-2">
                    {onDetail && (
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer hover:bg-green-600 active:scale-95  transition-colors duration-300 ease-in-out"
                        onClick={() => handleDetail(item.id)}
                      >
                        <FaEye />
                        Chi tiết
                      </button>
                    )}
                    {onEdit && (
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer hover:bg-yellow-600 active:scale-95 transition-colors duration-300 ease-in-out"
                        onClick={() => handleEdit(item.id)}
                      >
                        <FaEdit />
                        Sửa
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer hover:bg-red-600 active:scale-95 transition-colors duration-300 ease-in-out"
                        onClick={() => handleDelete(item.id)}
                      >
                        <FaTrash />
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagementTable;
