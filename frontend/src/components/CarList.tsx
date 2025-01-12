import React, { useCallback, useEffect, useState } from "react";
import { Car, getAllCars, getAvailableCars, getRentedCars, getMaintenanceCars } from "../services/carsApi";
import CarCard from "./CarCard";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ErrorMessage from "./ErrorMessage";

interface CarListProps {
  setOnInsertHandler: (handler: () => void) => void;
}

const CarList: React.FC<CarListProps> = ({ setOnInsertHandler }) => {
  const [filter, setFilter] = useState<string>("All");
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchCars = useCallback(async (page: number, filter: string) => {
    setLoading(true);
    try {
      let data;
      await delay(500);
      switch (filter) {
        case "AVAILABLE":
          data = await getAvailableCars(page, 5);
          break;
        case "RENTED":
          data = await getRentedCars(page, 5);
          break;
        case "MAINTENANCE":
          data = await getMaintenanceCars(page, 5);
          break;
        default:
          data = await getAllCars(page, 5);
      }
      setCars(data.data);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.total_pages);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch cars.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInsert = useCallback(() => {
    fetchCars(currentPage, filter);
  }, [fetchCars, currentPage, filter]);

  useEffect(() => {
    fetchCars(currentPage, filter);
    setOnInsertHandler(handleInsert);
  }, [fetchCars, currentPage, filter, handleInsert, setOnInsertHandler]);

  const handleFilterChange = (status: string) => {
    setFilter(status);
    setCurrentPage(1);
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

  const renderSkeletons = () =>
    Array.from({ length: 5 }).map((_, index) => (
      <div
        key={`skeleton-card-${index}`}
        className="h-[170px] border border-gray-700 rounded-lg p-4 bg-gray-800 animate-pulse"
      >
        <div className="h-5 w-1/6 bg-gray-600 rounded mb-4 mt-3"></div>
        <div className="h-3 w-1/5 bg-gray-700 rounded mb-5"></div>
        <div className="h-3 w-[11%] bg-gray-700 rounded mb-5"></div>
        <div className="h-3 w-[14%] bg-gray-700 rounded"></div>
      </div>
    ));

  if (error) {
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
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
        {loading ? (
          renderSkeletons()
        ) : (
          Array.from({ length: 5 }).map((_, index) => {
            if (index < cars.length) {
              return <CarCard key={cars[index].license_plate} car={cars[index]} />;
            }
            return (
              <div
                key={`placeholder-card-${index}`}
                className="h-[170px] border border-gray-700 rounded-lg p-4 bg-gray-800"
              />
            );
          })
        )}
      </ul>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6 h-10">
        {loading ? (
          <div className="w-16" />
        ) : (
          <>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-gray-700 hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaArrowLeft size={18} className="text-white" />
          </button>
          <span className="text-gray-400 font-medium">
            {loading ? <span className="w-16 bg-gray-700 animate-pulse inline-block" /> : `Page ${currentPage} of ${totalPages}`}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-gray-700 hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaArrowRight size={18} className="text-white" />
          </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CarList;
