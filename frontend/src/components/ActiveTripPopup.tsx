import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveTrip, stopTrip } from "../services/tripsApi";
import { useRefresh } from "../contexts/RefreshContext";

interface ActiveTripPopupProps {
  onRefresh: () => void;
}

const ActiveTripPopup: React.FC<ActiveTripPopupProps> = ({ onRefresh }) => {
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
    try {
      await stopTrip();
      alert("Trip stopped successfully!");
      setActiveTrip(null);
      onRefresh();
      triggerRefresh();
    } catch (err: any) {
      alert(`Failed to stop trip: ${err.response?.data?.error || "Unknown error"}`);
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
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded shadow-lg space-y-2">
      {error && <p className="text-red-500">{error}</p>}
      <h3 className="text-lg font-bold">Active Trip</h3>
      <p><strong>Car:</strong> {activeTrip?.car_license_plate || "N/A"}</p>
      <p><strong>Start:</strong> {new Date(activeTrip?.start_time).toLocaleString()}</p>
      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleStopTrip}
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Stop Trip
        </button>
        <button
          onClick={handleViewDetails}
          className="bg-gray-100 text-blue-500 py-2 px-4 rounded hover:bg-gray-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ActiveTripPopup;
