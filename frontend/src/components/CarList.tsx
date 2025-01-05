import React, { useCallback, useEffect, useState } from "react";
import { Car, getAllCarsPaginated } from "../services/carsApi";
import CarCard from "./CarCard";

interface CarListProps {
  setOnInsertHandler: (handler: () => void) => void;
}

const CarList: React.FC<CarListProps> = ({ setOnInsertHandler }) => {
  const [filter, setFilter] = useState<string>("All");
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async (page: number) => {
    try {
      const data = await getAllCarsPaginated(page, 5);
      setCars(data.data);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.total_pages);
    } catch (err: any) {
      setError(err.message || "Failed to fetch cars.");
    }
  }, []);

  const handleInsert = useCallback(() => {
    fetchCars(currentPage);
  }, [fetchCars, currentPage]);

  useEffect(() => {
    fetchCars(currentPage);
    setOnInsertHandler(handleInsert);
  }, [fetchCars, currentPage, handleInsert, setOnInsertHandler]);

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

  if (error) {
    return <div className="text-red-500 text-center mt-6">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex space-x-4">
        {["All", "AVAILABLE", "RENTED", "MAINTENANCE"].map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? "bg-teal-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Car List */}
      <ul className="space-y-4">
        {filteredCars.map((car) => (
          <CarCard key={car.license_plate} car={car} />
        ))}
      </ul>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-teal-500 text-white hover:bg-teal-600"
          }`}
        >
          Previous
        </button>
        <span className="text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-teal-500 text-white hover:bg-teal-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CarList;
