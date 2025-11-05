"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowLeft } from "lucide-react";
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

export default function EventTasksTable() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  const [eventTitle, setEventTitle] = React.useState("");
  const [eventDescription, setEventDescription] = React.useState("");
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const columnHelper = createColumnHelper();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const eventRes = await fetch(`${APP_URL}/events/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!eventRes.ok) throw new Error("Failed to fetch event details.");
        const eventData = await eventRes.json();
        setEventTitle(eventData.title);
        setEventDescription(eventData.description);

        const taskRes = await fetch(`${APP_URL}/events/${id}/tasks`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!taskRes.ok) throw new Error("Failed to fetch tasks.");
        const taskData = await taskRes.json();
        setTasks(taskData);
      } catch (err) {
        console.error(err);
        setError("Failed to load event tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("title", {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tasks
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (info) => (
          <div className="font-medium text-gray-100">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("assigned_by", {
        header: "Assigned By",
        cell: (info) => {
          const assigned = info.getValue() || [];
          return (
            <span className="text-gray-400 text-sm">
              {Array.isArray(assigned)
                ? assigned.join(", ")
                : assigned || "N/A"}
            </span>
          );
        },
      }),
      // ✅ Added created_at before due_date
      columnHelper.accessor("created_at", {
        header: "Date Created",
        cell: (info) => {
          const date = new Date(info.getValue());
          return (
            <span className="text-gray-300">{date.toLocaleDateString()}</span>
          );
        },
      }),
      columnHelper.accessor("due_date", {
        header: "Due Date",
        cell: (info) => {
          const date = new Date(info.getValue());
          return (
            <span className="text-gray-300">{date.toLocaleDateString()}</span>
          );
        },
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
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priority
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
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
              {priority}
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
    getSortedRowModel: getSortedRowModel(),
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
      {/* Header */}
      <div className="flex mb-6">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </Button>
        <div className="flex flex-col my-5 ml-14 gap-3">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-neutral-800/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 text-sm">
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
                  className="h-24 text-center text-gray-500"
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
