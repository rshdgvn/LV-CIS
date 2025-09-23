import React from "react";
import { useAuth } from "./AuthContext";
import { Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (user) {
    return <Outlet />;
  }
};

export default ProtectedRoute;
