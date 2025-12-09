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
import { useToast } from "@/providers/ToastProvider";
import { Loader2 } from "lucide-react"; // Import Loader

export default function UpdateAttendanceModal({
  open,
  setOpen,
  session,
  onSuccess,
}) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    title: "",
    venue: "",
    date: "",
  });
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    if (session) {
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

    setForm({ ...form, date: `${year}-${month}-${day}` });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!session) return;

    setLoading(true); // Start loading

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
        addToast("Session updated successfully!", "success");
        onSuccess();
        setOpen(false);
      } else {
        addToast(data.error || "Error updating session", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error updating session", "error");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle>Update Attendance Session</DialogTitle>
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
              className="cursor-pointer bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              disabled={loading} // Disable cancel on load
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading} // Disable submit on load
              className="bg-blue-900 hover:bg-blue-950 cursor-pointer text-white min-w-[80px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
