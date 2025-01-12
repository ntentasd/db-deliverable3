import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCarByLicensePlate, updateCar } from "../services/carsApi";
import { Helmet } from "react-helmet";
import ErrorMessage from "../components/ErrorMessage";
import { capitalizeFirstLetter } from "../services/formatUtils";

const EditCar: React.FC = () => {
  const { license_plate } = useParams<{ license_plate: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    license_plate: "",
    make: "",
    model: "",
    status: "AVAILABLE",
    costPerKm: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carData = await getCarByLicensePlate(license_plate!);
        setFormData({
          license_plate: carData.license_plate,
          make: carData.make,
          model: carData.model,
          status: carData.status,
          costPerKm: carData.cost_per_km.toString(),
          location: carData.location,
        });
        setLoading(false);
      } catch (err: any) {
        setError("Failed to load car data.");
        setLoading(false);
      }
    };

    fetchCar();
  }, [license_plate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedCar = {
        license_plate: formData.license_plate,
        make: formData.make,
        model: formData.model,
        status: formData.status,
        cost_per_km: parseFloat(formData.costPerKm.replace(",", ".")),
        location: formData.location,
      };

      await updateCar(updatedCar);
      alert("Car updated successfully!");
      navigate("/cars");
    } catch (error: any) {
      console.error(error);
      setError(error.response?.data?.error);
    }
  };

  if (loading) return <p className="text-center text-teal-400 mt-6">Loading...</p>;
  if (error) {
    return <ErrorMessage error={capitalizeFirstLetter(error)} onRetry={() => window.location.reload()} />;
  }
  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow-md">
      <Helmet>
        <title>DataDrive - Edit {formData.license_plate}</title>
      </Helmet>
      <h2 className="text-2xl font-bold text-teal-400 mb-6">Edit Car</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled
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
          <label className="block text-sm font-medium text-gray-300">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 mt-1 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
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
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditCar;
