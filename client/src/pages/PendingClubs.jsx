"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import { useAuth } from "@/contexts/AuthContext";
import NavTabs from "@/components/NavTabs";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import ClubList from "@/components/ClubList";
import { AlertTemplate } from "@/components/AlertTemplate";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

NProgress.configure({ showSpinner: false });

const finishProgress = () =>
  new Promise((resolve) => {
    NProgress.done();
    setTimeout(resolve, 250);
  });

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
  const [alert, setAlert] = useState(null);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
  ];

  const fetchPendingClubs = async (showLoading = true) => {
    if (!token) return;

    try {
      if (showLoading) {
        setLoading(true);
        NProgress.start();
      }

      setError(null);

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
      console.error("Error fetching pending clubs:", err);
      setError(err.message || "Error loading pending clubs");
    } finally {
      setLoading(false);
      await finishProgress();
    }
  };

  useEffect(() => {
    if (!token) return;
    const hasCache = sessionStorage.getItem("pendingClubs");
    fetchPendingClubs(!hasCache);
  }, [token]);

  useEffect(() => {
    const handleRefresh = () => {
      sessionStorage.removeItem("pendingClubs");
      fetchPendingClubs(false);
    };

    window.addEventListener("pendingClubsUpdated", handleRefresh);
    return () =>
      window.removeEventListener("pendingClubsUpdated", handleRefresh);
  }, [token]);

  const handleCancel = async (clubId) => {
    if (!token) return;

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

      sessionStorage.removeItem("pendingClubs");
      sessionStorage.removeItem("yourClubs");
      sessionStorage.removeItem("otherClubs");

      await fetchPendingClubs(false);
      window.dispatchEvent(new Event("clubsUpdated"));
      await finishProgress();

      setAlert({
        type: "success",
        title: "Application Cancelled",
        description:
          data.message || "Your club application has been cancelled.",
      });
    } catch (err) {
      await finishProgress();
      setAlert({
        type: "error",
        title: "Failed to Cancel",
        description: err.message || "An error occurred while cancelling.",
      });
    }
  };

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  return (
    <Layout>
      <NavTabs tabs={tabs} />

      {alert && (
        <div className="flex items-center fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <AlertTemplate
            icon={
              alert.type === "success" ? (
                <CheckCircle2Icon className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircleIcon className="h-6 w-6 text-red-500" />
              )
            }
            title={alert.title}
            description={alert.description}
          />
        </div>
      )}

      {loading ? (
        <div className="min-h-screen flex items-center justify-center text-white">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="min-h-screen p-6 text-white">
          <h1 className="text-2xl font-semibold mb-6">Pending Clubs</h1>

          {error ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : (
            <ClubList
              clubs={pendingClubs}
              status="pending"
              onCancel={handleCancel}
            />
          )}
        </div>
      )}
    </Layout>
  );
}
