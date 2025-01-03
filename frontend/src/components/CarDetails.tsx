import React from "react";
import { Damage } from "../services/damagesApi";
import { Service } from "../services/servicesApi";
import { Car } from "../services/carsApi";

interface CarDetailsProps {
  car: Car;
  damages: Damage[];
  services: Service[];
}

const CarDetails: React.FC<CarDetailsProps> = ({ car, damages, services }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-green-600 font-semibold";
      case "RENTED":
        return "text-orange-500 font-semibold";
      case "MAINTENANCE":
        return "text-red-500 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Car Details</h1>

      {/* General Info */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">General Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>License Plate:</strong> {car.license_plate}</p>
          <p><strong>Make:</strong> {car.make}</p>
          <p><strong>Model:</strong> {car.model}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={getStatusClass(car.status)}>{car.status}</span>
          </p>
          <p><strong>Cost Per KM:</strong> {car.cost_per_km}€</p>
          <p><strong>Location:</strong> {car.location}</p>
        </div>
      </div>

      {/* Damages */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Damages</h2>
        {damages && damages.length > 0 ? (
          <ul className="space-y-4">
            {damages.map((damage, index) => (
              <li key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                <p><strong>Description:</strong> {damage.description}</p>
                <p><strong>Reported Date:</strong> {damage.reported_date}</p>
                <p><strong>Repair Cost:</strong> {damage.repair_cost}€</p>
                <p>
                  <strong>Repaired:</strong>{" "}
                  {damage.repaired ? "Yes" : "No"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No damages reported for this car.</p>
        )}
      </div>

      {/* Services */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Services</h2>
        {services && services.length > 0 ? (
          <ul className="space-y-4">
            {services.map((service, index) => (
              <li key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                <p><strong>Description:</strong> {service.description}</p>
                <p><strong>Service Date:</strong> {service.service_date}</p>
                <p><strong>Service Cost:</strong> {service.service_cost}€</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No services recorded for this car.</p>
        )}
      </div>
    </div>
  );
};

export default CarDetails;
