import React from "react";
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
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Rents from "./pages/Rents";
import { RefreshProvider } from "./contexts/RefreshContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Settings from "./pages/Settings";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/not-found" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RefreshProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
            <Navbar />
            <main className="flex-grow container mx-auto px-6 py-12">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/rent" element={<Rents />} />

                {/* Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
                <Route path="/trips/:trip_id" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/cars" element={<AdminRoute><Cars /></AdminRoute>} />
                <Route path="/cars/:license_plate" element={<AdminRoute><CarDetailsWrapper /></AdminRoute>} />
                <Route path="/cars/:license_plate/edit" element={<AdminRoute><EditCar /></AdminRoute>} />

                {/* Catch-all route */}
                <Route path="/not-found" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/not-found" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </RefreshProvider>
    </AuthProvider>
  );
};

export default App;