import React from "react";

const Home: React.FC = () => {
  return (
    <div className="text-center bg-white shadow-md rounded-lg p-10">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Welcome to the Cars Management System
      </h1>
      <p className="text-gray-700 text-lg">
        Easily manage your fleet of cars. Use the navigation bar to explore
        features like adding, listing, and deleting cars.
      </p>
    </div>
  );
};

export default Home;
