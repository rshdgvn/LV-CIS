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
} from "lucide-react";
import { APP_URL } from "@/lib/config";
import { useNavigate } from "react-router-dom";
import { SkeletonAttendances } from "@/components/skeletons/SkeletonAttendances";
import { useClub } from "@/contexts/ClubContext";
import { User, UserCheck, UserX } from "lucide-react";
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

export default function Attendances() {
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

  useEffect(() => {
    if (!clubs || clubs.length === 0) return;
    const club = clubs.find((c) => c.category === "academics") || clubs[0];
    setSelectedClub(club);
  }, [clubs]);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    console.log(sessions);
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
                  <Button className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 rounded-full px-5 py-2 flex items-center gap-2">
                    <Users size={16} /> Switch Club
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-neutral-900">
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
                        onClick={() => {
                          setSelectedClub(club);
                          setSwitchOpen(false); 
                        }}
                        className={`
            w-full flex items-center gap-4 p-3 rounded-xl transition-all border
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
                            {club.category}
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

        <div className="flex gap-10">
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
                  className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 rounded-full px-5 py-2 flex items-center gap-2"
                >
                  <Plus size={16} /> Add Session
                </Button>

                <Button
                  variant="secondary"
                  className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 rounded-full px-5 py-2 flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" /> Filter
                </Button>
              </div>
            </div>

            <Card className="border border-neutral-800 rounded-2xl mt-3 p-0">
              <Table className="bg-neutral-800/50 rounded-2xl w-full table-fixed">
                <TableHeader>
                  <TableRow className="text-center">
                    <TableHead className="px-6 py-3 text-center w-1/3">
                      Event
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center w-1/3">
                      Venue
                    </TableHead>
                    <TableHead className="px-6 py-3 text-center w-1/3">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="bg-neutral-900">
                  {paginatedSessions.length > 0 ? (
                    paginatedSessions.map((session) => (
                      <tr
                        key={session.id}
                        className="border-neutral-800/70 border-y-2 hover:bg-neutral-800 transition relative"
                      >
                        <td
                          className="px-6 py-4 text-neutral-200 text-center cursor-pointer"
                          onClick={() => nav(`/attendance/${session.id}`)}
                        >
                          {session.event?.title || session.title || "N/A"}
                        </td>

                        <td className="px-6 py-4 text-neutral-400 text-center">
                          {session.venue || "N/A"}
                        </td>

                        <td className="px-6 py-4 text-neutral-400 text-center">
                          {formatDate(session.date)}
                        </td>

                        <td className="absolute right-4 top-1/2 -translate-y-1/2">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <MoreVertical className="text-neutral-400 hover:text-white w-5 h-5 cursor-pointer" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="bg-neutral-900 border border-neutral-700 text-neutral-200">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSession(session);
                                  setUpdateModalOpen(true);
                                }}
                                className="cursor-pointer flex items-center gap-2"
                              >
                                <Edit size={14} /> Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleDelete(session.id)}
                                className="cursor-pointer text-red-400 focus:text-red-500 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
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
            </Card>

            {/* PAGINATION UI */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    {/* Previous */}
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
                            : ""
                        }
                      />
                    </PaginationItem>

                    {/* Page Numbers */}
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
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {/* Next */}
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
                            : ""
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
              <div className="text-right">
                <p className=" text-gray-300 font-medium">Total Club Members</p>
                <h3 className="text-2xl font-bold text-start text-white mt-1">
                  {analytics.total_members}
                </h3>
              </div>
            </Card>

            <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
              <UserCheck className="text-green-500 w-7 h-7" />
              <div className="text-right">
                <p className=" text-gray-300 font-medium">Active Members</p>
                <h3 className="text-2xl font-bold text-start text-white mt-1">
                  {analytics.active_members}
                </h3>
              </div>
            </Card>

            <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
              <UserX className="text-red-500 w-7 h-7" />
              <div className="text-right">
                <p className=" text-gray-300 font-medium">Inactive Members</p>
                <h3 className="text-2xl font-bold text-start text-white mt-1">
                  {analytics.inactive_members}
                </h3>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* MODALS */}
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
