import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "../DatePicker";
import { TimePicker } from "../TimePicker";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { X, Loader2 } from "lucide-react";
import { useClub } from "@/contexts/ClubContext";

export default function UpdateEventModal({ event, onSuccess }) {
  const { token } = useAuth();
  // 2. Get clubs
  const { clubs } = useClub();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { canManageClub } = usePermissions();

  const [form, setForm] = useState({
    club_id: "",
    title: "",
    purpose: "",
    description: "",
    cover_image: null,
    photos: [],
    videos: [],
    status: "upcoming",
    event_date: "",
    event_time: "",
    venue: "",
    organizer: "",
    contact_person: "",
    contact_email: "",
    event_mode: "face_to_face",
    duration: "",
  });

  // Populate form
  useEffect(() => {
    if (event) {
      setForm({
        club_id: event.club_id || "",
        title: event.title || "",
        purpose: event.purpose || "",
        description: event.description || "",
        cover_image: event.cover_image || null,
        photos: event.photos || [],
        videos: event.videos || [],
        status: event.status || "upcoming",
        event_date: event.detail?.event_date || "",
        event_time: event.detail?.event_time || "",
        venue: event.detail?.venue || "",
        organizer: event.detail?.organizer || "",
        contact_person: event.detail?.contact_person || "",
        contact_email: event.detail?.contact_email || "",
        event_mode: event.detail?.event_mode || "face_to_face",
        duration: event.detail?.duration || "",
      });
      setErrors({});
    }
  }, [event, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ... [Keep existing handleCoverChange, handleAttachmentAdd, removeAttachment, removeCoverImage logic] ...
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, cover_image: file }));
    if (errors.cover_image)
      setErrors((prev) => ({ ...prev, cover_image: null }));
  };

  const handleAttachmentAdd = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const targetKey = isVideo ? "videos" : "photos";
    setForm((prev) => ({ ...prev, [targetKey]: [...prev[targetKey], file] }));
  };

  const removeAttachment = (index, type) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const removeCoverImage = () => {
    setForm((prev) => ({ ...prev, cover_image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("_method", "PATCH");

      Object.entries(form).forEach(([key, value]) => {
        if (key === "photos") {
          value.forEach((item) => {
            if (item instanceof File) formData.append("photos[]", item);
            else if (typeof item === "string")
              formData.append("existing_photos[]", item);
          });
        } else if (key === "videos") {
          value.forEach((item) => {
            if (item instanceof File) formData.append("videos[]", item);
            else if (typeof item === "string")
              formData.append("existing_videos[]", item);
          });
        } else if (key === "cover_image") {
          if (value instanceof File) formData.append("cover_image", value);
          else if (typeof value === "string" && value !== "")
            formData.append("existing_cover_image", value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const res = await fetch(`${APP_URL}/events/${event.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          setErrors(data.errors);
          const errorMessages = Object.values(data.errors).flat().join("\n");
          alert("Validation Failed:\n" + errorMessages);
          throw new Error("Validation failed");
        }
        throw new Error(data.message || "Failed to update event");
      }

      onSuccess?.(data.event);
      setOpen(false);
    } catch (err) {
      console.error(err);
      if (err.message !== "Validation failed") {
        alert(err.message || "Failed to update event.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isAllow = canManageClub(event?.club_id);
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isAllow && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-400 border-blue-600/50 hover:bg-blue-900/10"
          >
            Edit Event
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="!max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-950 text-white border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Event</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
        >
          {/* --- LEFT SECTION --- */}
          <div className="space-y-4">
            {/* Club Selection */}
            <div>
              <Label className="text-neutral-400">
                Club <span className="text-red-500">*</span>
              </Label>
              <select
                name="club_id"
                value={form.club_id}
                onChange={handleChange}
                className={`w-full bg-neutral-900 border rounded-md p-2 text-sm text-neutral-200 focus:outline-none focus:border-blue-700 ${
                  errors.club_id ? "border-red-500" : "border-neutral-800"
                }`}
              >
                <option value="" disabled>
                  Select a club...
                </option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
              {errors.club_id && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.club_id[0]}
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <Label className="text-neutral-400">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                className={`bg-neutral-900 border-neutral-800 ${
                  errors.title ? "border-red-500" : ""
                }`}
              />
              {errors.title && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.title[0]}
                </span>
              )}
            </div>

            {/* Purpose */}
            <div>
              <Label className="text-neutral-400">Purpose</Label>
              <Textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                className={`bg-neutral-900 border-neutral-800 min-h-[80px] ${
                  errors.purpose ? "border-red-500" : ""
                }`}
              />
              {errors.purpose && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.purpose[0]}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <Label className="text-neutral-400">Description</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`bg-neutral-900 border-neutral-800 min-h-[100px] ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.description[0]}
                </span>
              )}
            </div>

            {/* Cover Image Logic (Same as before) */}
            <div>
              <Label className="text-neutral-400">Cover Image</Label>
              <label
                className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-900 transition mt-2 overflow-hidden ${
                  errors.cover_image ? "border-red-500" : ""
                }`}
              >
                {form.cover_image ? (
                  <>
                    <img
                      src={
                        typeof form.cover_image === "string"
                          ? form.cover_image
                          : URL.createObjectURL(form.cover_image)
                      }
                      alt="Current Cover"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCoverImage();
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-600/80 rounded-full p-1 transition"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-neutral-500">
                    <span className="text-3xl font-light">+</span>
                    <span className="text-xs mt-1">Upload Cover</span>
                  </div>
                )}
                <input
                  type="file"
                  name="cover_image"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </label>
              {errors.cover_image && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.cover_image[0]}
                </span>
              )}
            </div>

            {/* Attachments Logic (Same as before, skipping redundant code for brevity) */}
            <div>
              <Label className="text-neutral-400">Attachments</Label>
              {/* ... (Existing logic for displaying attachments in grid) ... */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                {form.photos.map((file, index) => (
                  <div
                    key={`p-${index}`}
                    className="relative h-24 border border-neutral-700 rounded-lg overflow-hidden bg-neutral-900"
                  >
                    <img
                      src={
                        file instanceof File ? URL.createObjectURL(file) : file
                      }
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(index, "photos")}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 rounded-full p-1"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {/* ... (Video logic same as CreateModal) ... */}
                {form.videos.map((file, index) => (
                  <div
                    key={`v-${index}`}
                    className="relative h-24 border border-neutral-700 rounded-lg overflow-hidden bg-neutral-900"
                  >
                    <video
                      src={
                        file instanceof File ? URL.createObjectURL(file) : file
                      }
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachment(index, "videos")}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 rounded-full p-1"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center h-24 border border-dashed border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-900 transition text-neutral-500">
                  <span className="text-2xl">+</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleAttachmentAdd}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* --- RIGHT SECTION (Same fields) --- */}
          <div className="space-y-4">
            <div>
              <Label className="text-neutral-400">Date</Label>
              <DatePicker
                value={form.event_date}
                onChange={(date) =>
                  setForm((prev) => ({
                    ...prev,
                    event_date: date ? date.toISOString().split("T")[0] : "",
                  }))
                }
              />
            </div>
            <div>
              <Label className="text-neutral-400">Time</Label>
              <TimePicker
                value={form.event_time}
                onChange={(time) =>
                  setForm((prev) => ({ ...prev, event_time: time }))
                }
              />
            </div>
            <div>
              <Label className="text-neutral-400">Venue</Label>
              <Input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>
            <div>
              <Label className="text-neutral-400">Organizer</Label>
              <Input
                name="organizer"
                value={form.organizer}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>
            <div>
              <Label className="text-neutral-400">Contact Person</Label>
              <Input
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>
            <div>
              <Label className="text-neutral-400">Contact Email</Label>
              <Input
                name="contact_email"
                value={form.contact_email}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>
            <div>
              <Label className="text-neutral-400">Event Mode</Label>
              <select
                name="event_mode"
                value={form.event_mode}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md p-2 text-sm text-neutral-200 focus:outline-none focus:border-blue-700"
              >
                <option value="online">Online</option>
                <option value="face_to_face">Face to Face</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <Label className="text-neutral-400">Status</Label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-md p-2 text-sm text-neutral-200 focus:outline-none focus:border-blue-700"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <Label className="text-neutral-400">Duration</Label>
              <Input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="bg-neutral-900 border-neutral-800"
              />
            </div>
          </div>
        </form>

        <DialogFooter className="mt-6 border-t border-neutral-800 pt-4">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-white hover:bg-neutral-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {loading ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
