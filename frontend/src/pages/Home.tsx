import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Helmet } from "react-helmet";

const Home: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="bg-gray-900 min-h-screen text-gray-100">
      <Helmet>
        <title>DataDrive - Home</title>
      </Helmet>
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl font-bold text-teal-400 mb-6">
          Welcome to DataDrive
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Streamline your car rental experience. Profile vehicles, track trips, and connect through user feedback.
        </p>

        {/* Dynamic Buttons */}
        <div className="flex justify-center space-x-4 mb-12">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/cars"
                  className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 transition-colors duration-300"
                >
                  Manage Cars
                </Link>
              )}
              {!isAdmin && (
                <Link
                  to="/rent"
                  className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 transition-colors duration-300"
                >
                  Rent a Car
                </Link>
              )}
              <Link
                to="/trips"
                className="bg-purple-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-purple-600 transition-colors duration-300"
              >
                View Trips
              </Link>
              <Link
                to="/profile"
                className="bg-gray-700 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 transition-colors duration-300"
              >
                View Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/auth?mode=signup"
                className="bg-purple-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-purple-600 transition-colors duration-300"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-bold text-teal-400 mb-4">Vehicle Profiling</h2>
            <p className="text-gray-300">
              Find the ideal car to rent, and it will adjust to your preferences.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-bold text-teal-400 mb-4">Trip Tracking</h2>
            <p className="text-gray-300">
              Monitor trip histories with detailed information on routes, durations, and trip costs.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-bold text-teal-400 mb-4">User Feedback</h2>
            <p className="text-gray-300">
              Gain and leave valuable insight helping the community grow.<br />
              Your feedback matters!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
