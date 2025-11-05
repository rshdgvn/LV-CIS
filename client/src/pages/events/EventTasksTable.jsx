"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowLeft, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function EventTasksTable() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  const [eventTitle, setEventTitle] = React.useState("");
  const [eventDescription, setEventDescription] = React.useState("");
  const [tasks, setTasks] = React.useState([]);
  const [filteredTasks, setFilteredTasks] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterPriority, setFilterPriority] = React.useState("all");
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
        setFilteredTasks(taskData);
      } catch (err) {
        console.error(err);
        setError("Failed to load event tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  React.useEffect(() => {
    let filtered = tasks;

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (t) => t.status?.toLowerCase() === filterStatus
      );
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter(
        (t) => t.priority?.toLowerCase() === filterPriority
      );
    }

    if (search.trim() !== "") {
      filtered = filtered.filter((t) =>
        t.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [search, filterStatus, filterPriority, tasks]);

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
    data: filteredTasks,
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

      <div className="flex items-center gap-10 w-5/6 mx-auto mb-4">
        <div className="relative w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Search Tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-neutral-900 border-neutral-800 text-white placeholder:text-gray-500 w-full"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-white">
            <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-gray-400 text-xs">
              Status
            </DropdownMenuLabel>
            {["all", "pending", "in-progress", "completed"].map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => setFilterStatus(status)}
              >
                {status === "all" ? "All Statuses" : formatTaskStatus(status)}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-gray-400 text-xs">
              Priority
            </DropdownMenuLabel>
            {["all", "high", "medium", "low"].map((priority) => (
              <DropdownMenuItem
                key={priority}
                onClick={() => setFilterPriority(priority)}
              >
                {priority === "all"
                  ? "All Priorities"
                  : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
            {(() => {
              const MIN_ROWS = 8;
              const rows = table.getRowModel().rows;
              const paddedRows = [
                ...rows,
                ...Array(Math.max(0, MIN_ROWS - rows.length)).fill(null),
              ];

              return paddedRows.map((row, i) =>
                row ? (
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
                ) : (
                  <TableRow key={`empty-${i}`} className="opacity-20">
                    {columns.map((_, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className="py-4 text-sm text-gray-500"
                      >
                        —
                      </TableCell>
                    ))}
                  </TableRow>
                )
              );
            })()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
