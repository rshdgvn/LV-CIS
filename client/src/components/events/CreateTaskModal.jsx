"use client";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { DatePicker } from "../DatePicker";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateTaskModal({ eventId, open, setOpen, onSuccess }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    due_date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${APP_URL}/create/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          event_id: eventId,
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");

      const task = await res.json();
      onSuccess?.(task); // callback to parent
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
      <DialogContent className="bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          <div>
            <Label>Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="bg-neutral-900"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="bg-neutral-900"
            />
          </div>

          <div>
            <Label>Priority</Label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full bg-neutral-900 border rounded-md p-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <Label>Status</Label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full bg-neutral-900 border rounded-md p-2"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <Label>Due Date</Label>
            <DatePicker
              value={form.due_date}
              onChange={(date) =>
                setForm((prev) => ({
                  ...prev,
                  due_date: date?.toISOString().split("T")[0],
                }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-blue-700 hover:bg-blue-600"
          >
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
