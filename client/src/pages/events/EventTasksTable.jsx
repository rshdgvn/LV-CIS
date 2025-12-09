import { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowLeft, Search, Filter, PlusCircle, Lock } from "lucide-react";
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
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";
import { getTaskStatusColor } from "@/utils/getTaskStatusColor";
import { SkeletonEventTasksTable } from "@/components/skeletons/SkeletonEventTasksTable";
import CreateTaskModal from "@/components/events/CreateTaskModal";
import ReadTaskModal from "@/components/events/ReadTaskModal";
import UpdateTaskModal from "@/components/events/UpdateTaskModal";
import { useToast } from "@/providers/ToastProvider";
import { usePermissions } from "@/hooks/usePermissions"; // 1. Import Permission Hook

// Normalizing tasks from backend
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
  const { addToast } = useToast();
  const { canManageClub } = usePermissions(); // 2. Destructure hook

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [clubId, setClubId] = useState(null); // Store clubId

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [readOpen, setReadOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);

  const columnHelper = createColumnHelper();

  // 3. Permission Check Helper
  const hasPermission = canManageClub(clubId);

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (!hasPermission) {
      addToast("You do not have permission to delete tasks.", "error");
      return;
    }

    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(`${APP_URL}/delete/task/${taskId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete task.");
        }

        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        addToast("Task deleted successfully!", "success");
      } catch (err) {
        console.error(err);
        addToast("Failed to delete task.", "error");
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (!hasPermission) {
      addToast("You do not have permission to update task status.", "error");
      return;
    }

    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      await fetch(`${APP_URL}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      addToast("Task status updated successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to update task status.", "error");
    }
  };

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
        setClubId(eventData.club_id); // Save club ID for permission check

        const taskRes = await fetch(`${APP_URL}/events/${id}/tasks`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!taskRes.ok) throw new Error("Failed to fetch tasks");

        const data = await taskRes.json();
        setTasks(normalizeTasks(data.tasks));
        setMembers(data.members || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load event tasks.");
        addToast("Failed to load event tasks.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const openReadModal = async (taskId) => {
    try {
      const res = await fetch(`${APP_URL}/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setSelectedTask({
        ...data.task,
        assigned: data.assigned ?? [],
      });
      setReadOpen(true);
    } catch (err) {
      console.error(err);
      addToast("Failed to load task.", "error");
    }
  };

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
          const task = info.row.original;
          return (
            <div className="flex justify-center">
              <Select
                value={task.status}
                onValueChange={(value) => handleStatusChange(task.id, value)}
                disabled={!hasPermission} // Disable dropdown if no permission
              >
                <SelectTrigger
                  className={`bg-blue-700 h-7 w-24 rounded-lg ${
                    task.status == "completed" ? "text-[10px]" : "text-xs"
                  } font-medium flex items-center justify-between px-2 text-white ${getTaskStatusColor(
                    task.status
                  )} border-none shadow-sm ${
                    !hasPermission ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <SelectValue />
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
    [hasPermission] // Re-render table if permissions change
  );

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <SkeletonEventTasksTable />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 flex flex-col">
      {/* Back Button + Title */}
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

      {/* Search / Filter / Add */}
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
          {hasPermission ? (
            <Button
              onClick={() => setTaskModalOpen(true)}
              className="flex items-center text-white gap-2 rounded-lg px-4 py-2 bg-blue-950 hover:bg-blue-900"
            >
              <PlusCircle className="w-4 h-4" />
              Add Task
            </Button>
          ) : (
            <Button
              disabled
              className="flex items-center text-gray-400 gap-2 rounded-lg px-4 py-2 bg-neutral-800 cursor-not-allowed opacity-50"
            >
              <Lock className="w-4 h-4" />
              ReadOnly
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="w-xl sm:w-5/6 self-center overflow-x-auto">
        <div className="min-w-[750px] bg-[#121212] border border-neutral-800 rounded-2xl shadow-md overflow-hidden">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-[#1a1a1a]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-white text-sm py-4 px-4 text-center w-1/4 
             truncate whitespace-nowrap overflow-hidden text-ellipsis"
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
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <p className="text-sm">No tasks found for this event.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-neutral-800/50 cursor-pointer"
                    onClick={() => openReadModal(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="h-14 px-4 text-sm text-gray-200 text-center align-middle w-1/4
             truncate whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateTaskModal
        eventId={id}
        open={taskModalOpen}
        setOpen={setTaskModalOpen}
        onSuccess={(task) => {
          setTasks((prev) => [task, ...prev]);
          addToast("Task added successfully!", "success");
        }}
        members={members}
      />

      <ReadTaskModal
        open={readOpen}
        setOpen={setReadOpen}
        task={selectedTask}
        onEdit={() => {
          if (!hasPermission) {
            addToast("You cannot edit tasks.", "error");
            return;
          }
          setReadOpen(false);
          setUpdateOpen(true);
        }}
        onDelete={handleDeleteTask}
        canManage={hasPermission} 
      />

      <UpdateTaskModal
        open={updateOpen}
        setOpen={setUpdateOpen}
        task={selectedTask}
        members={members}
        onUpdated={(updated) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
          );
          setSelectedTask(updated);
          addToast("Task updated successfully!", "success");
        }}
      />
    </div>
  );
}
