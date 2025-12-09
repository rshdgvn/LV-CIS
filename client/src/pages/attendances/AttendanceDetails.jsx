"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Filter,
  BookMarked,
} from "lucide-react";
import { Check, User, Clock8 } from "lucide-react";
import { APP_URL } from "@/lib/config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatStatus } from "@/utils/formatStatus";
import { SkeletonAttendanceDetails } from "@/components/skeletons/SkeletonAttendanceDetails";
import { formatDate } from "@/utils/formatDate";
import { useToast } from "@/providers/ToastProvider"; // 1. Import useToast

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function AttendanceDetails() {
  const { addToast } = useToast(); // 2. Destructure addToast
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_URL}/attendance-sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      setSession(data);
    } catch (error) {
      console.error("Error fetching session details:", error);
      // 3. Toast on fetch error
      addToast(error.message || "Failed to load session details.", "error");
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

      if (!res.ok) {
        const errorData = await res.json();
        addToast(errorData.message, 'error')
        return;
      }

      setSession((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.user_id === userId ? { ...m, status: newStatus } : m
        ),
      }));
    } catch (error) {
      console.error("Error updating status:", error);
      addToast("Failed to update status. Please try again.", "error");
    } finally {
      setSavingId(null);
    }
  };

  const stats = useMemo(() => {
    const present =
      session?.members?.filter((m) => m.status?.toLowerCase() === "present")
        .length || 0;
    const absent =
      session?.members?.filter((m) => m.status?.toLowerCase() === "absent")
        .length || 0;
    const late =
      session?.members?.filter((m) => m.status?.toLowerCase() === "late")
        .length || 0;
    const excuse =
      session?.members?.filter((m) => m.status?.toLowerCase() === "excuse")
        .length || 0;
    return { present, absent, late, excuse };
  }, [session]);

  if (loading) return <SkeletonAttendanceDetails />;

  if (!session)
    return (
      <div className="p-6 text-center text-red-400">Session not found.</div>
    );

  // Pagination logic
  const totalPages = Math.ceil((session.members?.length || 0) / itemsPerPage);
  const paginatedMembers = session.members?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 text-white flex flex-col gap-6">
      {/* Header */}
      <div className="flex">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-50 p-2 rounded-md bg-neutral-800/60 hover:bg-neutral-950/60"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col ml-14 gap-3">
          <h1 className="text-4xl font-semibold">
            {session.event?.title || session.title}
          </h1>
          <p className="text-gray-400">Record today’s attendance</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mx-4 lg:mx-10">
        <div className="flex flex-col flex-1">
          <div className="flex justify-end items-center gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 text-gray-300 text-sm flex items-center gap-2">
              <Calendar size={14} />
              {formatDate(session.date)}
            </div>
          </div>

          <Card className="border border-neutral-800 rounded-2xl mt-3 p-0 bg-neutral-900">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="bg-neutral-800/50 rounded-2xl w-full table-fixed">
                  <TableHeader>
                    <TableRow className="text-center">
                      <TableHead className="px-6 py-3 text-center w-1/3">
                        Students
                      </TableHead>
                      <TableHead className="px-6 py-3 text-center w-1/3">
                        Year Level
                      </TableHead>
                      <TableHead className="px-6 py-3 text-center w-1/3">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="bg-neutral-900">
                    {paginatedMembers?.length > 0 ? (
                      paginatedMembers.map((member) => {
                        const s = formatStatus(member.status);

                        return (
                          <TableRow
                            key={member.user_id}
                            className="border-neutral-800/70 border-y-2 p-1 hover:bg-neutral-800 transition cursor-pointer"
                            onClick={() =>
                              navigate(
                                `/member-attendances/${member.user_id}/${session.club.id}`
                              )
                            }
                          >
                            <TableCell className="px-6 py-4 text-neutral-200 text-center">
                              <div className="flex justify-center items-center gap-3">
                                <img
                                  src={
                                    member.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      member.name
                                    )}&background=111&color=fff`
                                  }
                                  alt={member.name}
                                  className="w-6 h-6 rounded-full border border-gray-700 object-cover"
                                />
                                <span>{member.name}</span>
                              </div>
                            </TableCell>

                            <TableCell className="px-6 py-4 text-neutral-400 text-center">
                              {member.course || "N/A"}
                            </TableCell>

                            <TableCell className="px-6 text-center">
                              <div
                                className="flex justify-center items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Select
                                  value={(member.status || "").toLowerCase()}
                                  onValueChange={(value) =>
                                    updateStatus(member.user_id, value)
                                  }
                                >
                                  <SelectTrigger
                                    className={`w-40 justify-center text-sm rounded-lg border ${s.bg} ${s.color}`}
                                  >
                                    <SelectValue placeholder="Mark Attendance">
                                      {s.label}
                                    </SelectValue>
                                  </SelectTrigger>

                                  <SelectContent className="bg-neutral-900 border border-neutral-700 text-neutral-200">
                                    <SelectItem value="present">
                                      Present
                                    </SelectItem>
                                    <SelectItem value="absent">
                                      Absent
                                    </SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                    <SelectItem value="excuse">
                                      Excused
                                    </SelectItem>
                                  </SelectContent>
                                </Select>

                                {savingId === member.user_id && (
                                  <CheckCircle2
                                    size={16}
                                    className="text-green-400 animate-pulse ml-1"
                                  />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-6 text-neutral-500 italic"
                        >
                          No members found for this session.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
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

        {/* Stats cards */}
        <div className="flex flex-col gap-4 w-full lg:w-64 mt-12">
          <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
            <Check className="text-green-500 w-7 h-7" />
            <div className="text-right">
              <p className=" text-gray-300 font-medium">
                Total Student Present
              </p>
              <h3 className="text-2xl font-bold text-start text-white mt-1">
                {stats.present}
              </h3>
            </div>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
            <User className="text-red-500 w-7 h-7" />
            <div className="text-right">
              <p className=" text-gray-300 font-medium">Total Student Absent</p>
              <h3 className="text-2xl font-bold text-start text-white mt-1">
                {stats.absent}
              </h3>
            </div>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
            <Clock8 className="text-yellow-400 w-7 h-7" />
            <div className="text-right">
              <p className=" text-gray-300 font-medium">Total Student Late</p>
              <h3 className="text-2xl font-bold text-start text-white mt-1">
                {stats.late}
              </h3>
            </div>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
            <BookMarked className="text-blue-500 w-7 h-7" />
            <div className="text-right">
              <p className=" text-gray-300 font-medium">
                Total Student Excused
              </p>
              <h3 className="text-2xl font-bold text-start text-white mt-1">
                {stats.excuse}
              </h3>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
