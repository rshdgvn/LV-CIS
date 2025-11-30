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
import { APP_URL } from "@/lib/config";
import { DatePicker } from "../DatePicker";


export default function AddAttendanceModal({
  open,
  setOpen,
  clubId,
  onSuccess,
}) {
  const [form, setForm] = useState({
    title: "",
    venue: "",
    date: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (newDate) => {
    setForm({ ...form, date: newDate });
  };

  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch(`${APP_URL}/attendance-sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        club_id: clubId,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      onSuccess();
      setOpen(false);
      setForm({
        title: "",
        venue: "",
        date: "",
      });
    } else {
      alert(data.error || "Error creating session");
    }
  };

  useEffect(() => {
    console.log(clubId);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Attendance Session</DialogTitle>
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
              selected={form.date ? new Date(form.date) : null}
              onChange={handleDateChange}
              placeholder="Select date"
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
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
