import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, getAllCarsPaginated } from "../services/carsApi";

interface CarListProps {
  setOnInsertHandler: (handler: () => void) => void;
}

const CarList: React.FC<CarListProps> = ({ setOnInsertHandler }) => {
  const [filter, setFilter] = useState<string>("All");
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  const fetchCars = useCallback(async (page: number) => {
    try {
      const data = await getAllCarsPaginated(page, 5);
      setCars(data.data);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.total_pages);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const handleInsert = useCallback(() => {
    fetchCars(currentPage);
  }, [fetchCars, currentPage]);

  useEffect(() => {
    fetchCars(currentPage);

    setOnInsertHandler(handleInsert);
  }, [fetchCars, currentPage, handleInsert]);

  const handleFilterChange = (status: string) => {
    setFilter(status);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

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

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex space-x-4 mb-4">
        {["All", "AVAILABLE", "RENTED", "MAINTENANCE"].map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`px-4 py-2 rounded-md ${
              filter === status ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Car List */}
      <ul className="space-y-4">
        {filteredCars.map((car) => (
          <li
            key={car.license_plate}
            className="border rounded-lg p-4 shadow hover:bg-gray-50 hover:cursor-pointer flex items-center justify-between"
            onClick={() => navigate(`/cars/${car.license_plate}`)}
          >
            <div className="flex-1 cursor-pointer">
              <h3 className="text-lg font-bold">
                {car.make} {car.model}
              </h3>
              <p className="text-gray-600">
                Status: <span className={getStatusClass(car.status)}>{car.status}</span>
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
                  e.stopPropagation();
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white"
          }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CarList;