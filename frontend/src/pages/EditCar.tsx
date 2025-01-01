import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCarByLicensePlate, updateCar } from "../services/api";

interface Car {
  license_plate: string;
  make: string;
  model: string;
  status: string;
  cost_per_km: number;
  location: string;
}

const EditCar: React.FC = () => {
  const { license_plate } = useParams<{ license_plate: string }>();
  const navigate = useNavigate();

  const [car, setCar] = useState<Car>({
    license_plate: "",
    make: "",
    model: "",
    status: "",
    cost_per_km: 0,
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch car data on mount
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carData = await getCarByLicensePlate(license_plate!);
        setCar(carData);
        setLoading(false);
      } catch (err: any) {
        setError("Failed to load car data");
        setLoading(false);
      }
    };

    fetchCar();
  }, [license_plate]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCar({ ...car, [name]: name === "cost_per_km" ? parseFloat(value) : value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCar(car);
      navigate("/cars");
    } catch (err: any) {
      setError("Failed to update car");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-4">Edit Car</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Make</label>
          <input
            type="text"
            name="make"
            value={car.make}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Model</label>
          <input
            type="text"
            name="model"
            value={car.model}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={car.status}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Cost Per KM</label>
          <input
            type="number"
            step="0.01"
            name="cost_per_km"
            value={car.cost_per_km}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={car.location}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCar;
