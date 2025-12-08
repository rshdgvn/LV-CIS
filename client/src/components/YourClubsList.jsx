import React from "react";
import { Loader2, User } from "lucide-react";
import { useClub } from "@/contexts/ClubContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function YourClubsList() {
  const { clubs, loading } = useClub();

  // Helper to capitalize roles (e.g. "officer" -> "Officer")
  const formatText = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Helper to get initials for fallback (e.g. "Blue Harmony" -> "BH")
  const getInitials = (name) => {
    if (!name) return "CL";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6 h-full flex flex-col">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="text-white font-semibold">Your Clubs</h3>
          <p className="text-xs text-gray-500 mt-1">
            Clubs you are managing or joined.
          </p>
        </div>
        <button className="text-xs bg-[#262626] text-white px-3 py-1.5 rounded-md hover:bg-[#333] transition-colors">
          View All
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[200px]">
        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs">Loading clubs...</span>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && clubs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-gray-400 text-sm font-medium">No clubs found</p>
            <p className="text-gray-600 text-xs mt-1">
              You haven't joined any clubs yet.
            </p>
          </div>
        )}

        {/* DATA LIST */}
        {!loading &&
          clubs.map((club) => {
            const role = club.pivot?.role;
            const status = club.pivot?.status;
            const logoSrc = club.logo_url || club.logo; // Handle both keys based on your data

            return (
              <div
                key={club.id}
                className="bg-[#111] border border-[#262626] rounded-lg p-3 flex items-center justify-between group hover:border-[#444] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* CLUB LOGO */}
                  <Avatar className="h-10 w-10 border border-[#333]">
                    <AvatarImage
                      src={logoSrc}
                      alt={club.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#262626] text-xs text-gray-400 font-medium">
                      {getInitials(club.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* CLUB DETAILS */}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-semibold text-white truncate max-w-[140px]">
                        {club.name}
                      </h4>

                      {/* ROLE BADGE */}
                      <span
                        className={`text-[9px] px-1.5 py-0 rounded border capitalize font-medium ${
                          role === "officer" || role === "adviser"
                            ? "bg-blue-900/30 text-blue-400 border-blue-900/50"
                            : "bg-neutral-800 text-gray-400 border-neutral-700"
                        }`}
                      >
                        {formatText(role)}
                      </span>
                    </div>

                    {/* ADVISER NAME */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <User className="w-3 h-3 text-gray-600" />
                      <span className="truncate max-w-[120px]">
                        Adviser: {club.adviser || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* STATUS BADGE */}
                <div className="text-right">
                  <span
                    className={`text-[10px] font-medium px-2 py-1 rounded border ${
                      status === "approved"
                        ? "text-emerald-400 bg-emerald-950/30 border-emerald-900/50"
                        : status === "pending"
                        ? "text-yellow-400 bg-yellow-950/30 border-yellow-900/50"
                        : "text-gray-400 bg-gray-900 border-gray-800"
                    }`}
                  >
                    {status === "approved" ? "Active" : formatText(status)}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
