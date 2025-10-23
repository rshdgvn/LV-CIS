import React from "react";
import { Link } from "react-router-dom";

const Forbidden = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-6">
      {/* Code */}
      <h1 className="text-7xl font-bold text-white mb-4">403</h1>

      {/* Subtitle */}
      <h2 className="text-2xl font-semibold text-blue-500">
        Access Forbidden
      </h2>

      {/* Message */}
      <p className="text-gray-400 mt-3 max-w-md">
        You don’t have permission to access this page.  
        If you think this is a mistake, please contact your administrator.
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
          to="/login"
          className="border border-gray-600 hover:border-blue-500 hover:text-blue-400 px-6 py-2 rounded-lg font-medium transition"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
