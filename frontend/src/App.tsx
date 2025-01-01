import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import EditCar from "./pages/EditCar";
import NotFound from "./pages/NotFound";
import CarDetailsWrapper from "./pages/CarDetailsWrapper";

const App: React.FC = () => {
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
