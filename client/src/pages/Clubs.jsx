import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import ClubCard from "@/components/ClubCard";
import { useAuth } from "@/contexts/AuthContext";
import NavTabs from "@/components/NavTabs";
import { useNavigate } from "react-router-dom";

function Clubs() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [yourClubs, setYourClubs] = useState(() => {
    const cached = sessionStorage.getItem("yourClubs");
    return cached ? JSON.parse(cached) : [];
  });

  const [clubs, setClubs] = useState(() => {
    const cached = sessionStorage.getItem("otherClubs");
    return cached ? JSON.parse(cached) : [];
  });

  const [loading, setLoading] = useState(
    yourClubs.length === 0 && clubs.length === 0
  );
  const [error, setError] = useState(null);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
  ];

  useEffect(() => {
    if (!token) return;

    if (yourClubs.length > 0 || clubs.length > 0) return;

    const controller = new AbortController();

    const fetchClubs = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [yourRes, allRes] = await Promise.all([
          fetch("http://localhost:8000/api/your/clubs", {
            headers,
            signal: controller.signal,
          }),
          fetch("http://localhost:8000/api/other/clubs", {
            headers,
            signal: controller.signal,
          }),
        ]);

        if (!yourRes.ok || !allRes.ok) throw new Error("Failed to fetch clubs");

        const [yourData, allData] = await Promise.all([
          yourRes.json(),
          allRes.json(),
        ]);

        setYourClubs(yourData);
        setClubs(allData);

        sessionStorage.setItem("yourClubs", JSON.stringify(yourData));
        sessionStorage.setItem("otherClubs", JSON.stringify(allData));
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching clubs:", err);
          setError("Failed to load clubs.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();

    return () => controller.abort();
  }, [token]);

  const handleJoinClub = async (clubId) => {
    if (!token) return alert("Please log in first.");

    try {
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

      alert(data.message);

      const updatedClubs = clubs.filter((club) => club.id !== clubId);
      const updatedYourClubs = [
        ...yourClubs,
        { id: clubId, status: "pending", role: "member" },
      ];

      setClubs(updatedClubs);
      setYourClubs(updatedYourClubs);

      sessionStorage.setItem("yourClubs", JSON.stringify(updatedYourClubs));
      sessionStorage.setItem("otherClubs", JSON.stringify(updatedClubs));
    } catch (err) {
      alert(err.message || "An error occurred while joining the club.");
    }
  };

  const handleEnterClub = async (clubId) => {
    if (!token) return alert("Please log in first.");

    try {
      document.body.style.cursor = "wait";

      const res = await fetch(`http://localhost:8000/api/clubs/${clubId}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch club details");

      const data = await res.json();
      sessionStorage.setItem("clubDetails", JSON.stringify(data));

      navigate(`/club/${clubId}`);
    } catch (err) {
      alert(err.message || "Error loading club details");
    } finally {
      document.body.style.cursor = "default";
    }
  };

  return (
    <Layout>
      <NavTabs tabs={tabs} />
      <div className="min-h-screen bg-black p-6 text-white">
        <h1 className="text-2xl font-semibold mb-6">Your Clubs</h1>

        {loading ? (
          <p className="text-gray-400 text-center">Loading clubs...</p>
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : yourClubs.length === 0 ? (
          <p className="text-gray-400 mb-10 text-center">You have no clubs.</p>
        ) : (
          <div className="flex flex-wrap gap-6 mb-12">
            {yourClubs.map((club) => (
              <ClubCard
                key={club.id}
                name={club.name}
                description={club.description}
                logo={club.logo}
                status="approved"
                onEnter={() => handleEnterClub(club.id)}
              />
            ))}
          </div>
        )}

        <h1 className="text-2xl font-semibold mb-6">Other Clubs</h1>

        {loading ? (
          <p className="text-gray-400 text-center">Loading clubs...</p>
        ) : error ? (
          <p className="text-red-400 text-center">{error}</p>
        ) : clubs.length === 0 ? (
          <p className="text-gray-400 text-center">No other clubs available.</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {clubs.map((club) => (
              <ClubCard
                key={club.id}
                name={club.name}
                description={club.description}
                logo={club.logo}
                status="none"
                onJoin={() => handleJoinClub(club.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Clubs;
