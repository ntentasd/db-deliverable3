import React from "react";
import { Trip } from "../services/tripsApi";
import { formatPlaceholder, formatDateTime, formatLicensePlate } from "../services/formatUtils";
import { FaCreditCard, FaBitcoin, FaRegMoneyBillAlt } from "react-icons/fa";

interface TripCardProps {
  trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const getPaymentIcon = (method: string | null) => {
    if (!method) return null;
    switch (method.toLowerCase()) {
      case "card":
        return <FaCreditCard className="text-blue-400" />;
      case "crypto":
        return <FaBitcoin className="text-yellow-500" />;
      case "subscription":
        return <FaRegMoneyBillAlt className="text-green-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-700 flex justify-between">
      <div>
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
              ? trip.driving_behavior <= 7
                ? "text-green-400"
                : trip.driving_behavior <= 8.5
                ? "text-orange-400"
                : "text-red-400"
              : "text-gray-400"
          }`}>
            {formatPlaceholder(trip.driving_behavior ?? "N/A")}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <div className="text-sm text-gray-300">
          <span className="font-semibold text-gray-100">Amount:</span>{" "}
          <span className="text-yellow-300 font-bold">
            {trip.amount != null ? `${trip.amount.toFixed(2)} $` : `N/A`}
          </span>
        </div>
        <div className="flex items-center mt-2">
          {trip.payment_method ? getPaymentIcon(trip.payment_method) : null}
          <span className="ml-2 text-gray-100 font-medium capitalize">
            {trip.payment_method ?? "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
