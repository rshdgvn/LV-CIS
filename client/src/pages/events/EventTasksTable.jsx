"use client";

import { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowLeft, Search, Filter, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

function CreateTaskModal({ open, setOpen, eventId, onSuccess }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    due_date: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setForm({
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        due_date: "",
      });
      setErrors({});
      setLoading(false);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!["low", "medium", "high"].includes(form.priority))
      e.priority = "Invalid priority";
    if (!["pending", "in_progress", "completed"].includes(form.status))
      e.status = "Invalid status";
    if (form.due_date && isNaN(Date.parse(form.due_date)))
      e.due_date = "Invalid date";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        event_id: eventId,
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        status: form.status,
        due_date: form.due_date || null,
      };

      const res = await fetch(`${APP_URL}/create/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Failed to create task`);
      }

      const task = await res.json();
      onSuccess?.(task);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="!max-w-md bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Title *</Label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="bg-neutral-900 border-neutral-800"
            />
            {errors.title && (
              <p className="text-xs text-rose-400 mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="bg-neutral-900 border-neutral-800 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority *</Label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md p-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <Label>Status *</Label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md p-2"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Due Date</Label>
            <Input
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
              className="bg-neutral-900 border-neutral-800"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-3 justify-end w-full">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="text-gray-300"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-700 hover:bg-blue-600"
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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

  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const columnHelper = createColumnHelper();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const eventRes = await fetch(`${APP_URL}/events/${id}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!eventRes.ok) throw new Error("Failed to fetch event");
        const eventData = await eventRes.json();

        setEventTitle(eventData.title || "");
        setEventDescription(eventData.description || "");

        const taskRes = await fetch(`${APP_URL}/events/${id}/tasks`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!taskRes.ok) throw new Error("Failed to fetch tasks");
        const taskData = await taskRes.json();

        setTasks(normalizeTasks(taskData));
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
          <div className="font-medium text-white text-center">
            {info.getValue() ?? "Untitled"}
          </div>
        ),
      }),
      columnHelper.accessor("assigned_by", {
        header: "Assigned By",
        cell: (info) => {
          const users = info.getValue() || [];
          return (
            <div className="flex justify-center">
              <div className="flex -space-x-3">
                {users.length ? (
                  users.map((u, i) => (
                    <img
                      key={i}
                      src={
                        u.avatar ||
                        `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(
                          `${u.name}`
                        )}`
                      }
                      className="w-10 h-10 rounded-full border-2 border-neutral-900 object-cover"
                    />
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">—</span>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("due_date", {
        header: "Due Date",
        cell: (info) => (
          <span className="text-white text-center block">
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
              <Select
                value={status}
                onValueChange={(value) => handleStatusChange(id, value)}
              >
                <SelectTrigger
                  className={`bg-blue-700
      h-7! w-24 rounded-lg ${
        status == "completed" ? "text-[10px]" : "text-xs"
      } font-medium 
      flex items-center justify-between px-2
      text-white ${getTaskStatusColor(status)}
      border-none shadow-sm
    `}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent className="text-xs">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
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
          className="absolute top-4 left-4 z-50 p-2 rounded-md bg-neutral-800/60 hover:bg-neutral-950/60"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col mb-10 ml-14 gap-3">
          <h1 className="text-4xl font-semibold">{eventTitle}</h1>
          <p className="text-gray-400">{eventDescription}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6 w-5/6 self-center">
        <div className="flex items-center gap-2 bg-[#121212] rounded-full px-4 py-2 w-xl border border-neutral-800">
          <Search className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Tasks"
            className="flex-1 bg-transparent text-sm text-gray-300 outline-none placeholder-gray-500"
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              if (!q) return;
              setTasks((prev) =>
                prev.filter((t) => (t.title || "").toLowerCase().includes(q))
              );
            }}
          />
        </div>

        <Button className="bg-[#121212] border border-neutral-800 hover:bg-neutral-800 text-gray-300 text-sm rounded-full px-5 py-2 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>

        <div className="ml-auto">
          <Button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center text-white gap-2 rounded-lg px-4 py-2 bg-blue-950 hover:bg-blue-900"
          >
            <PlusCircle className="w-4 h-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="rounded-2xl w-5/6 bg-[#121212] border border-neutral-800 self-center shadow-md overflow-hidden">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-[#1a1a1a]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-white text-sm py-4 px-6 text-center w-1/4"
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
              <TableRow key={row.id} className="hover:bg-neutral-800/50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="h-14 px-6 text-sm text-gray-200 text-center align-middle w-1/4"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {Array.from({ length: blankRows }).map((_, i) => (
              <TableRow key={`blank-${i}`} className="hover:bg-neutral-800/10">
                {columns.map((_, j) => (
                  <TableCell
                    key={`blank-${i}-${j}`}
                    className="h-14 px-6 text-sm text-gray-200 text-center align-middle w-1/4"
                  ></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateTaskModal
        open={taskModalOpen}
        setOpen={setTaskModalOpen}
        eventId={id}
        onSuccess={(task) => {
          const normalized = {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            due_date: task.due_date,
            assigned_by: task.assigned_by ?? [],
          };
          setTasks((prev) => [normalized, ...prev]);
        }}
      />
    </div>
  );
}
