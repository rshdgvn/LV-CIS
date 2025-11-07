"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, ArrowLeft, CheckCircle2 } from "lucide-react";
import { APP_URL } from "@/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AttendanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

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

  useEffect(() => {
    fetchSession();
  }, [id]);

  const updateStatus = async (userId, newStatus) => {
    const token = localStorage.getItem("token");
    setSavingId(userId);

    try {
      const res = await fetch(
        `${APP_URL}/attendance-sessions/${id}/members/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      // Update local state immediately
      setSession((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.user_id === userId ? { ...m, status: newStatus } : m
        ),
      }));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("❌ Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading...
      </div>
    );

  if (!session)
    return (
      <div className="p-6 text-center text-red-400">Session not found.</div>
    );

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
                    key={member.user_id}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="px-4 py-3 flex items-center gap-2">
                      {member.name}
                      {savingId === member.user_id && (
                        <CheckCircle2
                          size={16}
                          className="text-green-500 animate-pulse"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">{member.course}</td>
                    <td className="px-4 py-3 text-right">
                      <Select
                        value={member.status.toLowerCase()}
                        onValueChange={(value) =>
                          updateStatus(member.user_id, value)
                        }
                      >
                        <SelectTrigger className="w-[130px] bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">✅ Present</SelectItem>
                          <SelectItem value="absent">❌ Absent</SelectItem>
                          <SelectItem value="late">🕒 Late</SelectItem>
                          <SelectItem value="excuse">📄 Excuse</SelectItem>
                        </SelectContent>
                      </Select>
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
