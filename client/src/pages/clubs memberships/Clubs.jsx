"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { APP_URL } from "@/lib/config";
import ClubList from "@/components/ClubList";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonClubPage } from "@/components/skeletons/SkeletonClubPage";
import { useToast } from "@/providers/ToastProvider";

import {
  GraduationCap,
  FilterIcon,
  ChevronDown,
  Search,
  FolderOpen,
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
  const { addToast } = useToast();

  const [yourClubs, setYourClubs] = useState([]);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [otherClubs, setOtherClubs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filters saved in sessionStorage ---
  const [activeFilter, setActiveFilter] = useState(() => {
    return sessionStorage.getItem("clubs_active_filter") || "your";
  });

  const [categoryFilter, setCategoryFilter] = useState(() => {
    return sessionStorage.getItem("clubs_category_filter") || "all";
  });

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

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    sessionStorage.setItem("clubs_active_filter", filter);
  };

  const handleCategorySelect = (value) => {
    setCategoryFilter(value);
    sessionStorage.setItem("clubs_category_filter", value);
    setShowCategoryMenu(false);
  };

  // ----------------------------
  //       🚀 LOAD FROM CACHE
  // ----------------------------
  useEffect(() => {
    const cachedYour = sessionStorage.getItem("yourClubs");
    const cachedPending = sessionStorage.getItem("pendingClubs");
    const cachedOther = sessionStorage.getItem("otherClubs");

    if (cachedYour || cachedPending || cachedOther) {
      setYourClubs(JSON.parse(cachedYour || "[]"));
      setPendingClubs(JSON.parse(cachedPending || "[]"));
      setOtherClubs(JSON.parse(cachedOther || "[]"));
      setLoading(false); // show cached instantly
    }
  }, []);

  // ----------------------------
  //     🚀 FETCH & SAVE CACHE
  // ----------------------------
  const fetchClubs = async () => {
    if (!token) return;

    if (!sessionStorage.getItem("yourClubs")) {
      setLoading(true);
    }

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

      // Save to sessionStorage
      sessionStorage.setItem("yourClubs", JSON.stringify(yourData));
      sessionStorage.setItem("pendingClubs", JSON.stringify(pendingData));
      sessionStorage.setItem("otherClubs", JSON.stringify(otherData));
    } catch (err) {
      console.error(err);
      setError("Failed to load clubs.");
      addToast("Failed to load clubs.", "error");
    } finally {
      setLoading(false);
      await finishProgress();
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchClubs();
  }, [token]);

  // JOIN, CANCEL, ENTER CLUB ----------------
  const handleJoinClub = async (clubId, role = "member") => {
    if (!token) return addToast("Please log in first", "error");

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

      // Clear cache
      sessionStorage.removeItem("yourClubs");
      sessionStorage.removeItem("otherClubs");

      await fetchClubs();
      window.dispatchEvent(new Event("pendingClubsUpdated"));
      await finishProgress();
      addToast("Application Request Sent!", "success");
    } catch (err) {
      await finishProgress();
      addToast(err.message, "error");
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

      await fetchClubs();
      window.dispatchEvent(new Event("clubsUpdated"));
      await finishProgress();

      addToast(data.message, "success");
    } catch (err) {
      await finishProgress();
      addToast(err.message, "error");
    }
  };

  const handleEnterClub = (clubId) => {
    if (!token) return addToast("Please log in first.", "error");
    navigate(`/club/${clubId}`);
  };

  // FILTERING -----------------------------
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

  // UI -----------------------------------
  return (
    <div>
      {loading ? (
        <SkeletonClubPage filtersCount={filterOptions.length} cardsCount={8} />
      ) : (
        <>
          {/* HEADER */}
          <div className="flex flex-col gap-2 mb-5 mt-2 mx-4">
            <div className="flex flex-row items-center gap-5">
              <div className="shrink-0 p-2 bg-blue-900/30 rounded-lg">
                <GraduationCap className="w-9 h-9 text-blue-400" />
              </div>
              <h1 className="text-4xl font-semibold">Explore Clubs</h1>
            </div>
            <p className="text-gray-400 my-2">
              Discover student organizations and find the right one for you.
            </p>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap items-center gap-3 my-3 ml-5">
            {!isAdmin &&
              filterOptions.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleFilterChange(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeFilter === filter.value
                      ? "bg-blue-950 text-white shadow-lg"
                      : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}

            {/* Category Filter */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900 text-white text-sm font-medium shadow-md hover:bg-blue-950 transition cursor-pointer"
              >
                <FilterIcon className="w-4 h-4" />
                {
                  categoryOptions.find((opt) => opt.value === categoryFilter)
                    ?.label
                }
                <ChevronDown className="w-4 h-4" />
              </button>

              {showCategoryMenu && (
                <div className="absolute mt-2 w-56 bg-neutral-800 text-sm text-white rounded-xl shadow-lg border border-neutral-700 z-50">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategorySelect(cat.value)}
                      className="block w-full text-left px-4 py-2 hover:bg-neutral-700 first:rounded-t-xl last:rounded-b-xl cursor-pointer"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CLUB LIST */}
          <div className="min-h-screen p-6 text-white">
            {error ? (
              <p className="text-red-400 text-center">{error}</p>
            ) : displayedClubs.length > 0 ? (
              <ClubList
                clubs={displayedClubs}
                onEnter={handleEnterClub}
                onJoin={handleJoinClub}
                status={status}
                onCancel={handleCancel}
              />
            ) : (
              // EMPTY STATE
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-neutral-900 p-4 rounded-full mb-4 border border-neutral-800">
                  {activeFilter === "your" ? (
                    <FolderOpen className="w-8 h-8 text-neutral-500" />
                  ) : (
                    <Search className="w-8 h-8 text-neutral-500" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {activeFilter === "your" &&
                    "You haven't joined any clubs yet"}
                  {activeFilter === "pending" && "No pending applications"}
                  {activeFilter === "other" && "No other clubs found"}
                </h3>
                <p className="text-neutral-400 text-sm max-w-sm mb-6">
                  {activeFilter === "your" &&
                    "Browse the 'Other Clubs' tab to find communities you might like to join."}
                  {activeFilter === "pending" &&
                    "Applications you send will appear here until they are approved."}
                  {activeFilter === "other" &&
                    "It looks like there are no other clubs available to join right now."}
                </p>
                {activeFilter === "your" && (
                  <button
                    onClick={() => {
                      handleFilterChange("other");
                      handleCategorySelect("all");
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    Browse Clubs
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
