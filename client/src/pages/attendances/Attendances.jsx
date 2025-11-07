"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { APP_URL } from "@/lib/config";

export default function Attendances() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${APP_URL}/attendance-sessions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();
        setSessions(data.sessions || []); 
      } catch (error) {
        console.error("Error fetching attendance sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const eventTitle = session.event?.title || "";
    const sessionTitle = session.title || "";
    return (
      eventTitle.toLowerCase().includes(search.toLowerCase()) ||
      sessionTitle.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading attendance sessions...
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Attendance Sessions</h1>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search sessions"
            className="w-64 bg-slate-800 border-slate-700 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="secondary" className="bg-slate-800 text-white">
            Filter
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-md">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Club</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="px-4 py-3">
                      {session.event?.title || session.title || "N/A"}
                    </td>
                    <td className="px-4 py-3">{session.club?.name || "N/A"}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Calendar size={14} />{" "}
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        className="bg-slate-700 hover:bg-slate-600"
                        onClick={() =>
                          console.log("Clicked session:", session.id)
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 text-slate-400 italic"
                  >
                    No attendance sessions found.
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
