import { useRole } from "./useRole";

export function usePermissions() {
  const { isAdmin, isOfficer } = useRole();

  const canManageClub = (clubId) => isAdmin || isOfficer(clubId);

  return { canManageClub };
}
