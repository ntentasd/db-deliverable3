import React, { useEffect, useState } from "react";
import { getTrips, Trip } from "../services/tripsApi";
import TripCard from "./TripCard";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchTrips = async (page: number) => {
    try {
      setLoading(true);
      const [data] = await Promise.all([
        getTrips(page, 5),
        delay(500),
      ]);
      setTrips(data.data || []);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.total_pages);
    } catch (err: any) {
      setError(err.message || "Failed to fetch trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(currentPage);
  }, [currentPage]);

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

  const filteredTrips = trips.filter((trip) => trip.end_time !== undefined);

  const renderSkeleton = () => (
    Array.from({ length: 5 }).map((_, index) => (
      <div
        key={`skeleton-trip-${index}`}
        className="border border-gray-700 rounded-lg p-6 bg-gray-800 animate-pulse h-[150px]"
      >
        <div className="h-6 w-1/3 bg-gray-600 rounded mb-4"></div>
        <div className="h-4 w-1/2 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-700 rounded"></div>
      </div>
    ))
  );

  const renderPaginationButton = (
    disabled: boolean,
    onClick: () => void,
    icon: JSX.Element
  ) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-full ${
        disabled
          ? "bg-gray-600 cursor-not-allowed"
          : "bg-gray-700 hover:bg-teal-600 transition"
      }`}
    >
      {icon}
    </button>
  );

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="mt-6">
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {renderSkeleton()}
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
          {/* Ensure consistent layout with placeholders */}
          {Array.from({ length: 5 - filteredTrips.length }).map((_, index) => (
            <div
              key={`placeholder-trip-${index}`}
              className="border border-gray-700 rounded-lg p-6 bg-gray-800 h-[150px]"
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-6">
          No trips available. Start by booking your first trip!
        </div>
      )}

      {/* Pagination Controls */}
      {filteredTrips.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          {renderPaginationButton(
            currentPage === 1,
            handlePreviousPage,
            <FaArrowLeft size={18} className="text-white" />
          )}
          <span className="text-gray-300 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          {renderPaginationButton(
            currentPage === totalPages,
            handleNextPage,
            <FaArrowRight size={18} className="text-white" />
          )}
        </div>
      )}
    </div>
  );
};

export default TripList;
