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
import { useToast } from "@/providers/ToastProvider"; // 1. Import useToast

export default function AddAttendanceModal({
  open,
  setOpen,
  clubId,
  onSuccess,
}) {
  const { addToast } = useToast(); // 2. Destructure addToast
  const [form, setForm] = useState({
    title: "",
    venue: "",
    date: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (selectedDate) => {
    if (!selectedDate) return;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    setForm({ ...form, date: `${year}-${month}-${day}` });
  };

  const submit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
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
        addToast("Session created successfully!", "success"); // Success Toast
        onSuccess();
        setOpen(false);
        setForm({
          title: "",
          venue: "",
          date: "",
        });
      } else {
        addToast(data.error || "Error creating session", "error"); // Error Toast
      }
    } catch (err) {
      console.error(err);
      addToast("Error creating session", "error"); // Catch Error Toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle>Create Attendance Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-neutral-400">Title</label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-400">Venue</label>
            <Input
              name="venue"
              value={form.venue}
              onChange={handleChange}
              className="bg-neutral-800 border-neutral-700 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-400">Date</label>
            <DatePicker
              value={form.date} // Fixed prop name from 'selected' to 'value' to match typical DatePicker
              onChange={handleDateChange}
              placeholder="Select date"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
              className="cursor-pointer bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-900 hover:bg-blue-950 text-white cursor-pointer"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
