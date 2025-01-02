import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrips, stopTrip } from "../services/tripsApi";

interface ActiveTripPopupProps {
  onRefresh: () => void; // Trigger a refresh from the popup
  refreshKey: number; // Listen for changes to refreshKey
}

const ActiveTripPopup: React.FC<ActiveTripPopupProps> = ({ onRefresh, refreshKey }) => {
  const [activeTrip, setActiveTrip] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveTrip = async () => {
      try {
        const response = await getTrips();
        const ongoingTrip = response.data.find(
          (trip: any) => trip.end_time === null || trip.end_time === undefined
        );
        setActiveTrip(ongoingTrip || null);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchActiveTrip();
  }, [refreshKey]);

  const handleStopTrip = async () => {
    try {
      await stopTrip();
      alert("Trip stopped successfully!");
      setActiveTrip(null);
      onRefresh();
    } catch (err: any) {
      console.error("Failed to stop trip:", err);
      alert(
        `Failed to stop trip: ${
          err.response?.data?.error || err.message || "Unknown error"
        }`
      );
    }
  };

  const handleViewDetails = () => {
    if (activeTrip?.id) {
      navigate(`/trips/${activeTrip.id}`);
    } else {
      alert("No active trip details available.");
    }
  };

  if (!activeTrip) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded shadow-lg space-y-2">
      {error && <div className="text-red-500">{error}</div>}
      <h3 className="text-lg font-bold">Active Trip</h3>
      <p>
        <strong>Car:</strong> {activeTrip.car_license_plate}
      </p>
      <p>
        <strong>User:</strong> {activeTrip.user_email}
      </p>
      <p>
        <strong>Start:</strong>{" "}
        {new Date(activeTrip.start_time).toLocaleString()}
      </p>
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
