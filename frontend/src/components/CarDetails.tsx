import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCarReviews, Review } from "../services/reviewsApi";
import { Damage, getDamagesPaginated } from "../services/damagesApi";
import { getServicesPaginated, Service } from "../services/servicesApi";
import { FaStar, FaRegStar } from "react-icons/fa";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ErrorMessage from "../components/ErrorMessage";

const CarDetails: React.FC = () => {
  const { license_plate } = useParams<{ license_plate: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [damages, setDamages] = useState<Damage[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [currentPageReviews, setCurrentPageReviews] = useState(1);
  const [totalPagesReviews, setTotalPagesReviews] = useState(1);

  const [currentPageServices, setCurrentPageServices] = useState(1);
  const [totalPagesServices, setTotalPagesServices] = useState(1);

  const [currentPageDamages, setCurrentPageDamages] = useState(1);
  const [totalPagesDamages, setTotalPagesDamages] = useState(1);

  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingDamages, setLoadingDamages] = useState(false);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchReviews = async (page: number) => {
    try {
      setLoadingReviews(true);
      const [response] = await Promise.all([
        getCarReviews(license_plate!, page, 5),
        delay(500),
      ]);
      setReviews(response.data.reviews || []);
      setTotalPagesReviews(response.meta.total_pages || 1);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError("Failed to load reviews.");
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchDamages = async (page: number) => {
    try {
      setLoadingDamages(true);
      const [response] = await Promise.all([
        getDamagesPaginated(license_plate!, page),
        delay(500),
      ]);
      setDamages(response.data.damages || []);
      setTotalPagesDamages(response.meta.total_pages || 1);
    } catch (err) {
      console.error("Failed to fetch damages:", err);
      setError("Failed to load damages.");
    } finally {
      setLoadingDamages(false);
    }
  };

  const fetchServices = async (page: number) => {
    try {
      setLoadingServices(true);
      const [response] = await Promise.all([
        getServicesPaginated(license_plate!, page),
        delay(500),
      ]);
      setServices(response.data.services || []);
      setTotalPagesServices(response.meta.total_pages || 1);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load services.");
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPageReviews);
    fetchDamages(currentPageDamages);
    fetchServices(currentPageServices);
  }, [license_plate, currentPageReviews, currentPageDamages, currentPageServices]);

  const renderStars = (rating: number | null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= (rating || 0) ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-gray-400" />
        )
      );
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  const cardHeight = "h-[120px]"; // Fixed height for all cards

  const renderSection = (
    data: any[],
    loading: boolean,
    cardCount: number,
    renderContent: (item: any, index: number) => JSX.Element
  ) => {
    return Array.from({ length: cardCount }).map((_, index) => {
      if (loading) {
        // Show skeletons while loading
        return (
          <div
            key={`skeleton-${index}`}
            className={`border border-gray-700 rounded-lg p-4 bg-gray-800 animate-pulse ${cardHeight}`}
          >
            <div className="h-6 w-1/2 bg-gray-600 rounded mb-4"></div>
            <div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
          </div>
        );
      } else if (index < data.length) {
        return renderContent(data[index], index);
      } else {
        return (
          <div
            key={`placeholder-${index}`}
            className={`border border-gray-700 rounded-lg p-4 bg-gray-800 ${cardHeight}`}
          />
        );
      }
    });
  };

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
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded transition"
      >
        &larr; Back to Rent
      </button>

      <div className="flex flex-row gap-6">
        {/* Left Column: Reviews */}
        <div className="w-full lg:w-1/2 space-y-4">
          <h2 className="text-2xl font-bold text-teal-400 text-center pb-2">Reviews</h2>
          <div className="space-y-4">
            {renderSection(
              reviews,
              loadingReviews,
              5,
              (review, index) => (
                <div
                  key={index}
                  className={`border border-gray-700 rounded-lg p-4 bg-gray-800 ${cardHeight}`}
                >
                  {renderStars(review.rating)}
                  <p className="text-sm text-gray-400 mt-2">
                    <strong>Comment:</strong> {review.comment || "No comment"}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Created At:</strong> {new Date(review.created_at!).toLocaleString()}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Pagination Controls for Reviews */}
          <div className="flex justify-between items-center mt-6">
            {renderPaginationButton(
              currentPageReviews === 1,
              () => setCurrentPageReviews((prev) => Math.max(prev - 1, 1)),
              <FaArrowLeft size={18} className="text-white" />
            )}
            <span className="text-gray-300">
              Page {currentPageReviews} of {totalPagesReviews}
            </span>
            {renderPaginationButton(
              currentPageReviews === totalPagesReviews,
              () => setCurrentPageReviews((prev) => Math.min(prev + 1, totalPagesReviews)),
              <FaArrowRight size={18} className="text-white" />
            )}
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="hidden lg:block border-l border-gray-700"></div>

        {/* Right Column: Services and Damages */}
        <div className="w-full lg:w-1/2 space-y-4">
          <h2 className="text-2xl font-bold text-teal-400 text-center pb-2">Services</h2>
          <div className="space-y-4">
            {renderSection(
              services,
              loadingServices,
              3,
              (service, index) => (
                <div
                  key={index}
                  className={`border border-gray-700 rounded-lg p-4 bg-gray-800 ${cardHeight}`}
                >
                  <p><strong>Service:</strong> {service.description}</p>
                  <p><strong>Date:</strong> {new Date(service.service_date).toLocaleDateString()}</p>
                </div>
              )
            )}
          </div>

          {/* Pagination Controls for Services */}
          <div className="flex justify-between items-center mt-6">
            {renderPaginationButton(
              currentPageServices === 1,
              () => setCurrentPageServices((prev) => Math.max(prev - 1, 1)),
              <FaArrowLeft size={18} className="text-white" />
            )}
            <span className="text-gray-300">
              Page {currentPageServices} of {totalPagesServices}
            </span>
            {renderPaginationButton(
              currentPageServices === totalPagesServices,
              () => setCurrentPageServices((prev) => Math.min(prev + 1, totalPagesServices)),
              <FaArrowRight size={18} className="text-white" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-teal-400 text-center pb-2">Damages</h2>
          <div className="space-y-4">
            {renderSection(
              damages,
              loadingDamages,
              3,
              (damage, index) => (
                <div
                  key={index}
                  className={`border border-gray-700 rounded-lg p-4 bg-gray-800 ${cardHeight}`}
                >
                  <p><strong>Damage:</strong> {damage.description}</p>
                  <p><strong>Date:</strong> {new Date(damage.reported_date).toLocaleDateString()}</p>
                </div>
              )
            )}
          </div>

          {/* Pagination Controls for Damages */}
          <div className="flex justify-between items-center mt-6">
            {renderPaginationButton(
              currentPageDamages === 1,
              () => setCurrentPageDamages((prev) => Math.max(prev - 1, 1)),
              <FaArrowLeft size={18} className="text-white" />
            )}
            <span className="text-gray-300">
              Page {currentPageDamages} of {totalPagesDamages}
            </span>
            {renderPaginationButton(
              currentPageDamages === totalPagesDamages,
              () => setCurrentPageDamages((prev) => Math.min(prev + 1, totalPagesDamages)),
              <FaArrowRight size={18} className="text-white" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;
