import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/app/layout";

function Dashboard() {
  const nav = useNavigate();
  
  return (
    <Layout>
      <div>Dashboard</div>
    </Layout>
  );
}

export default Dashboard;
