"use client";

import { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowLeft, Bell, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";
import { formatTaskStatus } from "@/utils/formatTaskStatus";
import { getTaskStatusColor } from "@/utils/getTaskStatusColor";
import { SkeletonEventTasksTable } from "@/components/skeletons/SkeletonEventTasksTable";

function normalizeTasks(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.tasks)) return data.tasks;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export default function EventTasksTable() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columnHelper = createColumnHelper();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id || !token) {
          setLoading(false);
          return;
        }

        const eventRes = await fetch(`${APP_URL}/events/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!eventRes.ok) throw new Error("Failed to fetch event details.");
        const eventData = await eventRes.json();
        setEventTitle(eventData.title || "");
        setEventDescription(eventData.description || "");

        const taskRes = await fetch(`${APP_URL}/events/${id}/tasks`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!taskRes.ok) throw new Error("Failed to fetch tasks.");
        const taskData = await taskRes.json();

        const normalized = normalizeTasks(taskData);
        setTasks(normalized);
      } catch (err) {
        console.error(err);
        setError("Failed to load event tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Tasks",
        cell: (info) => (
          <div className="font-medium text-gray-100 text-center">
            {info.getValue() ?? "Untitled"}
          </div>
        ),
      }),
      columnHelper.accessor("assigned_by", {
        header: "Assigned",
        cell: (info) => {
          const val = info.getValue();
          return (
            <span className="text-gray-400 text-sm text-center block">
              {Array.isArray(val) ? val.join(", ") : val || "N/A"}
            </span>
          );
        },
      }),
      columnHelper.accessor("due_date", {
        header: "Due Date",
        cell: (info) => (
          <span className="text-gray-300 text-center block">
            {info.getValue()
              ? new Date(info.getValue()).toLocaleDateString()
              : "—"}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <div className="flex justify-center">
              <span
                className={`${getTaskStatusColor(
                  status
                )} text-white text-xs px-3 py-1 rounded-full font-medium`}
              >
                {formatTaskStatus(status)}
              </span>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalRows = 8;
  const blankRows = Math.max(totalRows - tasks.length, 0);

  if (loading) return <SkeletonEventTasksTable />;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 flex flex-col">
      <div className="flex">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-50 p-2 rounded-md bg-neutral-800/60 hover:bg-neutral-950/60 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col mb-10 ml-14 gap-3">
          <h1 className="text-4xl font-semibold text-white">
            {eventTitle || "Event Tasks"}
          </h1>
          <p className="text-gray-400">{eventDescription}</p>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-3 mb-6 w-5/6 self-center">
        <div className="flex items-center gap-2 bg-[#121212] rounded-full px-4 py-2 w-xl border border-neutral-800">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Tasks"
            className="flex-1 bg-transparent text-sm text-gray-300 outline-none placeholder-gray-500"
          />
        </div>

        <Button
          variant="secondary"
          className="bg-[#121212] border border-neutral-800 hover:bg-neutral-800 text-gray-300 text-sm rounded-full px-5 py-2 flex items-center gap-2 shadow-sm"
        >
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <div className="rounded-2xl w-5/6 bg-[#121212] border border-neutral-800 self-center shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-[#1a1a1a]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-gray-400 text-sm py-4 px-6 text-center"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-neutral-800/50 transition"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="h-14 px-6 text-sm text-gray-200 text-center align-middle"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {Array.from({ length: blankRows }).map((_, i) => (
              <TableRow
                key={`blank-${i}`}
                className="hover:bg-neutral-800/10 transition"
              >
                {columns.map((_, j) => (
                  <TableCell
                    key={`blank-cell-${i}-${j}`}
                    className="h-14 px-6 text-sm text-gray-200 text-center align-middle"
                  ></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
