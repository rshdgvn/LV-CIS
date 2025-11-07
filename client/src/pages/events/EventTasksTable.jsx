"use client";

import { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
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

        // Fetch event details
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

        // Fetch tasks
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
        header: "Task",
        cell: (info) => (
          <div className="font-medium text-gray-100">
            {info.getValue() ?? "Untitled"}
          </div>
        ),
      }),
      columnHelper.accessor("assigned_by", {
        header: "Assigned By",
        cell: (info) => {
          const val = info.getValue();
          return (
            <span className="text-gray-400 text-sm">
              {Array.isArray(val) ? val.join(", ") : val || "N/A"}
            </span>
          );
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Date Created",
        cell: (info) => (
          <span className="text-gray-300">
            {info.getValue()
              ? new Date(info.getValue()).toLocaleDateString()
              : "—"}
          </span>
        ),
      }),
      columnHelper.accessor("due_date", {
        header: "Due Date",
        cell: (info) => (
          <span className="text-gray-300">
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
            <span
              className={`${getTaskStatusColor(
                status
              )} text-white text-xs px-3 py-1 rounded-full font-medium`}
            >
              {formatTaskStatus(status)}
            </span>
          );
        },
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => {
          const priority = info.getValue();
          const color =
            priority === "high"
              ? "text-red-400"
              : priority === "medium"
              ? "text-yellow-400"
              : "text-green-400";
          return (
            <span className={`${color} font-semibold capitalize`}>
              {priority ?? "N/A"}
            </span>
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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading event tasks...
      </div>
    );

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

      <div className="rounded-2xl w-5/6 border border-neutral-800 bg-neutral-900/70 self-center shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-900/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-400">
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
            {tasks.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-neutral-800/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-4 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-gray-400 py-6"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
