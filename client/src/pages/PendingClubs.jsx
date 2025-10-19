"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import NavTabs from "@/components/NavTabs";
import { useAuth } from "@/contexts/AuthContext";
import ClubList from "@/components/ClubList";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

function PendingClubs() {
  const { token } = useAuth();

  const [pendingClubs, setPendingClubs] = useState(() => {
    const cached = sessionStorage.getItem("pendingClubs");
    return cached ? JSON.parse(cached) : [];
  });

  const [loading, setLoading] = useState(pendingClubs.length === 0);
  const [error, setError] = useState(null);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
    { name: "Profile", href: "/profile" },
  ];

  useEffect(() => {
    if (!token || pendingClubs.length > 0) return;

    const controller = new AbortController();

    const fetchPendingClubs = async () => {
      try {
        setLoading(true);
        setError(null);
        NProgress.start();

        const res = await fetch(
          "http://localhost:8000/api/your/pending-clubs",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error("Failed to fetch pending clubs");

        const data = await res.json();
        setPendingClubs(data);
        sessionStorage.setItem("pendingClubs", JSON.stringify(data));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching pending clubs:", err);
          setError("Failed to load pending clubs.");
        }
      } finally {
        setLoading(false);
        NProgress.done();
      }
    };

    fetchPendingClubs();
    return () => controller.abort();
  }, [token]);

  // Cancel pending membership
  const cancelApplication = async (clubId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/clubs/${clubId}/cancel`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to cancel membership request");

      // Remove cancelled club from state
      setPendingClubs((prev) => prev.filter((club) => club.id !== clubId));
      sessionStorage.setItem(
        "pendingClubs",
        JSON.stringify(pendingClubs.filter((club) => club.id !== clubId))
      );
    } catch (err) {
      console.error("Error cancelling application:", err);
      alert("Failed to cancel application. Try again.");
    }
  };

  return (
    <Layout>
      <NavTabs tabs={tabs} />
      <div className="min-h-screen bg-black p-6 text-white">
        <h1 className="text-2xl font-semibold mb-6">Your Pending Clubs</h1>

        {loading && (
          <p className="text-gray-400 text-center">Loading pending clubs...</p>
        )}
        {error && <p className="text-red-400 text-center">{error}</p>}

        {!loading && !error && pendingClubs.length > 0 && (
          <ClubList
            clubs={pendingClubs}
            status="pending"
            onCancel={cancelApplication}
          />
        )}

        {!loading && !error && pendingClubs.length === 0 && (
          <p className="text-gray-400 text-center">
            You have no pending club requests.
          </p>
        )}
      </div>
    </Layout>
  );
}

export default PendingClubs;
