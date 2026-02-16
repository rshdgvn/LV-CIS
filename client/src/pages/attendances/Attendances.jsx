"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Filter,
  Search,
  Users,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  User,
  UserCheck,
  UserX,
  FolderOpen,
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

import AddAttendanceModal from "@/components/attendances/AddAttendanceModal";
import UpdateAttendanceModal from "@/components/attendances/UpdateAttendanceModal";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/formatDate";
import { SmallCalendar } from "@/components/SmallCalendar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatClubCategory } from "@/utils/formatClubCategory";
import { useToast } from "@/providers/ToastProvider";

export default function Attendances() {
  const { addToast } = useToast();
  const { clubs, loading: clubsLoading } = useClub();
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const nav = useNavigate();

  const [switchOpen, setSwitchOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // --- UPDATED: Persist Club Selection Logic ---
  useEffect(() => {
    if (!clubs || clubs.length === 0) return;

    // 1. Try to get saved club ID from sessionStorage
    const savedClubId = sessionStorage.getItem("selected_attendance_club_id");

    // 2. Check if the saved ID actually exists in the user's current clubs list
    const savedClub = savedClubId
      ? clubs.find((c) => String(c.id) === String(savedClubId))
      : null;

    if (savedClub) {
      setSelectedClub(savedClub);
    } else {
      // 3. Fallback to default logic if no save found or club no longer exists
      const defaultClub =
        clubs.find((c) => c.category === "academics") || clubs[0];
      setSelectedClub(defaultClub);
      // Save the default to session so it sticks immediately
      if (defaultClub) {
        sessionStorage.setItem("selected_attendance_club_id", defaultClub.id);
      }
    }
  }, [clubs]);

  // Helper function to handle switching clubs
  const handleSwitchClub = (club) => {
    setSelectedClub(club);
    sessionStorage.setItem("selected_attendance_club_id", club.id); // Save to storage
    setSwitchOpen(false);
  };
  // --------------------------------------------

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
      setAnalytics(data.analytics || []);
    } catch (err) {
      console.error(err);
      addToast("Failed to fetch sessions.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedClub]);

  const filteredSessions = sessions.filter((session) => {
    const title = session.title || session.event?.title || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sessions]);

  const handleDelete = async (sessionId) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_URL}/attendance-sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        addToast(errorData.message, "error");
        return;
      }

      addToast("Session deleted successfully", "success");
      fetchSessions();
    } catch (err) {
      console.error(err);
      addToast("Failed to delete session", "error");
    }
  };

  if (loading || clubsLoading)
    return (
      <div className="px-8 py-6 w-full h-screen">
        <SkeletonAttendances />
      </div>
    );

  if (!clubs || clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="bg-neutral-900 p-4 rounded-full mb-4 border border-neutral-800">
          <FolderOpen className="w-10 h-10 text-neutral-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Clubs Found</h2>
        <p className="text-neutral-400 max-w-md mb-6">
          You are not a member of any club yet. Join a club to start managing
          attendances.
        </p>
        <Button
          onClick={() => nav("/clubs")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Browse Clubs
        </Button>
      </div>
    );
  }

  if (!selectedClub) return null;

  return (
    <div className="px-8 py-6 text-neutral-100 w-full flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={
                selectedClub.logo_url ||
                `https://ui-avatars.com/api/?background=111&color=fff&name=${encodeURIComponent(
                  selectedClub.name
                )}`
              }
              alt={selectedClub.name}
              className="w-20 h-20 rounded-full object-cover border border-neutral-700"
            />

            <div>
              <h1 className="text-3xl font-semibold mb-3">
                {selectedClub.name}
              </h1>

              <Dialog open={switchOpen} onOpenChange={setSwitchOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 rounded-full px-5 py-2 flex items-center gap-2 cursor-pointer">
                    <Users size={16} /> Switch Club
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-neutral-900 border-neutral-800 text-white">
                  <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-6 py-4 z-10">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-semibold">
                        Select Club
                      </DialogTitle>
                    </DialogHeader>
                  </div>

                  <div className="max-h-96 overflow-y-auto px-6 py-4 space-y-3 bg-neutral-900">
                    {clubs.map((club) => (
                      <button
                        key={club.id}
                        // UPDATED: Use handleSwitchClub
                        onClick={() => handleSwitchClub(club)}
                        className={`
                            w-full flex items-center gap-4 p-3 rounded-xl transition-all border text-left
                            ${
                              selectedClub?.id === club.id
                                ? "border-blue-500 bg-blue-500/10 shadow-lg"
                                : "border-neutral-800 hover:bg-neutral-800/70"
                            }
                        `}
                      >
                        <img
                          src={
                            club.logo_url ||
                            `https://ui-avatars.com/api/?background=0D1117&color=fff&name=${encodeURIComponent(
                              club.name
                            )}`
                          }
                          alt={club.name}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-700"
                        />

                        <div className="flex flex-col items-start">
                          <p className="text-white font-medium text-base">
                            {club.name}
                          </p>
                          <p className="text-neutral-400 text-sm">
                            {formatClubCategory(club.category)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="sticky bottom-0 bg-neutral-900 border-t border-neutral-800 px-6 py-3">
                    <DialogFooter>
                      <Button
                        onClick={() => setSwitchOpen(false)}
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="flex gap-10 md:flex-row flex-col">
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 bg-neutral-900 rounded-full px-4 py-2 border border-neutral-800 w-full max-w-[350px]">
                <Search className="w-5 h-5 text-neutral-500" />
                <input
                  placeholder="Search events"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-neutral-300 outline-none placeholder-neutral-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setAddModalOpen(true)}
                  className="bg-blue-950 border border-neutral-800 hover:bg-blue-900 text-neutral-200 rounded-lg px-5 py-2 flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} /> Add Session
                </Button>
              </div>
            </div>

            <Card className="border border-neutral-800 rounded-2xl mt-3 p-0 shadow-lg">
              <Table className="bg-neutral-800/50 rounded-2xl w-full table-fixed">
                <TableHeader>
                  <TableRow className="text-center border-neutral-700">
                    <TableHead className="px-6 py-3 text-center w-1/3 text-neutral-300">
                      Event
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center w-1/3 text-neutral-300">
                      Venue
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center w-1/3 text-neutral-300">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="bg-neutral-900">
                  {paginatedSessions.length > 0 ? (
                    paginatedSessions.map((session) => (
                      <TableRow
                        key={session.id}
                        className="border-b border-neutral-800/70 hover:bg-neutral-800 transition relative"
                      >
                        <TableCell
                          className="px-6 py-4 text-neutral-200 text-center font-medium cursor-pointer hover:text-blue-400"
                          onClick={() => nav(`/attendance/${session.id}`)}
                        >
                          {session.event?.title || session.title || "N/A"}
                        </TableCell>

                        <TableCell className="px-6 py-4 text-neutral-400 text-center">
                          {session.venue || "N/A"}
                        </TableCell>

                        <TableCell className="px-6 py-4 text-neutral-400 text-center relative group">
                          {formatDate(session.date)}

                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                align="end"
                                className="bg-neutral-900 border border-neutral-700 text-neutral-200"
                              >
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSession(session);
                                    setUpdateModalOpen(true);
                                  }}
                                  className="cursor-pointer flex items-center gap-2 focus:bg-neutral-800 focus:text-white"
                                >
                                  <Edit size={14} /> Edit
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(session.id);
                                  }}
                                  className="cursor-pointer text-red-400 focus:bg-red-900/20 focus:text-red-400 flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan="3"
                        className="text-center py-8 text-neutral-500 italic"
                      >
                        No attendance sessions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* PAGINATION UI */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(p - 1, 1));
                        }}
                        className={
                          currentPage === 1
                            ? "opacity-50 pointer-events-none"
                            : "text-neutral-400 hover:text-white"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNum = index + 1;

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === pageNum}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNum);
                            }}
                            className={
                              currentPage === pageNum
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "text-neutral-400 hover:text-white"
                            }
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.min(p + 1, totalPages));
                        }}
                        className={
                          currentPage === totalPages
                            ? "opacity-50 pointer-events-none"
                            : "text-neutral-400 hover:text-white"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 mt-14">
            <SmallCalendar />
            <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
              <User className="text-blue-500 w-7 h-7" />
              <div className="text-right flex-1">
                <p className=" text-gray-300 font-medium text-sm">
                  Total Members
                </p>
                <h3 className="text-2xl font-bold text-end text-white mt-1">
                  {analytics.total_members || 0}
                </h3>
              </div>
            </Card>

            <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
              <UserCheck className="text-green-500 w-7 h-7" />
              <div className="text-right flex-1">
                <p className=" text-gray-300 font-medium text-sm">
                  Active Members
                </p>
                <h3 className="text-2xl font-bold text-end text-white mt-1">
                  {analytics.active_members || 0}
                </h3>
              </div>
            </Card>

            <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
              <UserX className="text-red-500 w-7 h-7" />
              <div className="text-right flex-1">
                <p className=" text-gray-300 font-medium text-sm">
                  Inactive Members
                </p>
                <h3 className="text-2xl font-bold text-end text-white mt-1">
                  {analytics.inactive_members || 0}
                </h3>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AddAttendanceModal
        open={addModalOpen}
        setOpen={setAddModalOpen}
        clubId={selectedClub.id}
        onSuccess={fetchSessions}
      />

      <UpdateAttendanceModal
        open={updateModalOpen}
        setOpen={setUpdateModalOpen}
        session={selectedSession}
        onSuccess={fetchSessions}
      />
    </div>
  );
}
