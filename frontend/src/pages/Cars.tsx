import React, { useState, useEffect } from "react";
import CarList from "../components/CarList";
import CarForm from "../components/CarForm";
import { getAllCars } from "../services/carsApi";

const Cars: React.FC = () => {
  const [cars, setCars] = useState([]);

  const loadCars = async () => {
    try {
      const data = await getAllCars();
      setCars(data);
    } catch (error) {
      console.error("Failed to fetch cars:", error);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleInsert = () => {
    loadCars(); // Refresh the list after a new car is added
  };

  return (
    <div className="space-y-8">
      <CarForm onInsert={handleInsert} />
      <CarList cars={cars} />
    </div>
  );
};

export default Cars;
