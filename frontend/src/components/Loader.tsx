import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-teal-500 rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-teal-500 rounded-full animate-bounce delay-75"></div>
        <div className="w-4 h-4 bg-teal-500 rounded-full animate-bounce delay-150"></div>
      </div>
    </div>
  );
};

export default Loader;
