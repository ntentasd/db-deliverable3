import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getServicesPaginated } from "../services/servicesApi";
import { getDamagesPaginated } from "../services/damagesApi";
import { Helmet } from "react-helmet";

const CarDetailsWrapper: React.FC = () => {
  const { license_plate } = useParams<{ license_plate: string }>();

  const [services, setServices] = useState<any[]>([]);
  const [damages, setDamages] = useState<any[]>([]);

  const [servicePage, setServicePage] = useState(1);
  const [damagePage, setDamagePage] = useState(1);

  const [serviceTotalPages, setServiceTotalPages] = useState(1);
  const [damageTotalPages, setDamageTotalPages] = useState(1);

  const fetchServices = useCallback(async () => {
    try {
      const response = await getServicesPaginated(license_plate!, servicePage, 2);
      setServices(response.data.services);
      setServiceTotalPages(response.meta.total_pages);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  }, [license_plate, servicePage]);

  const fetchDamages = useCallback(async () => {
    try {
      const response = await getDamagesPaginated(license_plate!, damagePage, 2);
      setDamages(response.data.damages);
      setDamageTotalPages(response.meta.total_pages);
    } catch (err) {
      console.error("Failed to fetch damages:", err);
    }
  }, [license_plate, damagePage]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchDamages();
  }, [fetchDamages]);

  const servicePaginationControls = useMemo(() => (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setServicePage((prev) => Math.max(prev - 1, 1))}
        disabled={servicePage === 1}
        className={`px-4 py-2 rounded ${
          servicePage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Previous
      </button>
      <span className="text-gray-600">
        Page {servicePage} of {serviceTotalPages}
      </span>
      <button
        onClick={() => setServicePage((prev) => Math.min(prev + 1, serviceTotalPages))}
        disabled={servicePage === serviceTotalPages}
        className={`px-4 py-2 rounded ${
          servicePage === serviceTotalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Next
      </button>
    </div>
  ), [servicePage, serviceTotalPages]);

  const damagePaginationControls = useMemo(() => (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setDamagePage((prev) => Math.max(prev - 1, 1))}
        disabled={damagePage === 1}
        className={`px-4 py-2 rounded ${
          damagePage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Previous
      </button>
      <span className="text-gray-600">
        Page {damagePage} of {damageTotalPages}
      </span>
      <button
        onClick={() => setDamagePage((prev) => Math.min(prev + 1, damageTotalPages))}
        disabled={damagePage === damageTotalPages}
        className={`px-4 py-2 rounded ${
          damagePage === damageTotalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Next
      </button>
    </div>
  ), [damagePage, damageTotalPages]);

  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>DataDrive - {license_plate}'s Details</title>
      </Helmet>
      <h2 className="text-2xl font-bold mb-4">Car Details - {license_plate}</h2>

      <h3 className="text-xl font-semibold mt-6">Services</h3>
      <ul className="space-y-4">
        {services.map((service) => (
          <li
            key={service.id}
            className="border p-4 rounded shadow hover:shadow-lg"
          >
            <p className="text-gray-600">
              <strong>Date:</strong> {new Date(service.service_date).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              <strong>Description:</strong> {service.description || "N/A"}
            </p>
            <p className="text-gray-600">
              <strong>Cost:</strong> {service.service_cost}€
            </p>
          </li>
        ))}
      </ul>
      {servicePaginationControls}

      <h3 className="text-xl font-semibold mt-6">Damages</h3>
      <ul className="space-y-4">
        {damages.map((damage) => (
          <li
            key={damage.id}
            className="border p-4 rounded shadow hover:shadow-lg"
          >
            <p className="text-gray-600">
              <strong>Date:</strong> {new Date(damage.reported_date).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              <strong>Description:</strong> {damage.description || "N/A"}
            </p>
            <p className="text-gray-600">
              <strong>Repaired:</strong> {damage.repaired ? "Yes" : "No"}
            </p>
            <p className="text-gray-600">
              <strong>Cost:</strong> {damage.repair_cost}€
            </p>
          </li>
        ))}
      </ul>
      {damagePaginationControls}
    </div>
  );
};

export default CarDetailsWrapper;