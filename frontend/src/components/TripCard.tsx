import React from "react";
import { Trip } from "../services/tripsApi";
import { formatPlaceholder } from "../services/formatUtils";
import { formatDateTime } from "../services/formatUtils";

interface TripCardProps {
  trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  return (
    <div className="border p-4 rounded shadow hover:shadow-lg transition duration-200">
      <div className="text-sm text-gray-600 mb-2">
        <strong>Start:</strong> {formatDateTime(trip.start_time)} <br />
        <strong>End:</strong> {formatDateTime(trip.end_time)}
      </div>
      <div className="text-gray-800 font-medium">
        Car: <span className="font-semibold">{trip.car_license_plate}</span>
      </div>
      <div className="text-sm text-gray-600">
        Distance: <span className="font-medium">{formatPlaceholder(trip.distance, "km")}</span>
      </div>
      <div className="text-sm text-gray-600">
        Driving Behavior:{" "}
        <span className="font-medium">{formatPlaceholder(trip.driving_behavior)}</span>
      </div>
    </div>
  );
};

export default TripCard;
