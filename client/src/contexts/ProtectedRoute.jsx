import React from "react";
import { useAuth } from "./AuthContext";
import { Outlet } from "react-router-dom";
import Forbidden from "@/pages/errors/Forbidden";

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (user.id != null && user.email != "") {
    return <Outlet />;
  }

  return <Forbidden />;
};

export default ProtectedRoute;
