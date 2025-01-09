import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServicesPaginated, addService } from "../services/servicesApi";
import { getDamagesPaginated, addDamage } from "../services/damagesApi";
import { FaArrowLeft, FaArrowRight, FaPlus } from "react-icons/fa";
import AddModal from "../components/AddModal";
import ErrorMessage from "../components/ErrorMessage";

const CarDetailsWrapper: React.FC = () => {
  const { license_plate } = useParams<{ license_plate: string }>();
  const [services, setServices] = useState<any[]>([]);
  const [damages, setDamages] = useState<any[]>([]);

  const [currentPageServices, setCurrentPageServices] = useState(1);
  const [totalPagesServices, setTotalPagesServices] = useState(1);

  const [currentPageDamages, setCurrentPageDamages] = useState(1);
  const [totalPagesDamages, setTotalPagesDamages] = useState(1);

  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingDamages, setLoadingDamages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"service" | "damage">("service");
  const [formData, setFormData] = useState<{
    date: Date | null;
    description: string;
    cost: number;
    repaired?: boolean;
  }>({
    date: null,
    description: "",
    cost: 0,
    repaired: false,
  });

  const navigate = useNavigate();

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchServices = async (page: number) => {
    try {
      setLoadingServices(true);
      const response = await Promise.all([getServicesPaginated(license_plate!, page, 3), delay(500)]);
      setServices(response[0].data.services || []);
      setTotalPagesServices(response[0].meta.total_pages || 1);
    } catch (err) {
      setError("Failed to load services.");
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchDamages = async (page: number) => {
    try {
      setLoadingDamages(true);
      const response = await Promise.all([getDamagesPaginated(license_plate!, page, 3), delay(500)]);
      setDamages(response[0].data.damages || []);
      setTotalPagesDamages(response[0].meta.total_pages || 1);
    } catch (err) {
      setError("Failed to load damages.");
    } finally {
      setLoadingDamages(false);
    }
  };

  const handleAdd = async () => {
    try {
      if (formData.date) {
        const formattedDate = formData.date.toISOString().split("T")[0];
        if (modalType === "service") {
          await addService(license_plate!, formattedDate, formData.description, formData.cost);
          fetchServices(currentPageServices);
        } else {
          await addDamage(license_plate!, formattedDate, formData.description, formData.repaired || false, formData.cost);
          fetchDamages(currentPageDamages);
        }
        setShowModal(false);
        setError(null);
      } else {
        throw new Error("Date is required.");
      }
    } catch (err) {
      console.error(`Failed to add ${modalType}:`, err);
      setError(`Failed to add ${modalType}.`);
    }
  };

  useEffect(() => {
    fetchServices(currentPageServices);
  }, [currentPageServices]);

  useEffect(() => {
    fetchDamages(currentPageDamages);
  }, [currentPageDamages]);

  const renderSkeleton = (detail: string) => (
    <div className={`border border-gray-700 rounded-lg p-4 bg-gray-800 animate-pulse ${detail === "services" ? "h-[110px]" : "h-[130px]"}`}>
      {detail === "services" ? (
        <>
          <div className="h-3 w-1/3 bg-gray-600 rounded mb-4 mt-1"></div>
          <div className="h-2 w-1/5 bg-gray-700 rounded mb-3"></div>
          <div className="h-3 w-1/4 bg-gray-700 rounded"></div>
        </>
      ) : (
        <>
          <div className="h-3 w-1/3 bg-gray-600 rounded mb-4 mt-1"></div>
          <div className="h-2 w-1/5 bg-gray-700 rounded mb-3"></div>
          <div className="h-3 w-1/4 bg-gray-700 rounded mb-3"></div>
          <div className="h-2 w-2/5 bg-gray-700 rounded"></div>
        </>
      )}
    </div>
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
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
      >
        Back
      </button>

      {/* Services Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-teal-400 text-center pb-2">Services</h2>
          <FaPlus
            className="text-teal-400 cursor-pointer hover:text-teal-500"
            size={25}
            onClick={() => {
              setModalType("service");
              setShowModal(true);
            }}
          />
        </div>
        <div className="space-y-4">
          {loadingServices
            ? Array.from({ length: 3 }).map((_, index) => <div key={index}>{renderSkeleton("services")}</div>)
            : Array.from({ length: 3 }).map((_, index) => {
                if (index < services.length) {
                  const service = services[index];
                  return (
                    <div
                      key={index}
                      className="border border-gray-700 rounded-lg p-4 bg-gray-800 h-[110px]"
                    >
                      <p>
                        <strong>Service:</strong> {service.description}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(service.service_date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Cost:</strong>{" "}
                        <span
                          className={
                            service.service_cost > 100
                              ? "text-red-400 font-bold"
                              : service.service_cost > 50
                              ? "text-yellow-400 font-semibold"
                              : "text-green-400 font-medium"
                          }
                        >
                          {service.service_cost}€
                        </span>
                      </p>
                    </div>
                  );
                }
                return (
                  <div
                    key={`placeholder-service-${index}`}
                    className="border border-gray-700 rounded-lg p-4 bg-gray-800 h-[110px]"
                  />
                );
              })}
        </div>
        <div className="flex justify-between items-center mt-6">
          {renderPaginationButton(
            currentPageServices === 1,
            async () => {
              const newPage = Math.max(currentPageServices - 1, 1);
              setCurrentPageServices(newPage);
              await fetchServices(newPage);
            },
            <FaArrowLeft size={18} className="text-white" />
          )}
          <span className="text-gray-300">
            Page {currentPageServices} of {totalPagesServices}
          </span>
          {renderPaginationButton(
            currentPageServices === totalPagesServices,
            async () => {
              const newPage = Math.min(currentPageServices + 1, totalPagesServices);
              setCurrentPageServices(newPage);
              await fetchServices(newPage);
            },
            <FaArrowRight size={18} className="text-white" />
          )}
        </div>
      </div>

      {/* Damages Section */}
      <div className="space-y-4 mt-12">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-teal-400 text-center pb-2">Damages</h2>
          <FaPlus
            className="text-red-400 cursor-pointer hover:text-red-500"
            size={25}
            onClick={() => {
              setModalType("damage");
              setShowModal(true);
            }}
          />
        </div>
        <div className="space-y-4">
          {loadingDamages
            ? Array.from({ length: 3 }).map((_, index) => <div key={index}>{renderSkeleton("damages")}</div>)
            : Array.from({ length: 3 }).map((_, index) => {
                if (index < damages.length) {
                  const damage = damages[index];
                  return (
                    <div
                      key={index}
                      className="border border-gray-700 rounded-lg p-4 bg-gray-800 h-[130px]"
                    >
                      <p>
                        <strong>Damage:</strong> {damage.description}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(damage.reported_date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Repaired:</strong>{" "}
                        <span
                          className={
                            damage.repaired ? "text-green-400 font-bold" : "text-red-400 font-bold"
                          }
                        >
                          {damage.repaired ? "Yes" : "No"}
                        </span>
                      </p>
                      <p>
                        <strong>Repair Cost:</strong>{" "}
                        <span
                          className={
                            damage.repair_cost > 200
                              ? "text-red-400 font-bold"
                              : "text-green-400 font-medium"
                          }
                        >
                          {damage.repair_cost}€
                        </span>
                      </p>
                    </div>
                  );
                }
                return (
                  <div
                    key={`placeholder-damage-${index}`}
                    className="border border-gray-700 rounded-lg p-4 bg-gray-800 h-[130px]"
                  />
                );
              })}
        </div>
        <div className="flex justify-between items-center mt-6">
          {renderPaginationButton(
            currentPageDamages === 1,
            async () => {
              const newPage = Math.max(currentPageDamages - 1, 1);
              setCurrentPageDamages(newPage);
              await fetchDamages(newPage);
            },
            <FaArrowLeft size={18} className="text-white" />
          )}
          <span className="text-gray-300">
            Page {currentPageDamages} of {totalPagesDamages}
          </span>
          {renderPaginationButton(
            currentPageDamages === totalPagesDamages,
            async () => {
              const newPage = Math.min(currentPageDamages + 1, totalPagesDamages);
              setCurrentPageDamages(newPage);
              await fetchDamages(newPage);
            },
            <FaArrowRight size={18} className="text-white" />
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddModal
          modalType={modalType}
          formData={formData}
          setFormData={setFormData}
          onAdd={handleAdd}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default CarDetailsWrapper;
