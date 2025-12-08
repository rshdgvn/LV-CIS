// components/events/UpdateTaskModal.jsx

import { useEffect, useState } from "react";
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

export default function UpdateTaskModal({
  open,
  setOpen,
  task,
  members,
  onUpdated,
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "",
    due_date: "",
    assigned_members: [],
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        status: task.status,
        due_date: task.due_date,
        assigned_members: task.assigned?.map((a) => a.club_membership_id) || [],
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAssign = (id) => {
    setForm((prev) => {
      const exists = prev.assigned_members.includes(id);
      return {
        ...prev,
        assigned_members: exists
          ? prev.assigned_members.filter((x) => x !== id)
          : [...prev.assigned_members, id],
      };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${APP_URL}/task/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to update task");

      const updated = await res.json();
      onUpdated?.(updated);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-neutral-950 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Update Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          <div>
            <Label>Title</Label>
            <Input
              className="bg-neutral-900"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              className="bg-neutral-900"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Status</Label>
            <select
              name="status"
              className="w-full bg-neutral-900 border rounded-md p-2"
              value={form.status}
              onChange={handleChange}
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
              onChange={(d) =>
                setForm((prev) => ({
                  ...prev,
                  due_date: d?.toISOString().split("T")[0],
                }))
              }
            />
          </div>

          <div>
            <Label>Assign Members</Label>
            <div className="bg-neutral-900 p-3 rounded-md border max-h-40 overflow-y-auto space-y-2">
              {members?.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.assigned_members.includes(m.id)}
                    onChange={() => toggleAssign(m.id)}
                  />
                  <span>
                    {m.user.first_name} {m.user.last_name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Updating..." : "Update Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
