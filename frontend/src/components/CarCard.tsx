import React from "react";
import { useNavigate } from "react-router-dom";
import { formatLicensePlate } from "../services/formatUtils";

interface CarCardProps {
  car: {
    license_plate: string;
    make: string;
    model: string;
    status: string;
    location: string;
    cost_per_km: number;
  };
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const navigate = useNavigate();

  const getStatusClass = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-green-400 font-semibold";
      case "RENTED":
        return "text-orange-400 font-semibold";
      case "MAINTENANCE":
        return "text-red-400 font-semibold";
      default:
        return "text-gray-500";
    }
  };

  return (
    <li
      className="h-[170px] flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg hover:bg-gray-700 transition"
      onClick={() => navigate(`/cars/${car.license_plate}`)}
    >
      {/* Car Details */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-teal-400">
          {car.make} {car.model}
        </h3>
        <p className="text-gray-400">
          Status: <span className={getStatusClass(car.status)}>{car.status}</span>
        </p>
        <p className="text-gray-400">
          Location: <span className="font-medium">{car.location}</span>
        </p>
        <p className="text-gray-400">
          Cost Per KM: <span className="font-medium">{car.cost_per_km}€</span>
        </p>
      </div>

      <div className="flex flex-col items-center">
        <h3 className="text-lg font-bold text-purple-400 mb-6 pt-2">{formatLicensePlate(car.license_plate)}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/cars/${car.license_plate}/edit`);
          }}
          className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600"
        >
          Edit
        </button>
      </div>
    </li>
  );
};

export default CarCard;
