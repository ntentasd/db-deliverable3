import React, { useEffect } from "react";
import TripList from "../components/TripList";
import ActiveTripPopup from "../components/ActiveTripPopup";
import { useRefresh } from "../contexts/RefreshContext";
import { Helmet } from "react-helmet";

const Trips: React.FC = () => {
  const { refreshKey, triggerRefresh } = useRefresh();

  const isAuthenticated = !!localStorage.getItem("authToken");

  useEffect(() => {
  }, [refreshKey]);

  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>DataDrive - Trips</title>
      </Helmet>
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
