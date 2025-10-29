import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";

const ClubContext = createContext();

export function ClubProvider({ children }) {
  const { token, user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserClubs = async () => {
    try {
      const res = await fetch(`${APP_URL}/my/clubs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch user clubs");
      const data = await res.json();
      console.log(data);
      setClubs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (clubId) => {
    const club = clubs.find((c) => Number(c.id) === Number(clubId));
    return club?.pivot?.role || null;
  };

  const isOfficer = (clubId) => getUserRole(clubId) === "officer";
  const isMember = (clubId) =>
    ["member", "officer"].includes(getUserRole(clubId));

  useEffect(() => {
    if (!token) return;
    fetchUserClubs();
    
  }, [token]);

  return (
    <ClubContext.Provider
      value={{ clubs, loading, getUserRole, isOfficer, isMember }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export const useClub = () => useContext(ClubContext);
