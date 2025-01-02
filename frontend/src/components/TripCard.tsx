import React from "react";

interface TripCardProps {
  trip: {
    id: number;
    user_email: string;
    car_license_plate: string;
    start_time: string;
    end_time: string | null;
    driving_behavior: number | null | undefined;
    distance: number | null | undefined;
  };
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const formatDateTime = (dateTime: string | null): string => {
    if (!dateTime) return "Ongoing";
    const date = new Date(dateTime);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
  };

  const formatPlaceholder = (value: number | null | undefined, unit?: string): string => {
    return value == null ? "Not yet calculated" : `${value}${unit ? ` ${unit}` : ""}`;
  };

  return (
    <div className="border p-4 rounded shadow hover:shadow-lg transition duration-200">
      <div className="text-sm text-gray-600 mb-2">
        <strong>Start:</strong> {formatDateTime(trip.start_time)} <br />
        <strong>End:</strong> {formatDateTime(trip.end_time)}
      </div>
      <div className="text-gray-800 font-medium">
        Car: <span className="font-semibold">{trip.car_license_plate}</span>
      </div>
      <div className="text-gray-800">
        User: <span className="font-semibold">{trip.user_email}</span>
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
