import { FaArrowLeft } from "react-icons/fa";

const BackButton = ({
  onClick,
  label = "Quay lại",
  className = ""
}: {
  onClick: () => void,
  label?: string,
  className?: string
}) => {
  return (
    <button
      className={`bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer hover:bg-green-700 active:scale-90 transition-all ${className} transition-colors duration-300 ease-in-out`}
      onClick={onClick}
    >
      <FaArrowLeft /> {label}
    </button>
  );
};

export default BackButton;