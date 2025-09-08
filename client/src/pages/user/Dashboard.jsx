import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Dashboard() {
  const { token, setToken } = useAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    try {
      if (!token) return;

      const res = await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setToken(null);
        localStorage.removeItem("token");
        const data = await res.json();
        console.log("Logout response:", data);

        nav("/");
      } else {
        console.error("Logout failed:", await res.json());
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  return (
    <div>
      <div>Dashboard</div>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}

export default Dashboard;
