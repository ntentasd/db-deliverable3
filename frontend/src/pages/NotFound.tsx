import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Helmet>
        <title>DataDrive - Not Found</title>
      </Helmet>
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">
        Oops! Page Not Found
      </h2>
      <p className="text-gray-600 mt-2 text-center max-w-md">
        The page you’re looking for doesn’t exist or has been moved. Please
        check the URL or return to the homepage.
      </p>
      <Link
        to="/"
        className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Go Back to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
