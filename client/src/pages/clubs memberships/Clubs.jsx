"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { APP_URL } from "@/lib/config";
import ClubList from "@/components/ClubList";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTemplate } from "@/components/AlertTemplate";
import { SkeletonClubPage } from "@/components/skeletons/SkeletonClubPage";

import {
  CheckCircle2Icon,
  AlertCircleIcon,
  GraduationCap,
  FilterIcon,
  ChevronDown,
} from "lucide-react";

NProgress.configure({ showSpinner: false });
const finishProgress = () =>
  new Promise((resolve) => {
    NProgress.done();
    setTimeout(resolve, 250);
  });

export default function Clubs() {
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [yourClubs, setYourClubs] = useState([]);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [otherClubs, setOtherClubs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const [activeFilter, setActiveFilter] = useState("your");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const categoryOptions = [
    { label: "All", value: "all" },
    { label: "Academics", value: "academics" },
    {
      label: "Culture and Performing Arts",
      value: "culture_and_performing_arts",
    },
    { label: "Socio-Politics", value: "socio_politics" },
  ];

  const filterOptions = [
    { label: "Your Clubs", value: "your" },
    { label: "Pending", value: "pending" },
    { label: "Other Clubs", value: "other" },
  ];

  const fetchClubs = async () => {
    if (!token) return;
    setLoading(true);
    NProgress.start();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const [yourRes, pendingRes, otherRes] = await Promise.all([
        fetch(`${APP_URL}/your/clubs`, { headers }),
        fetch(`${APP_URL}/your/pending-clubs`, { headers }),
        fetch(`${APP_URL}/other/clubs`, { headers }),
      ]);

      if (!yourRes.ok || !pendingRes.ok || !otherRes.ok)
        throw new Error("Failed to fetch clubs.");

      const [yourData, pendingData, otherData] = await Promise.all([
        yourRes.json(),
        pendingRes.json(),
        otherRes.json(),
      ]);

      setYourClubs(yourData);
      setPendingClubs(pendingData);
      setOtherClubs(otherData);
    } catch (err) {
      console.error(err);
      setError("Failed to load clubs.");
    } finally {
      setLoading(false);
      await finishProgress();
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchClubs();
  }, [token]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const handleJoinClub = async (clubId, role = "member") => {
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

      const res = await fetch(`${APP_URL}/clubs/${clubId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

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
        description: data.message,
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

  const handleCancel = async (clubId) => {
    if (!token) return;

    try {
      NProgress.start();

      const res = await fetch(`${APP_URL}/clubs/${clubId}/cancel`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to cancel application.");

      sessionStorage.removeItem("pendingClubs");
      sessionStorage.removeItem("yourClubs");
      sessionStorage.removeItem("otherClubs");

      await fetchClubs(false);
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

  const handleFilterChange = (filter) => setActiveFilter(filter);
  const handleCategorySelect = (value) => {
    setCategoryFilter(value);
    setShowCategoryMenu(false);
  };

  const filterByCategory = (data) => {
    if (categoryFilter === "all") return data;
    return data.filter((c) => c.category === categoryFilter);
  };

  const getDisplayedClubs = () => {
    switch (activeFilter) {
      case "your":
        return filterByCategory(yourClubs);
      case "pending":
        return filterByCategory(pendingClubs);
      case "other":
        return filterByCategory(otherClubs);
      default:
        return [];
    }
  };

  const getStatus = () => {
    switch (activeFilter) {
      case "your":
        return "approved";
      case "pending":
        return "pending";
      default:
        return "none";
    }
  };

  const displayedClubs = getDisplayedClubs();
  const status = getStatus();

  return (
    <div>
      {loading ? (
        <SkeletonClubPage filtersCount={filterOptions.length} cardsCount={8} />
      ) : (
        <>
          <div className="flex flex-col gap-2 my-8 mx-4">
            <div className="flex flex-row items-center gap-5">
              <GraduationCap className="h-9 w-9 bg-blue-400 text-blue-900 border-blue-300 p-1 rounded-lg" />
              <h1 className="text-4xl font-semibold">Explore Clubs</h1>
            </div>
            <p className="text-gray-400 my-2">
              Discover student organizations and find the right one for you.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 my-3 ml-5">
            {!isAdmin &&
              filterOptions.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterChange(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeFilter === filter.value
                      ? "bg-blue-950 text-white shadow-lg"
                      : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}

            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900 text-white text-sm font-medium shadow-md hover:bg-blue-950 transition"
              >
                <FilterIcon className="w-4 h-4" />
                {categoryOptions.find((opt) => opt.value === categoryFilter)
                  ?.label || "All"}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showCategoryMenu && (
                <div className="absolute mt-2 w-56 bg-neutral-800 text-sm text-white rounded-xl shadow-lg border border-neutral-700 z-50">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategorySelect(cat.value)}
                      className="block w-full text-left px-4 py-2 hover:bg-neutral-700 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

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

          <div className="min-h-screen p-6 ml-3 mt-7 text-white">
            {error ? (
              <p className="text-red-400 text-center">{error}</p>
            ) : (
              <ClubList
                clubs={displayedClubs}
                onEnter={handleEnterClub}
                onJoin={handleJoinClub}
                status={status}
                onCancel={handleCancel}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
