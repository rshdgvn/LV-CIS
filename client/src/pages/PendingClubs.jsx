"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import { useAuth } from "@/contexts/AuthContext";
import NavTabs from "@/components/NavTabs";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import ClubList from "@/components/ClubList";

NProgress.configure({ showSpinner: false });

export default function PendingClubs() {
  const { token } = useAuth();

  const [pendingClubs, setPendingClubs] = useState(() => {
    const cached = sessionStorage.getItem("pendingClubs");
    return cached ? JSON.parse(cached) : [];
  });

  const [loading, setLoading] = useState(
    !sessionStorage.getItem("pendingClubs")
  );
  const [error, setError] = useState(null);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
    { name: "Profile", href: "/profile" },
  ];

  const fetchPendingClubs = async (showLoading = true) => {
    if (!token) return;
    try {
      if (showLoading) setLoading(true);
      setError(null);
      NProgress.start();

      const res = await fetch("http://localhost:8000/api/your/pending-clubs", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch pending clubs");

      const data = await res.json();
      setPendingClubs(data);
      sessionStorage.setItem("pendingClubs", JSON.stringify(data));
    } catch (err) {
      setError(err.message || "Error loading pending clubs");
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  useEffect(() => {
    if (token) fetchPendingClubs(!sessionStorage.getItem("pendingClubs"));
  }, [token]);

  // ✅ Listen for updates (e.g. from Clubs.jsx after join)
  useEffect(() => {
    const handleRefresh = () => {
      sessionStorage.removeItem("pendingClubs");
      fetchPendingClubs(false); // silent refetch
    };

    window.addEventListener("pendingClubsUpdated", handleRefresh);
    return () =>
      window.removeEventListener("pendingClubsUpdated", handleRefresh);
  }, [token]);

  const handleCancel = async (clubId) => {
    if (!token) return alert("Please log in first.");
    if (!window.confirm("Are you sure you want to cancel your application?"))
      return;

    try {
      NProgress.start();

      const res = await fetch(
        `http://localhost:8000/api/clubs/${clubId}/cancel`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to cancel application.");

      alert(data.message);

      // ✅ Remove cache & refetch
      sessionStorage.removeItem("pendingClubs");
      sessionStorage.removeItem("yourClubs");
      sessionStorage.removeItem("otherClubs");

      await fetchPendingClubs(false);
      window.dispatchEvent(new Event("clubsUpdated"));
    } catch (err) {
      alert(err.message || "Error canceling club application.");
    } finally {
      NProgress.done();
    }
  };

  return (
    <Layout>
      <NavTabs tabs={tabs} />
      <div className="min-h-screen bg-black p-6 text-white">
        <h1 className="text-2xl font-semibold mb-6">Pending Clubs</h1>

        {loading ? (
          <p className="text-gray-400 text-center">Loading pending clubs...</p>
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : (
          <ClubList
            clubs={pendingClubs}
            status="pending"
            onCancel={handleCancel}
          />
        )}
      </div>
    </Layout>
  );
}
