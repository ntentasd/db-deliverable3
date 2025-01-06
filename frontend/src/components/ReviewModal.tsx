import React, { useState } from "react";
import { capitalizeFirstLetter } from "../services/formatUtils";

interface ReviewModalProps {
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (rating < 0 || rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    setError(null);
    onSubmit(rating, comment);
  };

  const handleCancel = () => {
    setRating(0);
    setComment("");
    setError(null);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 text-teal-400 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Rating (0-5)
            </label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 text-gray-200 focus:outline-double focus:outline-purple-400"
              min="0"
              max="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-gray-200 focus:outline-double focus:outline-purple-400"
              rows={3}
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2">
              {capitalizeFirstLetter(error)}
            </p>
          )}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSubmit}
              className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition"
            >
              Submit
            </button>
            <button
              onClick={handleCancel}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
