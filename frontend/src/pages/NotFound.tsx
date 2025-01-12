import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100">
      <Helmet>
        <title>DataDrive - Not Found</title>
      </Helmet>
      <h1 className="text-8xl font-extrabold text-teal-500">404</h1>
      <h2 className="text-3xl font-semibold text-gray-200 mt-4">
        Page Not Found
      </h2>
      <p className="text-gray-400 mt-3 text-center max-w-lg">
        The page you’re looking for doesn’t exist or has been moved. Please check the URL or navigate back to the homepage.
      </p>
      <Link
        to="/"
        className="mt-6 bg-purple-500 text-gray-900 py-2 px-6 rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        Back to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
