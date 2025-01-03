import React, { useEffect, useState } from "react";
import { getAvailableCars, Car } from "../services/carsApi";
import { startTrip, getActiveTrip } from "../services/tripsApi";
import ActiveTripPopup from "../components/ActiveTripPopup";
import { useRefresh } from "../contexts/RefreshContext";
import { isAdminJWT } from "../services/authUtils";
import { Helmet } from "react-helmet";

const Rent: React.FC = () => {
  const { triggerRefresh } = useRefresh();
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);

  const isAuthenticated = !!localStorage.getItem("authToken");

  const isAdmin = !!isAdminJWT();

  const fetchCars = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAvailableCars(page, 5);
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
  }, [currentPage, hasActiveTrip]);

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

  const handleTripEnd = () => {
    setHasActiveTrip(false);
    fetchCars(currentPage);
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

  return (
    <div className="mt-6 max-w-6xl mx-auto p-4">
      <Helmet>
        <title>DataDrive - Rents</title>
      </Helmet>
      <h2 className="text-2xl font-bold mb-6 text-center">Available Cars</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {hasActiveTrip ? (
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium">You have an active ride ongoing.</p>
          <p>Please complete your current ride before renting another car.</p>
        </div>
      ) : loading ? (
        <div className="text-center text-gray-600">Loading cars...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car.license_plate} className="border rounded-lg shadow p-4">
                <h3 className="text-xl font-semibold">
                  {car.make} {car.model}
                </h3>
                <p>
                  <strong>License Plate:</strong> {car.license_plate}
                </p>
                <p>
                  <strong>Cost per KM:</strong> ${car.cost_per_km}
                </p>
                <p>
                  <strong>Location:</strong> {car.location}
                </p>
                <button
                  onClick={() => handleRent(car.license_plate)}
                  disabled={isAdmin}
                  title={isAdmin ? "You cannot rent as admin" : "Rent this car"}
                  className={`w-full mt-4 p-2 rounded ${
                    isAdmin
                      ? "bg-gray-400 text-gray-800 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Rent
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
      {/* <ActiveTripPopup onRefresh={handleTripEnd} /> */}
      {isAuthenticated ? (
        <ActiveTripPopup onRefresh={handleTripEnd} />
      ) : (
        <></>
      )}
    </div>
  );
};

export default Rent;
