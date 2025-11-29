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
import {
  Calendar,
  Filter,
  Search,
  Users,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { APP_URL } from "@/lib/config";
import { useNavigate } from "react-router-dom";
import { SkeletonAttendances } from "@/components/skeletons/SkeletonAttendances";
import { useClub } from "@/contexts/ClubContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AddAttendanceModal from "@/components/attendances/AddAttendanceModal";
import UpdateAttendanceModal from "@/components/attendances/UpdateAttendanceModal";

export default function Attendances() {
  const { clubs, loading: clubsLoading } = useClub();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const nav = useNavigate();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Load default club
  useEffect(() => {
    if (!clubs || clubs.length === 0) return;
    const club = clubs.find((c) => c.category === "academics") || clubs[0];
    setSelectedClub(club);
  }, [clubs]);

  // Fetch attendance sessions
  const fetchSessions = async () => {
    if (!selectedClub) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${APP_URL}/attendance-sessions?club_id=${selectedClub.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when selected club changes
  useEffect(() => {
    fetchSessions();
  }, [selectedClub]);

  const filteredSessions = sessions.filter((session) => {
    const title = session.title || session.event?.title || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  // Delete session
  const handleDelete = async (sessionId) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_URL}/attendance-sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(res.status);
      fetchSessions();
    } catch (err) {
      console.error(err);
      alert("Failed to delete session");
    }
  };

  if (loading || clubsLoading) return <SkeletonAttendances />;

  if (!selectedClub)
    return (
      <div className="text-center text-neutral-400 py-10">
        You are not part of any club.
      </div>
    );

  return (
    <div className="p-6 text-neutral-200 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">
          Attendance Sessions - {selectedClub.name}
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-neutral-900 rounded-full px-4 py-2 border border-neutral-800 w-xs">
            <Search className="w-5 h-5 text-neutral-400" />
            <input
              placeholder="Search sessions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-neutral-300 outline-none placeholder-neutral-500"
            />
          </div>

          <Button
            variant="secondary"
            className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-sm rounded-full px-5 py-2 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> Filter
          </Button>

          <Dialog open={switchOpen} onOpenChange={setSwitchOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-sm rounded-full px-5 py-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Switch Club
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Select Club</DialogTitle>
              </DialogHeader>

              <RadioGroup
                value={selectedClub?.id}
                onValueChange={(id) => {
                  const c = clubs.find((club) => club.id === Number(id));
                  setSelectedClub(c);
                }}
                className="flex flex-col gap-2 mt-4"
              >
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-neutral-700 hover:bg-neutral-800 cursor-pointer"
                  >
                    <div>
                      <p className="text-white font-medium">{club.name}</p>
                      <p className="text-neutral-400 text-sm">
                        {club.category}
                      </p>
                    </div>
                    <RadioGroupItem value={club.id} />
                  </div>
                ))}
              </RadioGroup>

              <DialogFooter>
                <Button onClick={() => setSwitchOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Session
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <AddAttendanceModal
        open={addModalOpen}
        setOpen={setAddModalOpen}
        clubId={selectedClub.id}
        onSuccess={fetchSessions}
      />

      {/* Update Modal */}
      <UpdateAttendanceModal
        open={updateModalOpen}
        setOpen={setUpdateModalOpen}
        session={selectedSession}
        onSuccess={fetchSessions}
      />

      {/* Sessions Table */}
      <Card className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 text-neutral-400">
                <TableHead className="px-6 py-3">Event</TableHead>
                <TableHead className="px-6 py-3">Venue</TableHead>
                <TableHead className="px-6 py-3">Date</TableHead>
                <TableHead className="px-6 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="border-neutral-900 hover:bg-neutral-950/70 transition"
                  >
                    <TableCell
                      className="px-6 py-4 text-neutral-200 cursor-pointer"
                      onClick={() => nav(`/attendance/${session.id}`)}
                    >
                      {session.event?.title || session.title || "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-neutral-400">
                      {session.venue || "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-neutral-400 flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(session.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-6 py-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSession(session);
                          setUpdateModalOpen(true);
                        }}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(session.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan="4"
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
