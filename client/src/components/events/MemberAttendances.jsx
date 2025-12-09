"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { APP_URL } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SkeletonAttendances } from "@/components/skeletons/SkeletonAttendances";
import { ArrowLeft, Check, User, Clock8, BookMarked, Calendar, Filter } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatDate } from "@/utils/formatDate";
import { Button } from "../ui/button";

export default function MemberAttendances() {
  const { userId, clubId } = useParams();
  const navigate = useNavigate();

  const [attendances, setAttendances] = useState([]);
  const [member, setMember] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all"); // <-- added filter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchAttendances = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${APP_URL}/members/${userId}/club/${clubId}/attendances`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error(res.status);
      const data = await res.json();

      setAttendances(data.attendances);
      setMember(data.user);
      setClub(data.club);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [userId, clubId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "text-green-400";
      case "absent":
        return "text-red-400";
      case "late":
        return "text-yellow-400";
      case "excuse":
        return "text-blue-400";
      default:
        return "text-neutral-400";
    }
  };

  // Apply filtering
  const filtered = useMemo(() => {
    if (filter === "all") return attendances;
    return attendances.filter((a) => a.status === filter);
  }, [attendances, filter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedAttendances = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => {
    const present = attendances.filter((a) => a.status === "present").length;
    const absent = attendances.filter((a) => a.status === "absent").length;
    const late = attendances.filter((a) => a.status === "late").length;
    const excuse = attendances.filter((a) => a.status === "excuse").length;
    return { present, absent, late, excuse };
  }, [attendances]);

  if (loading) return <SkeletonAttendances />;

  if (!attendances.length)
    return (
      <div className="text-center py-10 text-neutral-400">
        No attendance records found.
      </div>
    );

  return (
    <div className="p-6 text-neutral-200 flex flex-col gap-6 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 p-2 rounded-md bg-neutral-800/60 hover:bg-neutral-950/60"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Header Section */}
      <div className="flex items-center gap-4 ml-10">
        <img
          src={
            member.avatar ||
            `https://ui-avatars.com/api/?background=111&color=fff&name=${encodeURIComponent(
              member.name
            )}`
          }
          alt={member.name}
          className="w-20 h-20 rounded-full object-cover border border-neutral-700"
        />

        <div>
          <h1 className="text-3xl font-semibold mb-1">{member.name}</h1>
          <p className="text-neutral-400 text-sm">
            {member.role} - {club.name}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mx-4 lg:mx-10">
        <div className="flex flex-col flex-1">
          <div className="flex justify-end items-center gap-3">
              <Button className="bg-neutral-900 border border-neutral-800 text-gray-200 hover:bg-neutral-800 rounded-full text-sm flex items-center gap-2 px-4 py-1.5">
                <Filter className="w-4 h-4" />
                Filter
              </Button>

            {/* <div className="bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 text-gray-300 text-sm flex items-center gap-2">
              <Calendar size={14} />
              {formatDate(attendances.session?.date)}
            </div> */}
          </div>

          {/* TABLE */}
          <Card className="border border-neutral-800 rounded-2xl mt-3 p-0 bg-neutral-900">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="bg-neutral-800/50 rounded-2xl w-full table-fixed">
                  <TableHeader>
                    <TableRow className="text-center">
                      <TableHead className="px-6 py-3 text-center w-1/4">
                        Session
                      </TableHead>
                      <TableHead className="px-6 py-3 text-center w-1/4">
                        Venue
                      </TableHead>
                      <TableHead className="px-6 py-3 text-center w-1/4">
                        Date
                      </TableHead>
                      <TableHead className="px-6 py-3 text-center w-1/4">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="bg-neutral-900">
                    {paginatedAttendances.map((att) => (
                      <TableRow
                        key={att.id}
                        className="border-neutral-800/70 border-y-2 hover:bg-neutral-800 transition cursor-pointer text-center"
                      >
                        <TableCell className="px-6 py-4 text-neutral-200">
                          {att.session?.title || "N/A"}
                        </TableCell>

                        <TableCell className="px-6 py-4 text-neutral-200">
                          {att.session?.venue || "N/A"}
                        </TableCell>

                        <TableCell className="px-6 py-4 text-neutral-400">
                          {formatDate(att.session?.date)}
                        </TableCell>

                        <TableCell
                          className={`px-6 py-4 capitalize font-semibold ${getStatusColor(
                            att.status
                          )}`}
                        >
                          {att.status}
                        </TableCell>
                      </TableRow>
                    ))}
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

        {/* STATS SIDEBAR */}
        <div className="flex flex-col gap-4 w-full lg:w-64 mt-12">
          <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex flex-row items-center h-24">
            <Check className="text-green-500 w-7 h-7" />
            <div className="ml-3">
              <p className="text-gray-300 font-medium">Total Present</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.present}
              </h3>
            </div>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex flex-row items-center h-24">
            <User className="text-red-500 w-7 h-7" />
            <div className="ml-3">
              <p className="text-gray-300 font-medium">Total Absent</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.absent}
              </h3>
            </div>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex flex-row items-center h-24">
            <Clock8 className="text-yellow-400 w-7 h-7" />
            <div className="ml-3">
              <p className="text-gray-300 font-medium">Total Late</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.late}
              </h3>
            </div>
          </Card>

          <Card className="bg-neutral-900/50 border-neutral-800 rounded-2xl shadow-sm p-3 flex flex-row items-center h-24">
            <BookMarked className="text-blue-500 w-7 h-7" />
            <div className="ml-3">
              <p className="text-gray-300 font-medium">Total Excused</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {stats.excuse}
              </h3>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
