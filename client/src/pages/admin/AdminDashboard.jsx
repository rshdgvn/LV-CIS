import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/app/layout";

function AdminDashboard() {
  return (
    <Layout>
      <div>Admin Dashboard</div>
    </Layout>
  );
}

export default AdminDashboard;
