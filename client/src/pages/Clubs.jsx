import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import ClubCard from "@/components/ClubCard";
import { useAuth } from "@/contexts/AuthContext";

function Clubs() {
  const { token } = useAuth();
  const [yourClubs, setYourClubs] = useState([]);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/clubs", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setClubs(data))
      .catch((err) => console.error("Error fetching clubs:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/your/clubs", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setYourClubs(data))
      .catch((err) => console.error("Error fetching clubs:", err));
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-black p-6">
        <h1 className="text-white text-2xl font-semibold mb-6">Your Clubs</h1>

        {yourClubs.length === 0 ? (
          <p className="text-gray-400 mb-10">You have no clubs</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {yourClubs.map((club) => (
              <ClubCard
                key={club.id}
                name={club.name}
                description={club.description}
                logo={club.logo}
                onEnter={() => console.log(`Entering ${club.name}`)}
              />
            ))}
          </div>
        )}
        <h1 className="text-white text-2xl font-semibold mb-6">Other Clubs</h1>

        {clubs.length === 0 ? (
          <p className="text-gray-400">Loading clubs...</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {clubs.map((club) => (
              <ClubCard
                key={club.id}
                name={club.name}
                description={club.description}
                logo={club.logo}
                onEnter={() => console.log(`Entering ${club.name}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Clubs;
