import React, { useState } from "react";
import TripForm from "../components/TripForm";
import TripList from "../components/TripList";
import ActiveTripPopup from "../components/ActiveTripPopup";

const Trips: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1); // Increment the refresh key
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <TripForm onRefresh={handleRefresh} />
        <TripList key={refreshKey} />
        <ActiveTripPopup onRefresh={handleRefresh} refreshKey={refreshKey} />
      </div>
    </div>
  );
};

export default Trips;
