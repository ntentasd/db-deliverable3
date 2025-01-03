import React from "react";
import { Link } from "react-router-dom";
import { isAdminJWT } from "../services/authUtils";
import { Helmet } from "react-helmet";

const Home: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem("authToken");
  const isAdmin = isAdminJWT();

  return (
    <div className="bg-gray-100 min-h-screen">
      <Helmet>
        <title>DataDrive - Home</title>
      </Helmet>
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl font-bold text-blue-600 mb-6">
          Welcome to DataDrive
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Your ultimate solution for car management. Rent, track, and manage your fleet seamlessly.
        </p>

        {/* Dynamic Buttons */}
        <div className="flex justify-center space-x-4 mb-12">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/cars"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700"
                >
                  Manage Cars
                </Link>
              )}
              <Link
                to="/trips"
                className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700"
              >
                View Trips
              </Link>
              <Link
                to="/profile"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-700"
              >
                View Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">Car Management</h2>
            <p className="text-gray-600">
              {isAdmin
                ? "Add, edit, or delete cars from your fleet. Monitor availability and maintenance status."
                : "Admins manage the fleet to ensure smooth operation and availability."}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">Trip Tracking</h2>
            <p className="text-gray-600">
              View detailed trip histories, including costs, distances, and user feedback.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">User Feedback</h2>
            <p className="text-gray-600">
              Collect and analyze user feedback to improve services and ensure customer satisfaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
