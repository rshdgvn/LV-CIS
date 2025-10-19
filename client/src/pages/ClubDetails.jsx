import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import { useAuth } from "@/contexts/AuthContext";
import NavTabs from "@/components/NavTabs";
import { useParams, useNavigate } from "react-router-dom";

export default function ClubDetails() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
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
  ];

  useEffect(() => {
    if (!token || !id) return;

    const controller = new AbortController();

    const fetchClub = async () => {
      try {
        setError(null);

        const res = await fetch(`http://localhost:8000/api/clubs/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Failed to fetch club details");

        const data = await res.json();
        setClub(data);
        sessionStorage.setItem("clubDetails", JSON.stringify(data));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching club details:", err);
          setError("Failed to load club details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClub();

    return () => controller.abort();
  }, [id, token]);

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-black text-red-400 flex items-center justify-center">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <NavTabs tabs={tabs} />
      <div className="min-h-screen bg-black p-6 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 border-b border-gray-800 pb-6">
          {club.logo && (
            <img
              src={club.logo}
              alt={club.name}
              className="w-32 h-32 rounded-xl object-cover border border-gray-700"
            />
          )}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
            <p className="text-gray-400 max-w-2xl">{club.description}</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Members</h2>
        <div className="max-w-4xl mx-auto space-y-4">
          {club.users?.length > 0 ? (
            club.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 bg-gray-900 hover:bg-gray-800 transition-colors p-4 rounded-xl border border-gray-800"
              >
                <img
                  src={
                    user.profile_image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}&background=111&color=fff`
                  }
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div>
                  <p className="font-medium text-lg">{user.name}</p>
                  {user.pivot && (
                    <p className="text-gray-400 text-sm capitalize">
                      {user.pivot.role || "Member"}
                    </p>
                  )}
                </div>
              </div>
            ))
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
    </Layout>
  );
}
