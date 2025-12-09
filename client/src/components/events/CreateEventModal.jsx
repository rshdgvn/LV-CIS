import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarPlus, X, Loader2 } from "lucide-react";
import { DatePicker } from "../DatePicker";
import { TimePicker } from "../TimePicker";
import { APP_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { useToast } from "@/providers/ToastProvider";

export default function CreateEventModal({ onSuccess }) {
  const { token } = useAuth();
  // 2. Get clubs from context
  const { clubs } = useClub();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Filter clubs where user has permission (officer/adviser)
  const managedClubs = clubs.filter((club) =>
    ["officer", "adviser"].includes(club.pivot?.role)
  );

  const initialFormState = {
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
  };

  const [form, setForm] = useState(initialFormState);
  const { addToast } = useToast();

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setForm(initialFormState);
      setErrors({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, cover_image: file }));
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
      Object.entries(form).forEach(([key, value]) => {
        if (
          key !== "photos" &&
          key !== "videos" &&
          value !== null &&
          value !== undefined &&
          value !== ""
        ) {
          formData.append(key, value);
        }
      });
      form.photos.forEach((file) => formData.append("photos[]", file));
      form.videos.forEach((file) => formData.append("videos[]", file));

      const res = await fetch(`${APP_URL}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422) {
          setErrors(data.errors);
          const errorMessages = Object.values(data.errors).flat().join("\n");
          addToast("Validation Failed:\n" + errorMessages, "error");
          throw new Error("Please fix the highlighted errors.");
        }
        throw new Error(data.message || "Failed to create event");
      }

      onSuccess?.(data.event);
      handleOpenChange(false);
      addToast("Event created successfully!", "success");
    } catch (err) {
      console.error(err);
      if (err.message !== "Please fix the highlighted errors.") {
        alert(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-950 text-gray-100 hover:bg-blue-900 border border-blue-900/50">
          <CalendarPlus className="w-4 h-4" />
          Create Event
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-950 text-white border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Event</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
        >
          {/* --- LEFT SECTION --- */}
          <div className="space-y-4">
            {/* Club Selection (Replaces ID Input) */}
            <div>
              <Label className="text-neutral-400">
                Select Club <span className="text-red-500">*</span>
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
                {managedClubs.map((club) => (
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
                placeholder="e.g. Annual Tech Symposium"
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
              <Label className="text-neutral-400">
                Purpose <span className="text-red-500">*</span>
              </Label>
              <Textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="What is the goal of this event?"
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
              <Label className="text-neutral-400">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed event information..."
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

            {/* Cover Page Logic (Kept same as provided) */}
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
                      src={URL.createObjectURL(form.cover_image)}
                      alt="Cover Preview"
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

            {/* Attachments Logic (Kept same as provided) */}
            <div>
              <Label className="text-neutral-400">Attachments</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {form.photos.map((file, index) => (
                  <div
                    key={`p-${index}`}
                    className="relative h-24 border border-neutral-700 rounded-lg overflow-hidden bg-neutral-900"
                  >
                    <img
                      src={URL.createObjectURL(file)}
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
                {form.videos.map((file, index) => (
                  <div
                    key={`v-${index}`}
                    className="relative h-24 border border-neutral-700 rounded-lg overflow-hidden bg-neutral-900"
                  >
                    <video
                      src={URL.createObjectURL(file)}
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] px-1 rounded">
                      VID
                    </span>
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

          {/* --- RIGHT SECTION --- */}
          <div className="space-y-4">
            {/* Date */}
            <div>
              <Label className="text-neutral-400">
                Date <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                value={form.event_date}
                onChange={(date) => {
                  setForm((prev) => ({
                    ...prev,
                    event_date: date ? date.toISOString().split("T")[0] : "",
                  }));
                  if (errors.event_date)
                    setErrors((prev) => ({ ...prev, event_date: null }));
                }}
              />
              {errors.event_date && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.event_date[0]}
                </span>
              )}
            </div>

            {/* Time */}
            <div>
              <Label className="text-neutral-400">
                Time <span className="text-red-500">*</span>
              </Label>
              <TimePicker
                value={form.event_time}
                onChange={(time) => {
                  setForm((prev) => ({ ...prev, event_time: time }));
                  if (errors.event_time)
                    setErrors((prev) => ({ ...prev, event_time: null }));
                }}
              />
              {errors.event_time && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.event_time[0]}
                </span>
              )}
            </div>

            {/* Venue */}
            <div>
              <Label className="text-neutral-400">
                Venue <span className="text-red-500">*</span>
              </Label>
              <Input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                className={`bg-neutral-900 border-neutral-800 ${
                  errors.venue ? "border-red-500" : ""
                }`}
              />
              {errors.venue && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.venue[0]}
                </span>
              )}
            </div>

            {/* Organizer */}
            <div>
              <Label className="text-neutral-400">
                Organizer <span className="text-red-500">*</span>
              </Label>
              <Input
                name="organizer"
                value={form.organizer}
                onChange={handleChange}
                className={`bg-neutral-900 border-neutral-800 ${
                  errors.organizer ? "border-red-500" : ""
                }`}
              />
              {errors.organizer && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.organizer[0]}
                </span>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <Label className="text-neutral-400">
                Contact Person <span className="text-red-500">*</span>
              </Label>
              <Input
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
                className={`bg-neutral-900 border-neutral-800 ${
                  errors.contact_person ? "border-red-500" : ""
                }`}
              />
              {errors.contact_person && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.contact_person[0]}
                </span>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <Label className="text-neutral-400">
                Contact Email <span className="text-red-500">*</span>
              </Label>
              <Input
                name="contact_email"
                type="email"
                value={form.contact_email}
                onChange={handleChange}
                className={`bg-neutral-900 border-neutral-800 ${
                  errors.contact_email ? "border-red-500" : ""
                }`}
              />
              {errors.contact_email && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.contact_email[0]}
                </span>
              )}
            </div>

            {/* Event Mode */}
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

            {/* Status */}
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
              </select>
            </div>

            {/* Duration */}
            <div>
              <Label className="text-neutral-400">
                Duration <span className="text-red-500">*</span>
              </Label>
              <Input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 3 hours"
                className={`bg-neutral-900 border-neutral-800 ${
                  errors.duration ? "border-red-500" : ""
                }`}
              />
              {errors.duration && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.duration[0]}
                </span>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="mt-6 border-t border-neutral-800 pt-4">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="ghost"
              onClick={() => handleOpenChange(false)}
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
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
