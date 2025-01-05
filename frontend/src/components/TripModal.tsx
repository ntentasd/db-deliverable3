import React, { useState } from "react";
import { capitalizeFirstLetter } from "../services/formatUtils";

interface StopTripModalProps {
  distance: string;
  setDistance: (value: string) => void;
  drivingBehavior: string;
  setDrivingBehavior: (value: string) => void;
  onConfirm: () => Promise<string>;
  onCancel: () => void;
}

const TripModal: React.FC<StopTripModalProps> = ({
  distance,
  setDistance,
  drivingBehavior,
  setDrivingBehavior,
  onConfirm,
  onCancel,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    // Validate distance
    const numericDistance = parseFloat(distance);
    if (isNaN(numericDistance) || numericDistance <= 0) {
      setError("Distance must be a positive number.");
      return;
    }

    // Validate driving behavior
    const numericDrivingBehavior = parseFloat(drivingBehavior);
    if (isNaN(numericDrivingBehavior) || numericDrivingBehavior < 0 || numericDrivingBehavior > 1) {
      setError("Driving Behavior must be between 0 and 1.");
      return;
    }

    // Clear error and proceed with the confirmation
    setError(null);
    const result = await onConfirm();

    // Handle error from backend
    if (result !== "Trip stopped successfully!") {
      setError(result);
    }
  };

  const handleDrivingBehaviorChange = (value: string) => {
    setDrivingBehavior(value);

    const numericValue = parseFloat(value);

    if (numericValue <= 0 || numericValue >= 1) {
      setError("Driving Behavior must be between 0 and 1.");
    } else {
      setError(null);
    }
  };

  const handleCancel = () => {
    setDistance("");
    setDrivingBehavior("");
    setError(null);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 text-teal-400 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Stop Trip</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Distance (km)
            </label>
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-gray-200 focus:outline-double focus:outline-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Driving Behavior (0-1)
            </label>
            <input
              type="number"
              step="0.01"
              // max="1"
              value={drivingBehavior}
              onChange={(e) => handleDrivingBehaviorChange(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-gray-200 focus:outline-double focus:outline-purple-400"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2">{capitalizeFirstLetter(error)}</p>
          )}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleConfirm}
              className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 transition"
            >
              Confirm
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

export default TripModal;
