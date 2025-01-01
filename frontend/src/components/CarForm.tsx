import React, { useState } from "react";
import { addCar } from "../services/api";

interface CarFormProps {
  onInsert: () => void; // Add this prop to refresh the car list
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
        cost_per_km: parseFloat(
          formData.costPerKm.replace(",", ".") // Handle both comma and dot for decimals
        ),
        location: formData.location,
      };

      await addCar(newCar); // Call the API to add the car
      alert("Car added successfully!");

      // Clear the form
      setFormData({
        license_plate: "",
        make: "",
        model: "",
        status: "AVAILABLE",
        costPerKm: "",
        location: "",
      });

      onInsert(); // Refresh the car list
    } catch (error) {
      console.error("Failed to add car:", error);
      alert("Failed to add car.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded shadow">
      <h2 className="text-xl font-bold">Add a New Car</h2>
      <div>
        <label className="block text-sm font-medium">License Plate</label>
        <input
          type="text"
          name="license_plate"
          value={formData.license_plate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Make</label>
        <input
          type="text"
          name="make"
          value={formData.make}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Model</label>
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Cost Per KM</label>
        <input
          type="text"
          name="costPerKm"
          value={formData.costPerKm}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Add Car
      </button>
    </form>
  );
};

export default CarForm;
