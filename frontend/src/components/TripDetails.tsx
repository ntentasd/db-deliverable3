import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getTripById, stopTrip, Trip } from "../services/tripsApi";
import ReviewModal from "./ReviewModal";
import TripModal from "./TripModal";
import Loader from "./Loader";
import { createReview } from "../services/reviewsApi";

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
    amount: 0,
    payment_method: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [stopped, setStopped] = useState<boolean>(true);
  const [distance, setDistance] = useState<string>("");
  const [drivingBehavior, setDrivingBehavior] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [costPerKm, setCostPerKm] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (location.state?.showStopTripModal) {
      setShowTripModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        if (!trip_id) throw new Error("Trip ID is required.");
        const response = await getTripById(trip_id);
        setTrip(response.trip);
        setCostPerKm(response.cost_per_km);
        setStopped(!!response.trip.end_time && response.trip.end_time !== "N/A");
        setError(null);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch trip details:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to fetch trip details.");
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [trip_id]);

  useEffect(() => {
    const numericDistance = parseFloat(distance);
    if (!isNaN(numericDistance) && numericDistance > 0) {
      setAmount(parseFloat((numericDistance * costPerKm).toFixed(2)));
    } else {
      setAmount(0);
    }
  }, [distance, costPerKm]);

  const handleStopTrip = async (): Promise<string> => {
    if (!distance.trim() || !drivingBehavior.trim() || !paymentMethod) {
      return "Please fill in all fields and select a payment method.";
    }

    try {
      await stopTrip(parseFloat(distance), parseFloat(drivingBehavior), paymentMethod.toUpperCase(), amount);
      setStopped(true);
      setShowTripModal(false);
      setTrip((prev) => ({
        ...prev,
        end_time: new Date().toISOString(),
        distance: parseFloat(distance),
        driving_behavior: parseFloat(drivingBehavior),
        amount,
        payment_method: paymentMethod,
      }));
      setShowReviewModal(true);
      return "Trip stopped successfully!";
    } catch (err: any) {
      return err.response?.data?.error || "Failed to stop the trip.";
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    try {
      const message = await createReview(trip.id, rating, comment);
      console.log("Review submitted successfully:", message);
      setShowReviewModal(false);
    } catch (err: any) {
      console.error("Failed to submit review:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to submit review.");
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
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
        <p className="text-lg">
          <strong className="text-gray-400">Distance:</strong>{" "}
          {trip.distance !== undefined && trip.distance !== null ? (
            <span>{trip.distance.toFixed(2)} km</span>
          ) : (
            <span className="text-gray-400">Not available</span>
          )}
        </p>
        <p className="text-lg">
          <strong className="text-gray-400">Driving Behavior:</strong>{" "}
          {trip.driving_behavior !== undefined && trip.driving_behavior !== null ? (
            <span
              className={`font-semibold ${
                trip.driving_behavior <= 7
                  ? "text-green-400"
                  : trip.driving_behavior <= 8.5
                  ? "text-orange-400"
                  : "text-red-400"
              }`}
            >
              {trip.driving_behavior.toFixed(2)}
            </span>
          ) : (
            <span className="text-gray-400">Not available</span>
          )}
        </p>
        <p className="text-lg">
          <strong className="text-gray-400">Amount:</strong>{" "}
          <span>{amount.toFixed(2)} $</span>
        </p>
      </div>

      {!stopped && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowTripModal(true)}
            className="bg-purple-500 text-white py-2 px-6 rounded hover:bg-purple-600 transition"
          >
            Stop Trip
          </button>
        </div>
      )}

      {showTripModal && (
        <TripModal
          distance={distance}
          setDistance={setDistance}
          drivingBehavior={drivingBehavior}
          setDrivingBehavior={setDrivingBehavior}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onConfirm={handleStopTrip}
          onCancel={() => setShowTripModal(false)}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
};

export default TripDetails;
