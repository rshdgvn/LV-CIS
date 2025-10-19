"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/app/layout";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import NavTabs from "@/components/NavTabs";

NProgress.configure({ showSpinner: false });

export default function MemberDetails() {
  const { token } = useAuth();
  const { clubId, userId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !clubId || !userId) return;

    const fetchMember = async () => {
      try {
        setLoading(true);
        setError(null);
        NProgress.start();

        const res = await fetch(
          `http://localhost:8000/api/clubs/${clubId}/members/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch member details");

        const data = await res.json();
        console.log(JSON.stringify(data));

        const combined = {
          ...data.user,
          role: data.member.role,
          status: data.member.status,
          joined_at: data.member.joined_at,
        };

        setMember(combined);
      } catch (err) {
        console.error("Error fetching member:", err);
        setError("Failed to load member details.");
      } finally {
        setLoading(false);
        NProgress.done();
      }
    };

    fetchMember();
  }, [token, clubId, userId]);

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
    { name: "Profile", href: "/profile" },
  ];

  if (error) {
    return (
      <Layout>
        <NavTabs tabs={tabs} />
        <div className="min-h-screen bg-black text-red-400 flex items-center justify-center">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  if (loading || !member) {
    return (
      <Layout>
        <NavTabs tabs={tabs} />
        <div className="min-h-screen bg-black text-gray-400 flex items-center justify-center">
          <p>Loading member details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <NavTabs tabs={tabs} />
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex flex-col items-center mb-8">
          <img
            src={
              member.profile_image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                member.name
              )}&background=111&color=fff`
            }
            alt={member.name}
            className="w-32 h-32 rounded-full border border-gray-700 object-cover mb-4"
          />
          <h1 className="text-3xl font-bold">{member.name}</h1>
          <p className="text-gray-400">{member.email}</p>
          <p className="text-gray-400 capitalize">Role: {member.role}</p>
          <p className="text-gray-400">Status: {member.status}</p>
        </div>

        <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-3">
          <Detail label="Student ID" value={member.student_id} />
          <Detail label="Course" value={member.course} />
          <Detail label="Year Level" value={member.year_level} />
          <Detail label="Joined At" value={member.joined_at} />
        </div>

        <div className="mt-10 text-center">
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

function Detail({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium">{value || "N/A"}</span>
    </div>
  );
}
