import React from "react";
import { useAuth } from "./AuthContext";
import { Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { token } = useAuth();

  if (!token) {
    return (
      <div>
        <h1>Unauthenticated</h1>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;