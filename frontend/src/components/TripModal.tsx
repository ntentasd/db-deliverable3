import React, { useState } from "react";
import { capitalizeFirstLetter } from "../services/formatUtils";
import { FaCreditCard, FaBitcoin } from "react-icons/fa";

interface StopTripModalProps {
  distance: string;
  setDistance: (value: string) => void;
  drivingBehavior: string;
  setDrivingBehavior: (value: string) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  onConfirm: () => Promise<string>;
  onCancel: () => void;
  hasActiveSubscription: boolean;
}

const TripModal: React.FC<StopTripModalProps> = ({
  distance,
  setDistance,
  drivingBehavior,
  setDrivingBehavior,
  paymentMethod,
  setPaymentMethod,
  onConfirm,
  onCancel,
  hasActiveSubscription,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    const numericDistance = parseFloat(distance);
    if (isNaN(numericDistance) || numericDistance <= 0) {
      setError("Distance must be a positive number.");
      return;
    }

    const numericDrivingBehavior = parseFloat(drivingBehavior);
    if (isNaN(numericDrivingBehavior) || numericDrivingBehavior < 0 || numericDrivingBehavior > 10) {
      setError("Driving Behavior must be between 0 and 10.");
      return;
    }

    if (!paymentMethod && !hasActiveSubscription) {
      setError("Please select a payment method.");
      return;
    }

    setError(null);
    const result = await onConfirm();

    if (result !== "Trip stopped successfully!") {
      setError(result);
    }
  };

  const handleCancel = () => {
    setDistance("");
    setDrivingBehavior("");
    setPaymentMethod("");
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
              Driving Behavior (0-10)
            </label>
            <input
              type="number"
              step="0.01"
              value={drivingBehavior}
              onChange={(e) => setDrivingBehavior(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-gray-200 focus:outline-double focus:outline-purple-400"
            />
          </div>
          {!hasActiveSubscription && (
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Payment Method
              </label>
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={() => setPaymentMethod("CARD")}
                  className={`py-2 px-4 rounded flex items-center justify-center ${
                    paymentMethod === "CARD"
                      ? "bg-teal-700 text-white"
                      : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  } transition`}
                >
                  <FaCreditCard className="w-6 h-6 text-blue-400" />
                </button>
                <button
                  onClick={() => setPaymentMethod("CRYPTO")}
                  className={`py-2 px-4 rounded flex items-center justify-center ${
                    paymentMethod === "CRYPTO"
                      ? "bg-teal-700 text-white"
                      : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  } transition`}
                >
                  <FaBitcoin className="w-6 h-6 text-yellow-500" />
                </button>
              </div>
            </div>
          )}
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