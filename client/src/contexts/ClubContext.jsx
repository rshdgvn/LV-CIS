import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";

const ClubContext = createContext();

export function ClubProvider({ children }) {
  const { token, user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserClubs = async (controller) => {
    try {
      const res = await fetch(`${APP_URL}/my/clubs`, {
        signal: controller?.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch user clubs");
      const data = await res.json();
      setClubs(data);
    } catch (err) {
      if (err.name !== "AbortError") console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setClubs([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    fetchUserClubs(controller);
    return () => controller.abort();
  }, [token]);

  const getUserRole = (clubId) =>
    clubs.find((c) => c.id === clubId)?.pivot?.role || null;
  const isOfficer = (clubId) => getUserRole(clubId) === "officer";
  const isMember = (clubId) => getUserRole(clubId) === "member";

  const value = useMemo(
    () => ({
      clubs,
      loading,
      getUserRole,
      isOfficer,
      isMember,
      fetchUserClubs,
    }),
    [clubs, loading]
  );

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}

export const useClub = () => useContext(ClubContext);
