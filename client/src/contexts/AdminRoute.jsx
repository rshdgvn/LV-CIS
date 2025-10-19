import React from "react";
import { useAuth } from "./AuthContext";
import { Outlet } from "react-router-dom";
import Unauthorized from "@/pages/errors/Unauthorized";

const AdminRoute = () => {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Outlet />;
  } else {
    return <Unauthorized />;
  }
};

export default AdminRoute;
