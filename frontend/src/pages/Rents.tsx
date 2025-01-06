import React, { useEffect, useState } from "react";
import { getAvailableCars, Car } from "../services/carsApi";
import { startTrip, getActiveTrip } from "../services/tripsApi";
import ActiveTripPopup from "../components/ActiveTripPopup";
import RentCard from "../components/RentCard";
import { useRefresh } from "../contexts/RefreshContext";
import { useAuth } from "../contexts/AuthContext";
import { Helmet } from "react-helmet";
import Loader from "../components/Loader";

const Rent: React.FC = () => {
  const { triggerRefresh } = useRefresh();
  const { isAuthenticated, isAdmin } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);

  const fetchCars = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailableCars(page, 6);
      setCars(data.data || []);
      setCurrentPage(data.meta.current_page);
      setTotalPages(data.meta.total_pages);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch available cars.");
    } finally {
      setLoading(false);
    }
  };

  const checkActiveTrip = async () => {
    try {
      const activeTrip = await getActiveTrip();
      setHasActiveTrip(!!activeTrip);
    } catch (err: any) {
      if (err.response?.data?.error === "no active trip found") {
        setHasActiveTrip(false);
      } else {
        setError("Failed to check active trip.");
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      fetchCars(currentPage);
      return;
    }
    if (!hasActiveTrip) {
      fetchCars(currentPage);
    }
    checkActiveTrip();
  }, [currentPage, hasActiveTrip, isAuthenticated]);

  const handleRent = async (license_plate: string) => {
    try {
      await startTrip(license_plate);
      alert("Ride started successfully!");
      triggerRefresh();
      checkActiveTrip();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to start the ride.");
    }
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="mt-6 max-w-6xl mx-auto p-4">
      <Helmet>
        <title>DataDrive - Rents</title>
      </Helmet>
      <h2 className="text-3xl font-bold mb-6 text-center text-teal-400">Available Cars</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {hasActiveTrip ? (
        <div className="text-center text-gray-400">
          <p className="text-lg font-medium">You have an active ride ongoing.</p>
          <p>Please complete your current ride before renting another car.</p>
        </div>
      ) : loading ? (
        <div className="text-center text-gray-500">Loading cars...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <RentCard
                key={car.license_plate}
                car={car}
                isAdmin={isAdmin}
                handleRent={handleRent}
              />
            ))}
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                currentPage === totalPages
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-teal-500 text-white hover:bg-teal-600"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
      {isAuthenticated && <ActiveTripPopup />}
    </div>
  );
};

export default Rent;
