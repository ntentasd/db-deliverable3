import React, { useEffect, useState } from "react";
import { getAvailableCars, Car } from "../services/carsApi";
import { startTrip, getActiveTrip } from "../services/tripsApi";
import ActiveTripPopup from "../components/ActiveTripPopup";
import RentCard from "../components/RentCard";
import { useRefresh } from "../contexts/RefreshContext";
import { useAuth } from "../contexts/AuthContext";
import { Helmet } from "react-helmet";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/ConfirmationModal";

const Rent: React.FC = () => {
  const { triggerRefresh } = useRefresh();
  // const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const fetchCars = async (page: number) => {
    setLoading(true);
    setError(null);

    const delay = new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const [data] = await Promise.all([getAvailableCars(page, 6), delay]);
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

  const handleRent = (license_plate: string) => {
    const car = cars.find((c) => c.license_plate === license_plate);
    setSelectedCar(car || null);
    setShowModal(true);
  };


  const confirmRent = async () => {
    if (!selectedCar) return;
    try {
      await startTrip(selectedCar.license_plate);
      setShowModal(false);
      triggerRefresh();
      checkActiveTrip();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start the ride.");
      setShowModal(false);
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
      ) : (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-card-${index}`}
                  className="h-[220px] card-container skeleton-loader animate-pulse border border-gray-700 rounded-lg p-6 bg-gray-800"
                >
                  <div className="h-6 w-1/2 bg-gray-600 rounded mb-4"></div>
                  <div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <RentCard
                  car={car}
                  isAdmin={isAdmin}
                  handleRent={handleRent}
                />
              ))}

              {Array.from({ length: 6 - cars.length }).map((_, index) => (
                <div
                  key={`placeholder-card-${index}`}
                  className="h-[220px] border border-gray-700 rounded-lg p-6 bg-gray-800"
                />
              ))}
            </div>
          )}

          {!loading && cars.length > 0 ? (
            <div className="flex justify-between items-center mt-6 h-10">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-2 rounded-full bg-gray-700 hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaArrowLeft size={18} className="text-white" />
              </button>
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full bg-gray-700 hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaArrowRight size={18} className="text-white" />
              </button>
            </div>
          ) : (
            <div className="h-10 mt-6"></div>
          )}
        </>
      )}
      {isAuthenticated && <ActiveTripPopup />}

      {showModal && selectedCar && (
        <ConfirmationModal
          title="Confirm Rental"
          message={
            <>
              Do you want to rent the <span className="text-teal-400">{selectedCar.make} {selectedCar.model}</span> for{" "}
              <span className="text-green-400 font-bold">${selectedCar.cost_per_km}/km </span>?
            </>
          }
          onConfirm={confirmRent}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Rent;
