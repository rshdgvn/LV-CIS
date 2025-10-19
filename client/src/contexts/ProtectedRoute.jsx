import React from "react";
import { useAuth } from "./AuthContext";
import { Outlet } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (user) {
    return <Outlet />;
  } else {
    return <LandingPage/>
  }
};

export default ProtectedRoute;
