import React from "react";
import { Car } from "../services/carsApi";
import { FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface RentCardProps {
  car: Car;
  isAdmin: boolean;
  handleRent: (license_plate: string) => void;
}

const RentCard: React.FC<RentCardProps> = ({ car, isAdmin, handleRent }) => {
  const navigate = useNavigate();

  return (
    <div className="card-container relative border border-gray-700 h-[220px] rounded-lg shadow-lg p-6 bg-gray-800 hover:shadow-xl transition-shadow duration-300">
      {/* Info Icon */}
      <FaInfoCircle
        className="absolute top-4 right-4 text-gray-400 hover:text-teal-400 cursor-pointer"
        size={20}
        title="View car details"
        onClick={() => navigate(`/rent/${car.license_plate}`)}
      />

      {/* Car Details */}
      <div>
        <h3 className="text-xl font-semibold text-gray-100">
          {car.make} {car.model}
        </h3>
        <p className="text-gray-400">
          <strong>License Plate:</strong> {car.license_plate}
        </p>
        <p className="text-gray-400">
          <strong>Cost per KM:</strong> ${car.cost_per_km}
        </p>
        <p className="text-gray-400">
          <strong>Location:</strong> {car.location}
        </p>
      </div>

      {/* Rent Button */}
      <button
        onClick={() => handleRent(car.license_plate)}
        disabled={isAdmin}
        title={isAdmin ? "You cannot rent as admin" : "Rent this car"}
        className={`w-full mt-4 p-3 rounded-lg font-medium text-white transition-colors duration-300 ${
          isAdmin
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-purple-500 hover:bg-purple-600"
        }`}
      >
        Rent
      </button>
    </div>
  );
};

export default RentCard;
