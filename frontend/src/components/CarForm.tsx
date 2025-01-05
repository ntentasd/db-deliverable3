import React, { useState } from "react";
import { addCar } from "../services/carsApi";

interface CarFormProps {
  onInsert?: () => void;
}

const CarForm: React.FC<CarFormProps> = ({ onInsert }) => {
  const [formData, setFormData] = useState({
    license_plate: "",
    make: "",
    model: "",
    status: "AVAILABLE",
    costPerKm: "",
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCar = {
        license_plate: formData.license_plate,
        make: formData.make,
        model: formData.model,
        status: formData.status,
        cost_per_km: parseFloat(formData.costPerKm.replace(",", ".")),
        location: formData.location,
      };

      await addCar(newCar);
      alert("Car added successfully!");
      setFormData({
        license_plate: "",
        make: "",
        model: "",
        status: "AVAILABLE",
        costPerKm: "",
        location: "",
      });

      if (onInsert) onInsert();
    } catch (error) {
      console.error("Failed to add car:", error);
      alert("Failed to add car.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-2xl font-bold text-teal-400">Add a New Car</h2>
      <div>
        <label className="block text-sm font-medium text-gray-300">
          License Plate
        </label>
        <input
          type="text"
          name="license_plate"
          value={formData.license_plate}
          onChange={handleChange}
          className="w-full p-2 mt-1 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Make</label>
        <input
          type="text"
          name="make"
          value={formData.make}
          onChange={handleChange}
          className="w-full p-2 mt-1 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Model</label>
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          className="w-full p-2 mt-1 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">
          Cost Per KM
        </label>
        <input
          type="text"
          name="costPerKm"
          value={formData.costPerKm}
          onChange={handleChange}
          className="w-full p-2 mt-1 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 mt-1 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
      >
        Add Car
      </button>
    </form>
  );
};

export default CarForm;
