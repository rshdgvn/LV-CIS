import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import ClubCard from "@/components/ClubCard";
import { useAuth } from "@/contexts/AuthContext";
import NavTabs from "@/components/NavTabs";

function PendingClubs() {
  const { token } = useAuth();
  const [pendingClubs, setPendingClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
  ];

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const fetchPendingClubs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8000/api/your/pending-clubs", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch pending clubs");
        }

        const data = await res.json();
        setPendingClubs(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching pending clubs:", err);
          setError("Failed to load pending clubs.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPendingClubs();

    return () => controller.abort();
  }, [token]);

  return (
    <Layout>
      <NavTabs tabs={tabs} />
      <div className="min-h-screen bg-black p-6 text-white">
        <h1 className="text-2xl font-semibold mb-6">Your Pending Clubs</h1>

        {loading ? (
          <p className="text-gray-400 text-center">Loading pending clubs...</p>
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : pendingClubs.length === 0 ? (
          <p className="text-gray-400 text-center">
            You have no pending club requests.
          </p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {pendingClubs.map((club) => (
              <ClubCard
                key={club.id}
                name={club.name}
                description={club.description}
                logo={club.logo}
                status="pending"
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default PendingClubs;
