import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveTrip } from "../services/tripsApi";
import { useRefresh } from "../contexts/RefreshContext";
import { formatLicensePlate } from "../services/formatUtils";

const ActiveTripPopup: React.FC = () => {
  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { triggerRefresh } = useRefresh();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveTrip = async () => {
      try {
        const response = await getActiveTrip();
        setActiveTrip(response || null);
        setError(null);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || err.message || "Unknown error";

        if (errorMessage === "no active trip found") {
          setActiveTrip(null);
          setError(null);
        } else {
          setError(errorMessage);
        }
      }
    };

    fetchActiveTrip();
  }, [triggerRefresh]);

  const handleStopTrip = async () => {
    if (activeTrip?.id) {
      navigate(`/trips/${activeTrip.id}`, { state: { showStopTripModal: true } });
    } else {
      alert("No active trip details available.");
    }
  };

  const handleViewDetails = () => {
    if (activeTrip?.id) {
      navigate(`/trips/${activeTrip.id}`);
    } else {
      alert("No active trip details available.");
    }
  };

  if (!activeTrip && !error) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-gray-200 p-4 rounded-lg shadow-lg space-y-2">
      {error && <p className="text-red-400">{error}</p>}
      <h3 className="text-lg font-bold text-teal-400">Active Trip</h3>
      <p className="text-gray-300">
        <strong>Car:</strong> {formatLicensePlate(activeTrip?.car_license_plate) || "N/A"}
      </p>
      <p className="text-gray-300">
        <strong>Start:</strong> {new Date(activeTrip?.start_time).toLocaleString()}
      </p>
      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleStopTrip}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-300"
        >
          Stop Trip
        </button>
        <button
          onClick={handleViewDetails}
          className="bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 transition duration-300"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ActiveTripPopup;
