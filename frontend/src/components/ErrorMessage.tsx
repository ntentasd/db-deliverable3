import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="border-2 border-red-400 text-red-700 rounded-xl p-8 shadow-2xl max-w-lg w-full text-center">
        <FaExclamationTriangle size={64} className="mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Error</h2>
        <p className="text-lg mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-red-600 text-white text-lg rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
