import React from "react";
import { useAuth } from "./AuthContext";
import { Outlet, Navigate } from "react-router-dom";

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user?.role === "admin") {
    return <Outlet />;
  } else {
    return <Navigate to="/unauthorized" replace />;
  }
};

export default AdminRoute;
