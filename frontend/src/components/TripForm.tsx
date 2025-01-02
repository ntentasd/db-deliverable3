import { useState } from "react";
import { startTrip } from "../services/tripsApi";

interface TripFormProps {
  onRefresh: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ onRefresh }) => {
  const [licensePlate, setLicensePlate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await startTrip(licensePlate);
      alert("Trip started successfully!");
      setLicensePlate("");
      onRefresh();
    } catch (error) {
      console.error("Failed to start trip:", error);
      alert("Failed to start trip.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded shadow">
      <h2 className="text-xl font-bold">Start a Trip</h2>
      <div>
        <label className="block text-sm font-medium">License Plate</label>
        <input
          type="text"
          name="licensePlate"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          placeholder="Enter License Plate"
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Start Trip
      </button>
    </form>
  );
};

export default TripForm;
