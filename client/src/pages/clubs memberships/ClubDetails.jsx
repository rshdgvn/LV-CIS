"use client";

import React, { useEffect, useState, useMemo, useDebugValue } from "react";
import Layout from "@/components/app/layout";
import { useAuth } from "@/contexts/AuthContext";
import NavTabs from "@/components/NavTabs";
import { useNavigate, useParams } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { AlertTemplate } from "@/components/AlertTemplate";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { APP_URL } from "@/lib/config";

NProgress.configure({ showSpinner: false });

const finishProgress = () =>
  new Promise((resolve) => {
    NProgress.done();
    setTimeout(resolve, 250);
  });

export default function ClubDetails() {
  const { token, user } = useAuth();
  const { id } = useParams();
  const nav = useNavigate();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Active");
  const filters = ["Active", "Inactive", "All"];

  useEffect(() => {
    if (!token || !id) return;

    const fetchClubDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        NProgress.start();

        const res = await fetch(`${APP_URL}/clubs/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch club details");
        const data = await res.json();
        setClub(data);
        console.log(club);
        sessionStorage.setItem(`club_${id}`, JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching club details:", err);
        setError("Failed to load club details.");
      } finally {
        setLoading(false);
        await finishProgress();
      }
    };

    const cached = sessionStorage.getItem(`club_${id}`);
    if (cached) {
      setClub(JSON.parse(cached));
      setLoading(false);
    } else {
      fetchClubDetails();
    }
  }, [token, id]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const members = useMemo(() => club?.users || [], [club?.users]);
  const advisers = useMemo(
    () => members.filter((m) => m.pivot?.role === "adviser"),
    [members]
  );
  const regularMembers = useMemo(() => {
    const officers = members.filter(
      (m) => m.pivot?.role === "officer" || m.pivot?.officer_title
    );

    const regulars = members.filter((m) => m.pivot?.role === "member");

    return [...officers, ...regulars];
  }, [members]);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
  ];

  useEffect(() => {
    console.log(JSON.stringify(club));
  }, []);

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
      ) : error ? (
        <div className="p-6 text-red-400 text-center">{error}</div>
      ) : (
        <div className="min-h-screen p-6 text-white grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-sidebar border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
              <img
                src={
                  club.logo_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    club.name
                  )}&background=111&color=fff`
                }
                alt={club.name}
                className="w-28 h-28 rounded-full object-cover border border-gray-800"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{club.name}</h1>
                <p className="text-gray-400 text-sm mt-2">
                  {club.description || "No description available."}
                </p>

                {advisers.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-base text-white font-semibold mb-2">
                      Adviser{advisers.length > 1 ? "s" : ""}
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {advisers.map((adviser) => (
                        <div
                          key={adviser.id}
                          className="flex items-center gap-6 justify-between p-3 rounded-lg border border-gray-800 hover:bg-gray-950 transition"
                          onClick={() =>
                            nav(`/club/${id}/members/${adviser.id}`)
                          }
                        >
                          <img
                            src={
                              adviser.profile_image ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                adviser.name
                              )}&background=111&color=fff`
                            }
                            alt={adviser.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium">
                              {`Mr. ${adviser.name}`}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                              {adviser.pivot?.role || "Adviser"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-sidebar border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-row gap-5">
                  <h2 className="text-xl font-semibold">Members</h2>
                  <button
                    onClick={() => nav(`/club/${id}/pending-requests`)}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    View Applicants
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex gap-2 bg-black p-1 rounded-lg">
                    {filters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 text-[0.5rem] font-medium rounded-md transition-all duration-200 ${
                          activeFilter === filter
                            ? "bg-blue-600 text-white"
                            : "bg-transparent text-gray-300 hover:text-white"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                {regularMembers.length > 0 ? (
                  regularMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:bg-gray-950 transition"
                      onClick={() => nav(`/club/${id}/members/${member.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            member.profile_image ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              member.name
                            )}&background=111&color=fff`
                          }
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-400 capitalize">
                            {member.pivot?.officer_title ||
                              member.pivot?.role ||
                              "Member"}
                          </p>
                        </div>
                      </div>
                      <p className="text-green-400 text-xs">Active</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No members yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-sidebar border border-gray-800 rounded-xl p-6 h-64">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold">Achievements</h3>
                <button className="text-sm text-blue-400 hover:underline">
                  View all
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                Coming soon... (Achievements section)
              </p>
            </div>

            <div className="bg-sidebar border border-gray-800 rounded-xl p-6 h-64">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold">Events & Photos</h3>
                <button className="text-sm text-blue-400 hover:underline">
                  View all
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                Coming soon... (Events and Photos section)
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
