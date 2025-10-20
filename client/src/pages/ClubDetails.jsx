"use client";

import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/app/layout";
import { useAuth } from "@/contexts/AuthContext";
import NavTabs from "@/components/NavTabs";
import { useParams, useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

export default function ClubDetails() {
  const { token, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [requestingRole, setRequestingRole] = useState(false);

  const [club, setClub] = useState(() => {
    const cached = sessionStorage.getItem("clubDetails");
    return cached ? JSON.parse(cached) : {};
  });
  const [loading, setLoading] = useState(
    !sessionStorage.getItem("clubDetails")
  );
  const [error, setError] = useState(null);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
    { name: "Profile", href: "/profile" },
  ];

  useEffect(() => {
    if (!token || !id) return;

    const fetchClubDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        NProgress.start();

        const res = await fetch(`http://localhost:8000/api/clubs/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch club details");

        const data = await res.json();
        setClub(data);
        sessionStorage.setItem("clubDetails", JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching club details:", err);
        setError("Failed to load club details.");
      } finally {
        setLoading(false);
        NProgress.done();
      }
    };

    if (!sessionStorage.getItem("clubDetails")) fetchClubDetails();
  }, [token, id]);

  const handleRequestRole = async () => {
    if (
      !window.confirm("Are you sure you want to request promotion to officer?")
    )
      return;

    try {
      setRequestingRole(true);
      const res = await fetch(
        `http://localhost:8000/api/clubs/${id}/role-change`,
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
      console.log(data)
      if (!res.ok)
        throw new Error(data.message || "Failed to request role change");

      alert("Role change request submitted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong.");
    } finally {
      setRequestingRole(false);
    }
  };

  const members = useMemo(() => {
    if (!club.users) return [];
    return [...club.users].sort((a, b) =>
      a.id === user.id ? -1 : b.id === user.id ? 1 : 0
    );
  }, [club.users, user.id]);

  return (
    <Layout>
      <NavTabs tabs={tabs} />
      <div className="min-h-screen bg-black p-6 text-white">
        {/* Club Info */}
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
                  Pending Requests
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

        {/* Member List */}
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
                    onClick={() => navigate(`/club/${id}/members/${member.id}`)}
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

                  {/* Request role button for current user if they are a member */}
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

        {/* Back Button */}
        <div className="mt-10">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </Layout>
  );
}
