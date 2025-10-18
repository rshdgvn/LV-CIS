import React from "react";
import { useAuth } from "./AuthContext";
import { Outlet } from "react-router-dom";
import Forbidden from "@/pages/errors/Forbidden";

const ProtectedRoute = () => {
  const { token } = useAuth();

  if (token) {
    return <Outlet />;
  } else {
    return <Forbidden/>
  }
};

export default ProtectedRoute;
