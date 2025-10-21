"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

import Layout from "@/components/app/layout";
import NavTabs from "@/components/NavTabs";
import ClubList from "@/components/ClubList";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTemplate } from "@/components/AlertTemplate";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

NProgress.configure({ showSpinner: false });

const finishProgress = () =>
  new Promise((resolve) => {
    NProgress.done();
    setTimeout(resolve, 250);
  });

function Clubs() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [yourClubs, setYourClubs] = useState(() => {
    const cached = sessionStorage.getItem("yourClubs");
    return cached ? JSON.parse(cached) : [];
  });

  const [otherClubs, setOtherClubs] = useState(() => {
    const cached = sessionStorage.getItem("otherClubs");
    return cached ? JSON.parse(cached) : [];
  });

  const [loading, setLoading] = useState(!sessionStorage.getItem("yourClubs"));
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
  ];

  const fetchClubs = async (showLoading = true) => {
    if (!token) return;

    try {
      if (showLoading) {
        setLoading(true);
        NProgress.start(); 
      }

      setError(null);

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [yourRes, otherRes] = await Promise.all([
        fetch("http://localhost:8000/api/your/clubs", { headers }),
        fetch("http://localhost:8000/api/other/clubs", { headers }),
      ]);

      if (!yourRes.ok || !otherRes.ok)
        throw new Error("Failed to fetch clubs.");

      const [yourData, otherData] = await Promise.all([
        yourRes.json(),
        otherRes.json(),
      ]);

      setYourClubs(yourData);
      setOtherClubs(otherData);

      sessionStorage.setItem("yourClubs", JSON.stringify(yourData));
      sessionStorage.setItem("otherClubs", JSON.stringify(otherData));
    } catch (err) {
      console.error("Error fetching clubs:", err);
      setError("Failed to load clubs.");
    } finally {
      if (showLoading) {
        setLoading(false);
        await finishProgress();
      }
    }
  };

  useEffect(() => {
    if (!token) return;

    const hasCache =
      sessionStorage.getItem("yourClubs") &&
      sessionStorage.getItem("otherClubs");

    fetchClubs(!hasCache);
  }, [token]);

  useEffect(() => {
    const handleUpdate = () => {
      sessionStorage.removeItem("yourClubs");
      sessionStorage.removeItem("otherClubs");
      fetchClubs(false);
    };

    window.addEventListener("clubsUpdated", handleUpdate);
    return () => window.removeEventListener("clubsUpdated", handleUpdate);
  }, [token]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const handleJoinClub = async (clubId) => {
    if (!token) {
      setAlert({
        type: "error",
        title: "Unauthorized",
        description: "Please log in first.",
      });
      return;
    }

    try {
      NProgress.start();

      const res = await fetch(
        `http://localhost:8000/api/clubs/${clubId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join club.");

      sessionStorage.removeItem("yourClubs");
      sessionStorage.removeItem("otherClubs");
      await fetchClubs(false);
      window.dispatchEvent(new Event("pendingClubsUpdated"));

      await finishProgress();

      setAlert({
        type: "success",
        title: "Join Request Sent!",
        description: data.message || "Your join request has been submitted.",
      });
    } catch (err) {
      await finishProgress();

      setAlert({
        type: "error",
        title: "Failed to Join",
        description: err.message || "An error occurred while joining the club.",
      });
    }
  };

  const handleEnterClub = (clubId) => {
    if (!token) {
      setAlert({
        type: "error",
        title: "Unauthorized",
        description: "Please log in first.",
      });
      return;
    }
    navigate(`/club/${clubId}`);
  };

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
          <section>
            <h1 className="text-2xl font-semibold mb-6">Your Clubs</h1>
            {error ? (
              <p className="text-red-400 text-center">{error}</p>
            ) : (
              <ClubList
                clubs={yourClubs}
                status="approved"
                onEnter={handleEnterClub}
              />
            )}
          </section>

          <section className="mt-12">
            <h1 className="text-2xl font-semibold mb-6">Other Clubs</h1>
            {error ? (
              <p className="text-red-400 text-center">{error}</p>
            ) : (
              <ClubList
                clubs={otherClubs}
                status="none"
                onJoin={handleJoinClub}
              />
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}

export default Clubs;
