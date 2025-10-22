"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import NavTabs from "@/components/NavTabs";
import { AlertTemplate } from "@/components/AlertTemplate";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { APP_URL } from "@/lib/config";

NProgress.configure({ showSpinner: false });

const finishProgress = () =>
  new Promise((resolve) => {
    NProgress.done();
    setTimeout(resolve, 250);
  });

export default function PendingRequests() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
  ];

  const fetchPendingRequests = async () => {
    if (!token || !id) return;

    try {
      setLoading(true);
      setError(null);
      NProgress.start();

      const res = await fetch(`${APP_URL}/clubs/${id}/pending-requests`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch pending requests");

      const data = await res.json();
      setPending(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load pending requests.");
    } finally {
      setLoading(false);
      await finishProgress();
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [token, id]);

  const handleUpdateStatus = async (userId, status) => {
    if (!token) return;

    try {
      NProgress.start();
      const res = await fetch(`${APP_URL}/clubs/${id}/members/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      sessionStorage.removeItem(`club_${id}`);

      await fetchPendingRequests();
      await finishProgress();

      setAlert({
        type: "success",
        title: status === "approved" ? "Approved!" : "Rejected!",
        description:
          status === "approved"
            ? "Membership approved successfully!"
            : "Membership rejected successfully!",
      });
    } catch (err) {
      await finishProgress();
      setAlert({
        type: "error",
        title: "Action Failed",
        description: err.message || "An error occurred while updating status.",
      });
    }
  };

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  return (
    <Layout>
      <NavTabs tabs={tabs} />

      {alert && (
        <div className="flex items-center fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <AlertTemplate
            icon={
              alert.type === "success" ? (
                <CheckCircle2Icon className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircleIcon className="h-6 w-6 text-red-500" />
              )
            }
            title={alert.title}
            description={alert.description}
          />
        </div>
      )}

      <div className="min-h-screen p-6 text-white max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Applicants</h1>

        {loading && (
          <div className="min-h-screen flex items-center justify-center text-white">
            <div className="loader"></div>
          </div>
        )}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && pending.length === 0 && (
          <p className="text-gray-400">No applicants.</p>
        )}

        <div className="space-y-4">
          {pending.map((user) => (
            <div
              key={user.user_id}
              className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 transition-colors p-4 rounded-xl border border-gray-800"
            >
              <div className="flex items-center gap-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name
                  )}&background=111&color=fff`}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-lg">{user.name}</p>
                  <p className="text-gray-400 text-sm">
                    {user.student_id} | {user.course} | {user.year_level}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <AlertDialogTemplate
                  title="Accept applicant?"
                  description="Are you sure you want to approve this applicant?"
                  onConfirm={() => handleUpdateStatus(user.user_id, "approved")}
                  button={
                    <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-black rounded">
                      Approve
                    </button>
                  }
                />
                <AlertDialogTemplate
                  title="Reject applicant?"
                  description="Are you sure you want to reject this applicant?"
                  onConfirm={() => handleUpdateStatus(user.user_id, "rejected")}
                  button={
                    <button className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
                      Reject
                    </button>
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </Layout>
  );
}
