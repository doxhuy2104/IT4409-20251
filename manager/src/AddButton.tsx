import { FaPlus } from "react-icons/fa";

const AddButton = ({ onClick, label = "Thêm", icon: Icon = FaPlus, className = "" }: { onClick: () => void, label?: string, icon?: React.ComponentType, className?: string }) => {
  const handleClick = () => {
    onClick();
  }

  return (
    <button
      className={`bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 mb-2 cursor-pointer transition-all active:scale-90 hover:bg-green-700 ${className} duration-300 ease-in-out`}
      onClick={handleClick}
    >
      <Icon /> {label}
    </button>
  );
};

export default AddButton;
