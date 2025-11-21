import React from "react";
import { useAuth } from "./AuthContext";
import { Outlet, Navigate } from "react-router-dom";
import Loader from "@/components/app/Loader";

const ProtectedRoute = () => {
  const { isValidUser, loading } = useAuth();

  if (loading) return <Loader />;

  return isValidUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
