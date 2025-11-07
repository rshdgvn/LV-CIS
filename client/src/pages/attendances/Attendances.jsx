"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Filter, Search } from "lucide-react";
import { APP_URL } from "@/lib/config";
import { useNavigate } from "react-router-dom";

export default function Attendances() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const nav = useNavigate();

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

        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
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
      <div className="flex justify-center items-center h-screen text-neutral-400">
        Loading attendance sessions...
      </div>
    );
  }

  return (
    <div className="p-6 text-neutral-200 flex flex-col gap-6">
      {/* Header: Search + Filter */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">
          Attendance Sessions
        </h1>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-neutral-900 rounded-full px-4 py-2 border border-neutral-800 w-xs">
            <Search className="w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-neutral-300 outline-none placeholder-neutral-500"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="secondary"
            className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-sm rounded-full px-5 py-2 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 text-neutral-400">
                <TableHead className="text-left px-6 py-3">Event</TableHead>
                <TableHead className="text-left px-6 py-3">Club</TableHead>
                <TableHead className="text-left px-6 py-3">Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <TableRow
                    key={session.id}
                    onClick={() => nav(`/attendance/${session.id}`)}
                    className="border-neutral-900 hover:bg-neutral-950/70 transition cursor-pointer"
                  >
                    <TableCell className="px-6 py-4 text-neutral-200">
                      {session.event?.title || session.title || "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-neutral-400">
                      {session.club?.name || "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-neutral-400 flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(session.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan="3"
                    className="text-center py-6 text-neutral-500 italic"
                  >
                    No attendance sessions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
