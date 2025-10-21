"use client";

import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/app/layout";
import { useAuth } from "@/contexts/AuthContext";
import NavTabs from "@/components/NavTabs";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const [club, setClub] = useState(() => {
    const cached = sessionStorage.getItem(`club_${id}`);
    return cached ? JSON.parse(cached) : null;
  });

  const [loading, setLoading] = useState(!sessionStorage.getItem(`club_${id}`));
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [requestingRole, setRequestingRole] = useState(false);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
  ];

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
    if (!cached) fetchClubDetails();
  }, [token, id]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const handleRequestRole = async () => {
    try {
      NProgress.start();
      setRequestingRole(true);

      const res = await fetch(
        `${APP_URL}/clubs/${id}/role-change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ new_role: "officer" }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to request role change");

      await finishProgress();

      setAlert({
        type: "success",
        title: "Request Sent!",
        description: data.message || "Your officer role request was submitted.",
      });
    } catch (err) {
      await finishProgress();
      setAlert({
        type: "error",
        title: "Request Failed",
        description: err.message || "Something went wrong.",
      });
    } finally {
      setRequestingRole(false);
    }
  };

  const members = useMemo(() => {
    if (!club?.users) return [];
    return [...club.users].sort((a, b) =>
      a.id === user.id ? -1 : b.id === user.id ? 1 : 0
    );
  }, [club?.users, user?.id]);

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
        <div className="min-h-screenp-6 text-red-400 text-center">
          {error}
        </div>
      ) : !club ? (
        <div className="min-h-screen p-6 text-gray-400 text-center">
          Club not found.
        </div>
      ) : (
        <div className="min-h-screen p-6 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 border-b border-gray-800 pb-6">
            {club.logo && (
              <img
                src={club.logo}
                alt={club.name}
                className="w-32 h-32 rounded-xl object-cover border border-gray-700"
              />
            )}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-between md:justify-start gap-4">
                <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/club/${id}/pending-requests`)}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-black font-semibold text-sm"
                  >
                    Applicants
                  </button>

                  <button
                    onClick={() => navigate(`/club/${id}/role-change-requests`)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold text-sm"
                  >
                    Role Requests
                  </button>
                </div>
              </div>
              <p className="text-gray-400 max-w-2xl">{club.description}</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Members</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {members.length > 0 ? (
              members.map((member) => {
                const isCurrentUser = member.id === user.id;
                const isMember = member.pivot?.role === "member";

                return (
                  <div
                    key={member.id}
                    className={`flex flex-col md:flex-row items-center gap-4 transition-colors p-4 rounded-xl border border-gray-800 cursor-pointer ${
                      isCurrentUser
                        ? "bg-blue-900 hover:bg-blue-800"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    <div
                      className="flex items-center gap-4 flex-1"
                      onClick={() =>
                        navigate(`/club/${id}/members/${member.id}`)
                      }
                    >
                      <img
                        src={
                          member.profile_image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.name
                          )}&background=111&color=fff`
                        }
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-lg">
                          {member.name}{" "}
                          {isCurrentUser && (
                            <span className="text-sm text-yellow-400 ml-1">
                              (You)
                            </span>
                          )}
                        </p>
                        {member.pivot && (
                          <p className="text-gray-400 text-sm capitalize">
                            {member.pivot.role || "Member"}
                          </p>
                        )}
                      </div>
                    </div>

                    {isCurrentUser && isMember && (
                      <button
                        onClick={handleRequestRole}
                        disabled={requestingRole}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-black font-semibold rounded mt-2 md:mt-0"
                      >
                        {requestingRole ? "Requesting..." : "Apply Officer"}
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center">No members yet.</p>
            )}
          </div>

          <div className="mt-10">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
