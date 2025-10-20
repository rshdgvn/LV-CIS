"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { toast } from "sonner";

NProgress.configure({ showSpinner: false });

export default function PendingRequests() {
  const { token } = useAuth();
  const { id } = useParams(); // club ID
  const navigate = useNavigate();

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingRequests = async () => {
    if (!token || !id) return;

    try {
      setLoading(true);
      setError(null);
      NProgress.start();

      const res = await fetch(
        `http://localhost:8000/api/clubs/${id}/pending-requests`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch pending requests");

      const data = await res.json();
      setPending(data);
      console.log(pending)
    } catch (err) {
      console.error(err);
      setError("Failed to load pending requests.");
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [token, id]);

  const handleUpdateStatus = async (userId, status) => {
    if (!token) return;

    try {
      NProgress.start();
      const res = await fetch(
        `http://localhost:8000/api/clubs/${id}/members/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      console.log(data)
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      toast.success(
        `Membership ${
          status === "approved" ? "approved" : "rejected"
        } successfully!`
      );
      fetchPendingRequests(); 
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      NProgress.done();
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black p-6 text-white max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Pending Membership Requests</h1>

        {loading && (
          <p className="text-gray-400">Loading pending requests...</p>
        )}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && pending.length === 0 && (
          <p className="text-gray-400">No pending requests.</p>
        )}

        <div className="space-y-4">
          {pending.map((user) => (
            <div
              key={user.id}
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
                <button
                  onClick={() => handleUpdateStatus(user.user_id, "approved")}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus(user.user_id, "rejected")}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
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
