import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import EditCar from "./pages/EditCar";
import NotFound from "./pages/NotFound";
import CarDetailsWrapper from "./pages/CarDetailsWrapper";
import Trips from "./pages/Trips";
import TripDetails from "./components/TripDetails";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import { isAdminJWT, setupTokenExpirationHandler } from "./services/authUtils";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Rents from "./pages/Rents";
import { RefreshProvider } from "./contexts/RefreshContext";

const isAuthenticated = !!localStorage.getItem("authToken");

const isAdmin = isAdminJWT();

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAdmin) {
    return <Navigate to="/not-found" replace />;
  }
  return children;
}

const App: React.FC = () => {
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setupTokenExpirationHandler(token, () => {
        localStorage.removeItem("authToken");
        window.location.href = "/auth";
      });
    }
  }, []);

  return (
    <RefreshProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow py-12">
            <div className="container mx-auto px-6">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/rent" element={<Rents />} />

                {/* Protected Routes */}
                <Route
                  path="/trips"
                  element={
                    <ProtectedRoute>
                      <Trips />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trips/:trip_id"
                  element={
                    <ProtectedRoute>
                      <TripDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/cars"
                  element={
                    <AdminRoute>
                      <Cars />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/cars/:license_plate/edit"
                  element={
                    <AdminRoute>
                      <EditCar />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/cars/:license_plate"
                  element={
                    <AdminRoute>
                      <CarDetailsWrapper />
                    </AdminRoute>
                  }
                />

                {/* Catch-all route */}
                <Route path="/not-found" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/not-found" replace />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </Router>
    </RefreshProvider>
  );
};

export default App;
