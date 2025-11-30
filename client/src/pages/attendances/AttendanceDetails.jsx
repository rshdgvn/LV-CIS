"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ArrowLeft, CheckCircle2, Filter } from "lucide-react";
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
      console.log('s',data);
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
    return { present, absent, late };
  }, [session]);

  if (loading) return <SkeletonAttendanceDetails />;

  if (!session)
    return (
      <div className="p-6 text-center text-red-400">Session not found.</div>
    );

  return (
    <div className="p-6 bg-neutral-950 text-white flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-md bg-neutral-800/60 hover:bg-neutral-950/60 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">
            {session.event?.title || session.title}
          </h1>
          <p className="text-gray-400 text-md">Record today’s attendance</p>
        </div>
      </div>

      {/* Filter + Date Controls */}
      {/* <div className="flex justify-end items-center gap-3">
        <Button
          variant="outline"
          className="bg-neutral-900 border border-neutral-800 text-gray-300 hover:bg-neutral-800 rounded-full text-sm flex items-center gap-2 px-4 py-1.5"
        >
          <Filter className="w-4 h-4" />
          Filter
        </Button>

        <div className="bg-[#121212] border border-neutral-800 rounded-full px-4 py-2 text-gray-300 text-sm flex items-center gap-2">
          <Calendar size={14} />
          {new Date(session.date).toLocaleDateString()}
        </div>
      </div> */}

      <div className="flex flex-col lg:flex-row gap-6 mx-4 lg:mx-20">
        {/* Table section */}
        <Card className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm mt-2 overflow-hidden">
          <CardContent className="p-0">
            {/* Make table scrollable on small screens */}
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-neutral-800 text-gray-400">
                    <TableHead className="text-left pl-6">Students</TableHead>
                    <TableHead className="text-center">Year Level</TableHead>
                    <TableHead className="text-center pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {session.members?.length > 0 ? (
                    session.members.map((member) => {
                      const s = formatStatus(member.status);
                      return (
                        <TableRow
                          key={member.user_id}
                          className="border-neutral-900 hover:bg-neutral-900/50 transition"
                        >
                          <TableCell
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() =>
                              navigate(
                                `/member-attendances/${member.user_id}/${session.club.id}`
                              )
                            }
                          >
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
                            <div className="text-gray-200">{member.name}</div>
                          </TableCell>

                          <TableCell className="text-center text-gray-300">
                            {member.course || "N/A"}
                          </TableCell>

                          <TableCell className="text-center pr-6">
                            <div className="flex justify-center items-center gap-2">
                              <Select
                                value={(member.status || "").toLowerCase()}
                                onValueChange={(value) =>
                                  updateStatus(member.user_id, value)
                                }
                              >
                                <SelectTrigger
                                  className={`w-[120px] justify-center text-sm rounded-full border ${s.bg} ${s.color}`}
                                >
                                  <SelectValue>{s.label}</SelectValue>
                                </SelectTrigger>

                                <SelectContent className="bg-[#121212] border border-neutral-800">
                                  <SelectItem value="present">
                                    Present
                                  </SelectItem>
                                  <SelectItem value="absent">Absent</SelectItem>
                                  <SelectItem value="late">Late</SelectItem>
                                  <SelectItem value="excuse">Excuse</SelectItem>
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
                        className="text-center py-6 text-gray-400 italic"
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

        {/* Summary cards on the right */}
        <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-[260px] mt-2">
          {/* Present */}
          <Card className="bg-[#111111] border-none rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
            <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="text-green-500 w-5 h-5" />
            </div>
            <div className="text-right">
              <p className="text-md text-gray-300 font-medium">
                Total Students Present
              </p>
              <h3 className="text-2xl font-bold text-start text-white mt-1">
                {stats.present}
              </h3>
            </div>
          </Card>

          {/* Absent */}
          <Card className="bg-[#111111] border-none rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
            <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center">
              <User className="text-red-500 w-5 h-5" />
            </div>
            <div className="text-right">
              <p className="text-md text-gray-300 font-medium">
                Total Students Absent
              </p>
              <h3 className="text-2xl font-bold text-start text-white mt-1">
                {stats.absent}
              </h3>
            </div>
          </Card>

          {/* Late */}
          <Card className="bg-[#111111] border-none rounded-2xl shadow-sm p-3 flex-none flex flex-row items-center h-24">
            <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock8 className="text-yellow-400 w-5 h-5" />
            </div>
            <div className="text-right">
              <p className="text-md text-gray-300 font-medium">
                Total Students Late
              </p>
              <h3 className="text-2xl font-bold text-start text-white mt-1">
                {stats.late}
              </h3>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
