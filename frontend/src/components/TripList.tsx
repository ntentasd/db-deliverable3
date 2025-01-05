import React, { useEffect, useState } from "react";
import { getTripsPaginated, Trip } from "../services/tripsApi";
import TripCard from "./TripCard";

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async (page: number) => {
    try {
      const data = await getTripsPaginated(page, 5);
      setTrips(data.data || []);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.total_pages);
    } catch (err: any) {
      setError(err.message || "Failed to fetch trips.");
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

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="mt-6">
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-6">
          No trips available. Start by booking your first trip!
        </div>
      )}
      {filteredTrips.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-300 ${
              currentPage === 1
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600"
            }`}
          >
            Previous
          </button>
          <span className="text-gray-300 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-300 ${
              currentPage === totalPages
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TripList;
