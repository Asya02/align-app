interface BackToMainButtonProps {
  onClick: () => void;
}

export const BackToMainButton = ({ onClick }: BackToMainButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
    >
      Back to Main Page
    </button>
  );
};

interface DeleteOptimizationsButtonProps {
  onClick: () => void;
}

export const DeleteOptimizationsButton = ({ onClick }: DeleteOptimizationsButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
    >
      Clear Optimizations
    </button>
  );
};
