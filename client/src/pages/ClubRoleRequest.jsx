"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import NavTabs from "@/components/NavTabs";
import { AlertTemplate } from "@/components/AlertTemplate";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

NProgress.configure({ showSpinner: false });

export default function ClubRoleRequests() {
  const { token } = useAuth();
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!token || !clubId) return;

    const fetchRequests = async () => {
      try {
        setLoading(true);
        NProgress.start();

        const res = await fetch(
          `http://localhost:8000/api/clubs/${clubId}/role-change-requests`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch role change requests");

        const data = await res.json();
        setRequests(data);
      } catch (err) {
        setAlert({
          icon: <AlertCircleIcon className="text-red-500" />,
          title: "Error",
          description: err.message || "Failed to load data.",
        });
      } finally {
        setLoading(false);
        NProgress.done();
      }
    };

    fetchRequests();
  }, [token, clubId]);

  const handleApprove = async (userId) => {
    if (!confirm("Approve this role request?")) return;

    try {
      NProgress.start();

      const res = await fetch(
        `http://localhost:8000/api/clubs/${clubId}/role-change/${userId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to approve request");

      setRequests((prev) => prev.filter((r) => r.user_id !== userId));
      NProgress.done();

      setTimeout(() => {
        setAlert({
          icon: (
            <CheckCircle2Icon className="w-5 h-5 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text" />
          ),
          title: "Success",
          description: "Role change approved successfully.",
        });
      }, 100);
    } catch (err) {
      NProgress.done();
      setTimeout(() => {
        setAlert({
          icon: <AlertCircleIcon className="text-red-500" />,
          title: "Error",
          description: err.message || "Failed to approve request.",
        });
      }, 100);
    }
  };

  const handleReject = async (userId) => {
    if (!confirm("Reject this role request?")) return;

    try {
      NProgress.start();

      const res = await fetch(
        `http://localhost:8000/api/clubs/${clubId}/role-change/${userId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to reject request");

      setRequests((prev) => prev.filter((r) => r.user_id !== userId));
      NProgress.done();

      setTimeout(() => {
        setAlert({
          icon: (
            <CheckCircle2Icon className="w-5 h-5 bg-gradient-to-r from-red-400 to-orange-500 text-transparent bg-clip-text" />
          ),
          title: "Rejected",
          description: "Role change request was rejected.",
        });
      }, 100);
    } catch (err) {
      NProgress.done();
      setTimeout(() => {
        setAlert({
          icon: <AlertCircleIcon className="text-red-500" />,
          title: "Error",
          description: err.message || "Failed to reject request.",
        });
      }, 100);
    }
  };

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
  ];

  return (
    <Layout>
      <NavTabs tabs={tabs} />

      <div className="min-h-screen text-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Officer Role Requests</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
          >
            Back
          </button>
        </div>

        {alert && (
          <div className="mb-4">
            <AlertTemplate
              icon={alert.icon}
              title={alert.title}
              description={alert.description}
            />
          </div>
        )}

        {loading ? (
          <div className="min-h-screen flex items-center justify-center text-white">
            <div className="loader"></div>
          </div>
        ) : requests.length === 0 ? (
          <p className="text-gray-400">No role change requests found.</p>
        ) : (
          
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.user_id}
                className="p-4 rounded-lg bg-gray-900 border border-gray-800 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-semibold">{req.name}</p>
                  <p className="text-gray-400 text-sm">
                    {req.course} — {req.year_level} • {req.student_id}
                  </p>
                  <p className="text-yellow-400 text-sm mt-1">
                    Requested Role: {req.requested_role}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Requested at:{" "}
                    {new Date(req.requested_at).toLocaleString("en-PH")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(req.user_id)}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-black rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req.user_id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
