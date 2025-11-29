"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { APP_URL } from "@/lib/config";

export default function UpdateAttendanceModal({
  open,
  setOpen,
  session,
  onSuccess,
}) {
  const [form, setForm] = useState({
    title: "",
    venue: "",
    date: "",
  });

  useEffect(() => {
    if (session) {
      console.log(session)
      setForm({
        title: session.title || "",
        venue: session.venue || "",
        date: session.date ? session.date.split("T")[0] : "",
      });
    }
  }, [session]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!session) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_URL}/attendance-sessions/${session.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess();
        setOpen(false);
      } else {
        alert(data.error || "Error updating session");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating session");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Attendance Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-neutral-400">Title</label>
            <Input name="title" value={form.title} onChange={handleChange} />
          </div>

          <div>
            <label className="text-sm text-neutral-400">Venue</label>
            <Input name="venue" value={form.venue} onChange={handleChange} />
          </div>

          <div>
            <label className="text-sm text-neutral-400">Date</label>
            <Input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
