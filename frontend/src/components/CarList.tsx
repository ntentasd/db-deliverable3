import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Car {
  license_plate: string;
  make: string;
  model: string;
  status: string;
  cost_per_km: string; // Changed to match backend naming convention
  location: string;
}

interface CarListProps {
  cars: Car[]; // List of cars passed as a prop
}

const CarList: React.FC<CarListProps> = ({ cars }) => {
  const [filter, setFilter] = useState<string>("All");

  const navigate = useNavigate();

  const handleFilterChange = (status: string) => {
    setFilter(status);
  }

  const filteredCars = filter === "All" ? cars : cars.filter((car) => car.status === filter);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-green-600 font-semibold";
      case "RENTED":
        return "text-orange-500 font-semibold";
      case "MAINTENANCE":
        return "text-red-500 font-semibold";
      default:
        return "text-gray-600";
    }
  };


  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => handleFilterChange("All")}
          className={`px-4 py-2 rounded-md ${filter === "All" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange("AVAILABLE")}
          className={`px-4 py-2 rounded-md ${filter === "AVAILABLE" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          Available
        </button>
        <button
          onClick={() => handleFilterChange("RENTED")}
          className={`px-4 py-2 rounded-md ${filter === "RENTED" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          Rented
        </button>
        <button
          onClick={() => handleFilterChange("MAINTENANCE")}
          className={`px-4 py-2 rounded-md ${filter === "MAINTENANCE" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          Maintenance
        </button>
      </div>

      {/* Car List */}
      <ul className="space-y-4">
        {filteredCars.map((car) => (
          <li
            key={car.license_plate}
            className="border rounded-lg p-4 shadow hover:bg-gray-50 hover:cursor-pointer flex items-center justify-between"
            onClick={() => navigate(`/cars/${car.license_plate}`)}
          >
            <div
              className="flex-1 cursor-pointer hover:cursor-pointer"
            >
              <h3 className="text-lg font-bold">
                {car.make} {car.model}
              </h3>
              <p className="text-gray-600">
                Status: <span className={`font-medium mt-2 ${getStatusClass(car.status)}`}>{car.status}</span>
              </p>
              <p className="text-gray-600">
                Location: <span className="font-medium">{car.location}</span>
              </p>
              <p className="text-gray-600">
                Cost Per KM: <span className="font-medium">{car.cost_per_km}€</span>
              </p>
            </div>
            <div className="text-right flex flex-col px-2 space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the div's onClick
                  navigate(`/cars/${car.license_plate}/edit`);
                }}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <div className="flex flex-col text-center">
                <h4 className="text-gray-500 font-medium">License Plate:</h4>
                <p className="text-lg font-bold">{car.license_plate}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CarList;
