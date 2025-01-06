import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getTripById, stopTrip, Trip } from "../services/tripsApi";
import { FaExclamationTriangle } from "react-icons/fa";
import { capitalizeFirstLetter } from "../services/formatUtils";
import TripModal from "./TripModal";
import Loader from "./Loader";

const TripDetails: React.FC = () => {
  const { trip_id } = useParams<{ trip_id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip>({
    id: 0,
    user_email: "",
    car_license_plate: "",
    start_time: "",
    end_time: "N/A",
    distance: 0,
    driving_behavior: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [stopped, setStopped] = useState<boolean>(true);
  const [distance, setDistance] = useState<string>("");
  const [drivingBehavior, setDrivingBehavior] = useState<string>("");

  useEffect(() => {
    if (location.state?.showStopTripModal) {
      setShowModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const MIN_LOADING_TIME = 500;
    let loadingTimeout: number;

    const fetchTripDetails = async () => {
      try {
        if (!trip_id) throw new Error("Trip ID is required.");
        
        const startTime = Date.now(); // Track when fetch starts
        const response = await getTripById(trip_id);
        
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(MIN_LOADING_TIME - elapsedTime, 0);

        loadingTimeout = setTimeout(() => {
          setTrip(response);
          setStopped(!!response.end_time && response.end_time !== "N/A");
          setError(null);
          setLoading(false);
        }, remainingTime);
      } catch (err: any) {
        console.error("Failed to fetch trip details:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to fetch trip details.");
        setLoading(false);
      }
    };

    fetchTripDetails();

    return () => clearTimeout(loadingTimeout);
  }, [trip_id]);

  const handleStopTrip = async (): Promise<string> => {
    if (!distance.trim() || !drivingBehavior.trim()) {
      return "Please fill in both Distance and Driving Behavior.";
    }

    try {
      await stopTrip(parseFloat(distance), parseFloat(drivingBehavior));
      alert("Trip stopped successfully!");
      setStopped(true);
      setShowModal(false);
      setTrip((prev) => prev && {
        ...prev,
        end_time: new Date().toISOString(),
        distance: parseFloat(distance),
        driving_behavior: parseFloat(drivingBehavior),
      });
      return "Trip stopped successfully!";
    } catch (err: any) {
      const response = err.response?.data?.error || "Unknown error";
      return response;
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="border-2 border-red-400 text-red-700 rounded-xl p-8 shadow-2xl max-w-lg w-full text-center">
          <FaExclamationTriangle size={64} className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Error</h2>
          <p className="text-lg mb-6">{capitalizeFirstLetter(error)}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-red-600 text-white text-lg rounded-lg hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">No trip details available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 text-gray-200 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-teal-400 mb-6">Trip Details</h1>

      <div className="space-y-4">
        <p className="text-lg">
          <strong className="text-gray-400">Car License Plate:</strong> {trip.car_license_plate}
        </p>
        <p className="text-lg">
          <strong className="text-gray-400">User Email:</strong> {trip.user_email}
        </p>
        <p className="text-lg">
          <strong className="text-gray-400">Start Time:</strong> {new Date(trip.start_time).toLocaleString()}
        </p>
        <p className="text-lg">
          <strong className="text-gray-400">End Time:</strong>{" "}
          {trip.end_time && trip.end_time !== "N/A" ? (
            new Date(trip.end_time).toLocaleString()
          ) : (
            <span className="text-yellow-500">Ongoing</span>
          )}
        </p>
        {trip.distance !== undefined && (
          <p className="text-lg">
            <strong className="text-gray-400">Distance:</strong> {trip.distance} km
          </p>
        )}
        {trip.driving_behavior > 0 && (
          <p className="text-lg">
            <strong className="text-gray-400">Driving Behavior:</strong>{" "}
            <span
              className={`font-semibold ${
                trip.driving_behavior <= 0.7
                  ? "text-green-400"
                  : trip.driving_behavior <= 0.8
                  ? "text-orange-400"
                  : "text-red-400"
              }`}
            >
              {trip.driving_behavior.toFixed(2)}
            </span>
          </p>
        )}
      </div>

      {!stopped && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-500 text-white py-2 px-6 rounded hover:bg-purple-600 transition"
          >
            Stop Trip
          </button>
        </div>
      )}

      {showModal && (
        <TripModal
          distance={distance}
          setDistance={setDistance}
          drivingBehavior={drivingBehavior}
          setDrivingBehavior={setDrivingBehavior}
          onConfirm={handleStopTrip}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default TripDetails;
