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

export default function CreateTaskModal({
  eventId,
  open,
  setOpen,
  onSuccess,
  members = [],
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    due_date: "",
    assigned_members: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignToggle = (id) => {
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
      console.log(task)
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
      <DialogContent className="bg-neutral-950 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          {/* Title */}
          <div>
            <Label>Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="bg-neutral-900"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="bg-neutral-900"
            />
          </div>

          {/* Status */}
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

          {/* Due Date */}
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

          <div>
            <Label>Assign Members</Label>
            <div className="bg-neutral-900 p-3 rounded-md border max-h-40 overflow-y-auto space-y-2">
              {members.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No members available.
                </p>
              ) : (
                members.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.assigned_members.includes(m.id)}
                      onChange={() => handleAssignToggle(m.id)}
                    />
                    <span>{m.user.first_name} {m.user.last_name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-blue-600  text-white hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
