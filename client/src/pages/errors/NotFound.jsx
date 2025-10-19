import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white text-center px-6">
      {/* 404 Number */}
      <h1 className="text-7xl font-bold text-white mb-4">404</h1>

      {/* Subtitle */}
      <h2 className="text-2xl font-semibold text-blue-500">
        Page Not Found
      </h2>

      {/* Message */}
      <p className="text-gray-400 mt-3 max-w-md">
        Sorry, the page you’re looking for doesn’t exist or may have been moved.
        Try returning to your home page or dashboard.
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition"
        >
          Go Home
        </Link>
        <Link
          to="/dashboard"
          className="border border-gray-600 hover:border-blue-500 hover:text-blue-400 px-6 py-2 rounded-lg font-medium transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
