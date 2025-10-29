import React from "react";
import { useAuth } from "./AuthContext";
import { Outlet, Navigate } from "react-router-dom";
import { SkeletonSidebar } from "@/components/skeletons/SkeletonSidebar";

const ProtectedRoute = () => {
  const { isValidUser, loading } = useAuth();

  if (loading) return <SkeletonSidebar />;

  return isValidUser ? <Outlet /> : <Navigate to="/forbidden" replace />;
};

export default ProtectedRoute;
