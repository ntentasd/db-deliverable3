// src/components/CarDetailsWrapper.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCarDetails } from "../services/carsApi";
import CarDetails from "../components/CarDetails";

const CarDetailsWrapper: React.FC = () => {
  const { license_plate } = useParams<{ license_plate: string }>();
  const [carDetails, setCarDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        const data = await getCarDetails(license_plate!);
        setCarDetails(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch car details.");
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [license_plate]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!carDetails) return <div className="text-center text-gray-500">Car not found.</div>;

  return (
    <CarDetails
      car={carDetails.car}
      damages={carDetails.damages}
      services={carDetails.services}
    />
  );
};

export default CarDetailsWrapper;
