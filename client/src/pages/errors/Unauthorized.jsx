import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white text-center px-6">
      {/* Code */}
      <h1 className="text-7xl font-bold text-white mb-4">401</h1>

      {/* Subtitle */}
      <h2 className="text-2xl font-semibold text-blue-500">
        Unauthorized Access
      </h2>

      {/* Message */}
      <p className="text-gray-400 mt-3 max-w-md">
        You don't have have permission to view this page.  
        Please go back and try again.
      </p>

      {/* Single Go Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition"
      >
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;
