import React from "react";
import TripList from "../components/TripList";
import ActiveTripPopup from "../components/ActiveTripPopup";
import { Helmet } from "react-helmet";
import { useAuth } from "../contexts/AuthContext";

const Trips: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <Helmet>
        <title>DataDrive - Trips</title>
      </Helmet>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-teal-400 mb-6 text-center">Trips</h1>
        <div className="bg-gray-800 shadow-lg rounded-lg p-6">
          <TripList />
          {isAuthenticated && <ActiveTripPopup />}
        </div>
      </div>
    </div>
  );
};

export default Trips;
