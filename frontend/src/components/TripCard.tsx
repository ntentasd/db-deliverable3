import React from "react";
import { Trip } from "../services/tripsApi";
import { formatPlaceholder, formatDateTime, formatLicensePlate } from "../services/formatUtils";

interface TripCardProps {
  trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-700">
      <div className="text-sm text-gray-400 mb-4">
        <p>
          <strong className="text-teal-400">Start:</strong> {formatDateTime(trip.start_time)}
        </p>
        <p>
          <strong className="text-teal-400">End:</strong> {formatDateTime(trip.end_time)}
        </p>
      </div>
      <div className="text-lg text-gray-100 font-bold mb-2">
        Car: <span className="text-teal-300">{formatLicensePlate(trip.car_license_plate)}</span>
      </div>
      <div className="text-sm text-gray-300 mb-2">
        Distance:{" "}
        <span className="text-purple-400 font-semibold">
          {formatPlaceholder(trip.distance, "km")}
        </span>
      </div>
      <div className="text-sm text-gray-300">
        Driving Behavior:{" "}
        <span className={`font-semibold ${
          trip.driving_behavior != null
            ? trip.driving_behavior <= 0.7
              ? "text-green-400"
              : trip.driving_behavior <= 0.8
              ? "text-orange-400"
              : "text-red-400"
            : "text-gray-400"
        }`}>
          {formatPlaceholder(trip.driving_behavior ?? "N/A")}
        </span>
      </div>
    </div>
  );
};

export default TripCard;
