import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useClub } from "./ClubContext";
import Unauthorized from "@/pages/errors/Unauthorized";

export default function OfficersRoute() {
  const { user } = useAuth();
  const { id: clubId } = useParams();
  const { clubs } = useClub();

  const club = clubs?.find((c) => c.id === Number(clubId));
  const membership = club?.pivot;

  const isOfficer = membership?.role === "officer";

  if (!user) {
    return <Unauthorized />;
  }

  if (isOfficer || user.role == "admin") {
    return <Outlet />;
  }

  return <Unauthorized />;
}
