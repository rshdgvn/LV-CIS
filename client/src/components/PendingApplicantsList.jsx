"use client";

import { useEffect, useState } from "react";
import {
  CheckIcon,
  XIcon,
  ShieldAlert,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTemplate } from "@/components/AlertTemplate";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate";

export default function PendingApplicantsList() {
  const { token } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfficer, setIsOfficer] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchApplicants = async () => {
    try {
      const res = await fetch(`${APP_URL}/dashboard/pending-applicants`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const json = await res.json();
        setIsOfficer(json.is_officer);
        setApplicants(json.data);
      }
    } catch (err) {
      console.error("Failed to load applicants", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // Auto-dismiss alert
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const handleUpdateStatus = async (clubId, userId, status) => {
    if (!token) return;
    try {
      const res = await fetch(`${APP_URL}/clubs/${clubId}/members/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      setAlert({
        type: "success",
        title: status === "approved" ? "Approved!" : "Rejected!",
        description:
          status === "approved"
            ? "Applicant approved successfully!"
            : "Applicant rejected successfully!",
      });

      fetchApplicants(); // Refresh list to ensure data sync
    } catch (err) {
      setAlert({
        type: "error",
        title: "Action Failed",
        description: err.message || "An error occurred while updating status.",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6 h-full flex flex-col gap-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-1/3 bg-[#333]" />
          <Skeleton className="h-6 w-1/6 bg-[#333]" />
        </div>
        <Skeleton className="h-12 w-full bg-[#333]" />
        <Skeleton className="h-12 w-full bg-[#333]" />
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 h-full flex flex-col relative">
      {/* Alert Toast */}
      {alert && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] sm:max-w-xs">
          <AlertTemplate
            icon={
              alert.type === "success" ? (
                <CheckCircle2Icon className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircleIcon className="h-5 w-5 text-red-500" />
              )
            }
            title={alert.title}
            description={alert.description}
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-1">
        <h3 className="text-white font-semibold">Pending Applicants</h3>
      </div>

      <p className="text-xs text-gray-500 mb-6">
        Recent join requests requiring action.
      </p>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-3">
        {!isOfficer ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-3 py-8 opacity-70">
            <div className="p-3 bg-[#262626] rounded-full">
              <ShieldAlert size={24} className="text-gray-400" />
            </div>
            <div className="max-w-[200px]">
              <p className="text-sm font-medium text-gray-300">
                Restricted Access
              </p>
              <p className="text-xs mt-1">
                You are not an officer of any club.
              </p>
            </div>
          </div>
        ) : applicants.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-3 py-8 opacity-70">
            <div className="p-3 bg-[#262626] rounded-full">
              <CheckIcon size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">
                All caught up!
              </p>
              <p className="text-xs mt-1">No pending requests right now.</p>
            </div>
          </div>
        ) : (
          applicants.map((applicant) => (
            <div
              key={applicant.id}
              className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg border border-neutral-800 group hover:border-[#333] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-10 h-10 border border-[#333]">
                  <AvatarImage src={applicant.avatar} />
                  <AvatarFallback className="bg-[#222] text-gray-400 text-xs">
                    {applicant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="truncate">
                  <h4 className="text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[150px]">
                    {applicant.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {applicant.club_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {/* Approve Button */}
                <AlertDialogTemplate
                  title="Approve Applicant?"
                  description={`Are you sure you want to approve ${applicant.name} for ${applicant.club_name}?`}
                  onConfirm={() =>
                    handleUpdateStatus(
                      applicant.club_id, 
                      applicant.user_id,
                      "approved"
                    )
                  }
                  button={
                    <button
                      className="p-1.5 bg-[#1A1A1A] hover:bg-[#22c55e]/20 text-gray-400 hover:text-[#22c55e] rounded-md transition-all"
                      title="Approve"
                    >
                      <CheckIcon className="w-4 h-4 text-green-400" />
                    </button>
                  }
                />

                {/* Reject Button */}
                <AlertDialogTemplate
                  title="Reject Applicant?"
                  description={`Are you sure you want to reject ${applicant.name}?`}
                  onConfirm={() =>
                    handleUpdateStatus(
                      applicant.club_id, // Make sure backend sends this
                      applicant.user_id,
                      "rejected"
                    )
                  }
                  button={
                    <button
                      className="p-1.5 bg-[#1A1A1A] hover:bg-[#ef4444]/20 text-gray-400 hover:text-[#ef4444] rounded-md transition-all"
                      title="Reject"
                    >
                      <XIcon className="w-4 h-4 text-red-400" />
                    </button>
                  }
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
