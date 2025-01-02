import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import EditCar from "./pages/EditCar";
import NotFound from "./pages/NotFound";
import CarDetailsWrapper from "./pages/CarDetailsWrapper";
import Trips from "./pages/Trips";
import TripDetails from "./components/TripDetails";

const App: React.FC = () => {
  useEffect(() => {
    // Hardcode JWT token for now
    const hardcodedToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MzU3Nzc4MTksImV4cCI6MTc2NzMxMzgxOSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoibnRlbnRhc0BnbWFpbC5jb20ifQ.dCKgbxT2u2sTg6nwrEcpzFmFpcf93f28ccqX_tiDR5M';
    localStorage.setItem('authToken', hardcodedToken);
  }, []);
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:license_plate/edit" element={<EditCar />} />
            <Route path="/cars/:license_plate" element={<CarDetailsWrapper />}/>
            <Route path="/trips" element={<Trips />}/>
            <Route path="/trips/:trip_id" element={<TripDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
