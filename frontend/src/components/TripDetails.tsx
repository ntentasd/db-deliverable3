import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTripById } from "../services/tripsApi";

const TripDetails: React.FC = () => {
  const { trip_id } = useParams<{ trip_id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        if (!trip_id) throw new Error("Trip ID is required");
        const data = await getTripById(trip_id);
        setTrip(data);
      } catch (err: any) {
        console.error("Failed to fetch trip details:", err.message);
        setError(err.message || "Failed to fetch trip details");
      }
    };

    fetchTripDetails();
  }, [trip_id]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!trip) {
    return <div>Loading trip details...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Trip Details</h1>
      <div className="mt-4">
        <p><strong>Car License Plate:</strong> {trip.car_license_plate}</p>
        <p><strong>User Email:</strong> {trip.user_email}</p>
        <p><strong>Start Time:</strong> {new Date(trip.start_time).toLocaleString()}</p>
        {trip.end_time ? (
          <p><strong>End Time:</strong> {new Date(trip.end_time).toLocaleString()}</p>
        ) : (
          <p className="text-yellow-500"><strong>End Time:</strong> Ongoing</p>
        )}
        {trip.distance && <p><strong>Distance:</strong> {trip.distance} km</p>}
        {trip.driving_behavior && (
          <p><strong>Driving Behavior:</strong> {trip.driving_behavior.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
};

export default TripDetails;
