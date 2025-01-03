import React, { useEffect } from "react";
import TripList from "../components/TripList";
import ActiveTripPopup from "../components/ActiveTripPopup";
import { useRefresh } from "../contexts/RefreshContext";

const Trips: React.FC = () => {
  const { refreshKey, triggerRefresh } = useRefresh();

  const isAuthenticated = !!localStorage.getItem("authToken");

  useEffect(() => {
  }, [refreshKey]);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <TripList key={refreshKey} />
        {isAuthenticated ? (
          <ActiveTripPopup onRefresh={triggerRefresh} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default Trips;
