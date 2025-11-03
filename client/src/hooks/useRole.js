import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";

export function useRole() {
  const { user } = useAuth();
  const { getUserRole } = useClub();

  const isAdmin = user?.role === "admin";
  const isOfficer = (clubId) => {
    const role = getUserRole(clubId);
    return role === "officer" || role === "adviser";
  };
  const isMember = (clubId) => {
    const role = getUserRole(clubId);
    return ["member", "officer", "adviser"].includes(role);
  };

  return { isAdmin, isOfficer, isMember };
}
