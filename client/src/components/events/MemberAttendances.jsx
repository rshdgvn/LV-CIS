"use client";

import { useEffect, useState } from "react";
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

export default function MemberAttendances() {
  const { userId, clubId } = useParams();
  const navigate = useNavigate();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setAttendances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, [userId, clubId]);

  if (loading) return <SkeletonAttendances />;

  if (!attendances.length)
    return (
      <div className="text-center py-10 text-neutral-400">
        No attendance records found.
      </div>
    );

  return (
    <div className="p-6 text-neutral-200 flex flex-col gap-6">
      <button className="mb-4" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h1 className="text-2xl font-semibold">Member Attendance</h1>

      <Card className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-800 text-neutral-400">
                <TableHead className="px-6 py-3">Session</TableHead>
                <TableHead className="px-6 py-3">Date</TableHead>
                <TableHead className="px-6 py-3">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {attendances.map((att) => (
                <TableRow
                  key={att.id}
                  className="border-neutral-900 hover:bg-neutral-950/70 transition"
                >
                  <TableCell className="px-6 py-4 text-neutral-200">
                    {att.session?.title || "N/A"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-neutral-400">
                    {new Date(att.session?.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-neutral-400">
                    {att.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
