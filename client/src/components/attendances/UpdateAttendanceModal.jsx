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
import { DatePicker } from "../DatePicker";
import { formatDate } from "@/utils/formatDate";

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
      console.log(session);
      setForm({
        title: session.title || "",
        venue: session.venue || "",
        date: session.date ? session.date.split("T")[0] : "",
      });
    }
  }, [session]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleDateChange = (selectedDate) => {
    if (!selectedDate) return;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    console.log(day);

    setForm({ ...form, date: `${year}-${month}-${day}` });
  };

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
            <DatePicker
              value={form.date}
              onChange={handleDateChange}
              placeholder="Select date"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-900 hover:bg-blue-950 cursor-pointer text-white"
            >
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
