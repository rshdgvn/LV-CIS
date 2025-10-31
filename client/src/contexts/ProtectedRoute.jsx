import React from "react";
import { useAuth } from "./AuthContext";
import { Outlet, Navigate } from "react-router-dom";
import { SkeletonSidebar } from "@/components/skeletons/SkeletonSidebar";
import Loader from "@/components/app/loader";

const ProtectedRoute = () => {
  const { isValidUser, loading } = useAuth();

  if (loading && isValidUser) return <Loader />;

  return isValidUser ? <Outlet /> : <Navigate to="/forbidden" replace />;
};

export default ProtectedRoute;
