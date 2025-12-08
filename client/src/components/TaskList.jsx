import React, { useEffect, useState } from "react";
import {
  Plus,
  Loader2,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";

export default function TaskList() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // NOTE: Ensure you have a route like Route::get('/my/tasks', [TaskController::class, 'getMyTasks'])
      // Or filter client-side if using a general endpoint.
      const res = await fetch(`${APP_URL}/my/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();
      // Adjust 'data.tasks' or 'data' depending on your exact API response structure
      setTasks(data.tasks || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-950/30 text-emerald-400 border-emerald-900/50";
      case "in_progress":
        return "bg-blue-950/30 text-blue-400 border-blue-900/50";
      case "pending":
      default:
        return "bg-yellow-950/30 text-yellow-400 border-yellow-900/50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3 h-3" />;
      case "in_progress":
        return <Loader2 className="w-3 h-3 animate-spin" />; // Or a play icon
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  const formatStatus = (status) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-[#262626] p-6 h-full flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-semibold">My Tasks</h3>
          <p className="text-xs text-gray-500 mt-1">Assignments & To-Dos</p>
        </div>
        <button className="text-xs bg-[#262626] text-white px-3 py-1.5 rounded-md hover:bg-[#333] flex items-center gap-1 transition-colors">
          <Plus className="w-3 h-3" /> Add Task
        </button>
      </div>

      {/* LIST CONTAINER */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[200px]">
        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs">Loading tasks...</span>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-gray-400 text-sm font-medium">
              No pending tasks
            </p>
            <p className="text-gray-600 text-xs mt-1">You are all caught up!</p>
          </div>
        )}

        {/* TASK ITEMS */}
        {!loading &&
          tasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-center justify-between p-3 bg-[#111] border border-[#262626] rounded-lg hover:border-[#444] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {/* User/Assignee Avatars */}
                <div className="flex -space-x-2 shrink-0">
                  {task.assigned_by && task.assigned_by.length > 0 ? (
                    task.assigned_by.slice(0, 3).map((assignee, idx) => (
                      <Avatar
                        key={idx}
                        className="w-8 h-8 border-2 border-[#111]"
                      >
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback className="bg-[#333] text-[10px] text-gray-400">
                          {assignee.name ? assignee.name.charAt(0) : "?"}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  ) : (
                    <Avatar className="w-8 h-8 border-2 border-[#111]">
                      <AvatarFallback className="bg-[#333] text-[10px] text-gray-400">
                        ?
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Task Info */}
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {/* Optional: Show event name if available in your API */}
                    {task.event && (
                      <span className="truncate max-w-[100px] hidden sm:block">
                        • {task.event.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`px-2.5 py-1 rounded-full border text-[10px] font-medium flex items-center gap-1.5 ${getStatusColor(
                  task.status
                )}`}
              >
                {getStatusIcon(task.status)}
                <span className="hidden sm:inline">
                  {formatStatus(task.status)}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
