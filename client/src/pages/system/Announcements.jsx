"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Megaphone,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { APP_URL } from "@/lib/config";
import { useClub } from "@/contexts/ClubContext";
import { useAuth } from "@/contexts/AuthContext";

// Helper to split date
const getDateParts = (dateString) => {
  const d = new Date(dateString);
  if (isNaN(d)) return { day: "--", month: "---", year: "----" };
  return {
    day: d.getDate(),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    year: d.getFullYear(),
  };
};

// Helper to check if date is past
const isPastDate = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateString);
  return eventDate < today;
};

export default function Announcements() {
  const { clubs } = useClub();
  const { token, user } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FILTERS ---
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    status: "active",
    target_type: "general",
    club_id: "",
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${APP_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.status) {
        const allData = json.data || [];

        // --- FILTERING LOGIC ---
        // Only show if: Admin OR General OR User belongs to Club
        const filteredData = allData.filter((item) => {
          if (user?.role === "admin") return true;
          if (item.target_type === "general") return true;
          return clubs.some((c) => Number(c.id) === Number(item.club_id));
        });

        setAnnouncements(filteredData);
      }
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && clubs) {
      fetchAnnouncements();
    }
  }, [user, clubs]); // Re-run when clubs or user load

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      time: "",
      venue: "",
      description: "",
      status: "active",
      target_type: "general",
      club_id: "",
    });
    setCurrentAnnouncement(null);
  };

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        club_id: formData.target_type === "general" ? null : formData.club_id,
      };
      const res = await fetch(`${APP_URL}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create");
      setIsAddOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      alert("Error creating announcement");
    }
  };

  const handleUpdate = async () => {
    if (!currentAnnouncement) return;
    try {
      const payload = {
        ...formData,
        club_id: formData.target_type === "general" ? null : formData.club_id,
      };
      const res = await fetch(
        `${APP_URL}/announcements/${currentAnnouncement.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to update");
      setIsEditOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      alert("Error updating announcement");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`${APP_URL}/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (item) => {
    setCurrentAnnouncement(item);
    setFormData({
      title: item.title,
      date: item.date,
      time: item.time,
      venue: item.venue || "",
      description: item.description || "",
      status: item.status,
      target_type: item.target_type,
      club_id: item.club_id || "",
    });
    setIsEditOpen(true);
  };

  // --- FILTER & SORT LOGIC ---
  const filteredAnnouncements = announcements
    .filter((item) => {
      // 1. Category Filter
      const matchesCategory =
        categoryFilter === "all" ||
        (categoryFilter === "general" && item.target_type === "general") ||
        item.club_id == categoryFilter;

      // 2. Status Filter
      const isPast = isPastDate(item.date);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "upcoming" && !isPast) ||
        (statusFilter === "concluded" && isPast);

      return matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const isPastA = isPastDate(a.date);
      const isPastB = isPastDate(b.date);
      // Sort: Active first, then Concluded
      if (isPastA === isPastB) return new Date(b.date) - new Date(a.date);
      return isPastA ? 1 : -1;
    });

  const admin = user.role == "admin";

  return (
    <div className="px-8 py-6 text-neutral-100 w-full min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-blue-500" /> Announcements
          </h1>
          <p className="text-neutral-400 mt-1">Manage and view all updates</p>
        </div>

        {admin && (
          <Button
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus size={18} /> Post Announcement
          </Button>
        )}
      </div>

      {/* CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter: Category (Club/General) */}
          <div className="flex items-center gap-3 bg-blue-950 p-1.5 rounded-lg border border-neutral-800">
            <div className="px-2 text-neutral-500">
              <Filter size={16} className="text-white" />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-sm text-white font-medium outline-none cursor-pointer min-w-[140px]"
            >
              <option value="all" className="bg-neutral-900">
                All Categories
              </option>
              <option value="general" className="bg-neutral-900">
                General Public
              </option>
              {clubs.map((club) => (
                <option
                  key={club.id}
                  value={club.id}
                  className="bg-neutral-900"
                >
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Status (Upcoming/Concluded) */}
          <div className="flex items-center gap-3 bg-neutral-900 p-1.5 rounded-lg border border-neutral-800">
            <div className="px-2 text-neutral-500">
              <History size={16} className="text-neutral-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm text-neutral-300 font-medium outline-none cursor-pointer min-w-[140px]"
            >
              <option value="all" className="bg-neutral-900">
                All Status
              </option>
              <option value="upcoming" className="bg-neutral-900">
                Upcoming Only
              </option>
              <option value="concluded" className="bg-neutral-900">
                Concluded
              </option>
            </select>
          </div>
        </div>

        <span className="text-sm text-neutral-500 font-medium">
          {filteredAnnouncements.length} Posts
        </span>
      </div>

      {/* FEED LIST (Rows) */}
      <div className="flex flex-col gap-4 max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse bg-neutral-900 w-full h-24 rounded-xl mb-4"></div>
            <div className="animate-pulse bg-neutral-900 w-full h-24 rounded-xl mb-4"></div>
            <p className="text-neutral-500 mt-4">Loading updates...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/30 border border-dashed border-neutral-800 rounded-xl">
            <Megaphone className="w-12 h-12 mb-3 text-neutral-600" />
            <p className="text-neutral-400 font-medium">
              No announcements found for your clubs.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((item) => {
            const dateParts = getDateParts(item.date);
            const isGeneral = item.target_type === "general";
            const clubName = clubs.find((c) => c.id === item.club_id)?.name;
            const isPast = isPastDate(item.date);

            return (
              <div
                key={item.id}
                className={`group relative bg-neutral-900 border border-neutral-800 rounded-xl p-5 transition-all duration-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center
                ${
                  isPast
                    ? "opacity-60 hover:opacity-100 grayscale-[0.3]"
                    : "hover:border-neutral-700 hover:bg-neutral-800"
                }`}
              >
                {/* 1. Date Box with YEAR */}
                <div
                  className={`flex-shrink-0 flex flex-col items-center justify-center border rounded-lg w-16 h-16 sm:w-20 sm:h-20 text-center shadow-sm transition-colors py-1
                  ${
                    isPast
                      ? "bg-neutral-900 border-neutral-800"
                      : "bg-neutral-900 border-neutral-800 group-hover:bg-neutral-800/80"
                  }`}
                >
                  {/* Year Display */}
                  <span className="text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-0.5">
                    {dateParts.year}
                  </span>

                  <span
                    className={`font-bold text-lg sm:text-xl leading-none ${
                      isPast ? "text-neutral-500" : "text-red-500"
                    }`}
                  >
                    {dateParts.month}
                  </span>
                  <span
                    className={`font-bold text-xl sm:text-2xl leading-none mt-0.5 ${
                      isPast ? "text-neutral-400" : "text-white"
                    }`}
                  >
                    {dateParts.day}
                  </span>
                </div>

                {/* 2. Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${
                        isGeneral
                          ? "bg-blue-400 text-black border-blue-900"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {isGeneral ? "General" : clubName || "Club"}
                    </span>

                    {/* PAST/DONE INDICATOR */}
                    {isPast && (
                      <span className="flex items-center gap-1 bg-neutral-800 text-neutral-400 border border-neutral-700 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded">
                        <CheckCircle2 size={10} /> Concluded
                      </span>
                    )}

                    {item.venue && (
                      <div className="flex items-center gap-1 text-xs text-neutral-500 ml-auto sm:ml-0">
                        <MapPin size={12} /> {item.venue}
                      </div>
                    )}
                  </div>

                  <h3
                    className={`text-lg md:text-xl font-bold mb-2 truncate pr-4 ${
                      isPast
                        ? "text-neutral-400 decoration-neutral-600"
                        : "text-neutral-100"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p className="text-sm text-neutral-400 line-clamp-2 md:line-clamp-1 max-w-3xl">
                    {item.description ||
                      "No additional details provided for this event."}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs font-medium text-neutral-500">
                    <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded">
                      <Clock size={12} className="text-neutral-400" />
                      {item.time}
                    </div>
                  </div>
                </div>

                {/* 3. Actions - Only show if user has permission (Admin or maybe Officer of that club) */}
                {/* For now, simplified to allow actions, but backend should protect delete/update */}
                <div className="flex items-center gap-2 sm:self-center self-end mt-2 sm:mt-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-neutral-900 border-neutral-800"
                    >
                      <DropdownMenuItem
                        onClick={() => openEditModal(item)}
                        className="text-neutral-300 focus:bg-neutral-800 focus:text-white cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 focus:bg-red-900/20 focus:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Accent Line on Left (Gray if past) */}
                <div
                  className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                    isPast
                      ? "bg-neutral-800"
                      : isGeneral
                      ? "bg-blue-400"
                      : "bg-blue-900"
                  }`}
                ></div>
              </div>
            );
          })
        )}
      </div>

      {/* --- ADD MODAL --- */}
      <AnnouncementModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Announcement"
        onSubmit={handleCreate}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        clubs={clubs}
        submitLabel="Post Now"
      />

      {/* --- EDIT MODAL --- */}
      <AnnouncementModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Announcement"
        onSubmit={handleUpdate}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        clubs={clubs}
        submitLabel="Save Changes"
      />
    </div>
  );
}

// Reusable Form Component
function AnnouncementModal({
  isOpen,
  onClose,
  title,
  onSubmit,
  formData,
  handleInputChange,
  handleSelectChange,
  clubs,
  submitLabel,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-950 border-neutral-800 text-neutral-100 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-neutral-400">
              Headline Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="bg-neutral-900 border-neutral-800 focus:border-blue-600 transition-colors"
              placeholder="e.g. Annual General Assembly"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-neutral-400">Target Audience</Label>
              <Select
                value={formData.target_type}
                onValueChange={(val) => handleSelectChange("target_type", val)}
              >
                <SelectTrigger className="bg-neutral-900 border-neutral-800">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                  <SelectItem value="general">General (All)</SelectItem>
                  <SelectItem value="club">Specific Club</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.target_type === "club" && (
              <div className="grid gap-2">
                <Label className="text-neutral-400">Select Club</Label>
                <Select
                  value={formData.club_id?.toString()}
                  onValueChange={(val) => handleSelectChange("club_id", val)}
                >
                  <SelectTrigger className="bg-neutral-900 border-neutral-800">
                    <SelectValue placeholder="Choose club" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                    {clubs.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date" className="text-neutral-400">
                Date
              </Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="bg-neutral-900 border-neutral-800 block text-neutral-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time" className="text-neutral-400">
                Time
              </Label>
              <Input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="bg-neutral-900 border-neutral-800 block text-neutral-200"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="venue" className="text-neutral-400">
              Venue
            </Label>
            <Input
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              className="bg-neutral-900 border-neutral-800"
              placeholder="e.g. Main Auditorium"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-neutral-400">
              Details
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="bg-neutral-900 border-neutral-800 min-h-[100px]"
              placeholder="Write the announcement content here..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-neutral-900 text-neutral-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
