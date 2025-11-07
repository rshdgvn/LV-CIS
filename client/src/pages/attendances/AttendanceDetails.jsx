"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { APP_URL } from "@/lib/config";

export default function AttendanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${APP_URL}/attendance-sessions/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSession(data);
      } catch (error) {
        console.error("Error fetching session details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-6 text-center text-red-400">Session not found.</div>
    );
  }

  return (
    <div className="p-6 text-white">
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={18} /> Back
      </Button>

      {/* Session Header */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-md mb-6">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-2">{session.title}</h1>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Calendar size={16} /> {new Date(session.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <MapPin size={16} /> {session.venue}
          </div>
          <p className="text-slate-300 mt-2">
            <span className="font-semibold">Club:</span>{" "}
            {session.club?.name || "N/A"}
          </p>
          <p className="text-slate-300">
            <span className="font-semibold">Event:</span>{" "}
            {session.event?.title || "N/A"}
          </p>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-md">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {session.members?.length > 0 ? (
                session.members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="px-4 py-3">{member.name}</td>
                    <td className="px-4 py-3">{member.course}</td>
                    <td className="px-4 py-3 text-right">
                      {member.status === "Present" ? (
                        <span className="flex justify-end items-center text-green-400 gap-1">
                          <CheckCircle size={14} /> Present
                        </span>
                      ) : (
                        <span className="flex justify-end items-center text-red-400 gap-1">
                          <XCircle size={14} /> Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-6 text-slate-400 italic"
                  >
                    No members found for this session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
