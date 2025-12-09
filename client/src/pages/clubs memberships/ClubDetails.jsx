"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Calendar, Image as ImageIcon, PlayCircle } from "lucide-react";
import { APP_URL } from "@/lib/config";
import MembersSection from "@/components/MembersSection";
import { SkeletonClubDetails } from "@/components/skeletons/SkeletonClubDetails";
import { useToast } from "@/providers/ToastProvider";

NProgress.configure({ showSpinner: false });

const finishProgress = () =>
  new Promise((resolve) => {
    NProgress.done();
    setTimeout(resolve, 250);
  });

export default function ClubDetails() {
  const { token, user } = useAuth();
  const { id } = useParams();
  const nav = useNavigate();
  const { addToast } = useToast();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Active");
  const [manageMode, setManageMode] = useState(false);
  const filters = ["Active", "Inactive", "All"];

  const fetchClubDetails = async () => {
    try {
      setLoading(true);
      NProgress.start();
      const res = await fetch(`${APP_URL}/clubs/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch club details");

      const data = await res.json();
      setClub(data);
      sessionStorage.setItem(`club_${id}`, JSON.stringify(data));
    } catch (err) {
      console.error(err);
      setError("Failed to load club details.");
      addToast("Failed to load club details.", "error");
    } finally {
      setLoading(false);
      await finishProgress();
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${APP_URL}/clubs/${id}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch events");

      const data = await res.json();
      setEvents(data.events || []);

      const galleryItems = [];
      data.events.forEach((event) => {
        event.photos.forEach((photo) =>
          galleryItems.push({ type: "photo", url: photo, title: event.title })
        );
        event.videos.forEach((video) =>
          galleryItems.push({ type: "video", url: video, title: event.title })
        );
      });
      setGallery(galleryItems);
    } catch (err) {
      console.error(err);
      addToast("Failed to load events.", "error");
    }
  };

  useEffect(() => {
    const cached = sessionStorage.getItem(`club_${id}`);
    if (cached) {
      setClub(JSON.parse(cached));
      setLoading(false);
    }
    if (token && id) {
      fetchClubDetails();
      fetchEvents();
    }
  }, [token, id]);

  const members = useMemo(() => club?.users || [], [club?.users]);

  const handleAddMember = async (formData) => {
    const { userId, email, role, officer_title } = formData;
    if (!id || !role || (!userId && !email)) {
      addToast("Please fill out all required fields.", "error");
      return;
    }

    try {
      const body = {
        role,
        officerTitle: role === "officer" ? officer_title : null,
      };

      if (email) {
        body.add_by = "email";
        body.email = email;
      } else {
        body.add_by = "userId";
        body.user_id = userId;
      }

      const res = await fetch(`${APP_URL}/clubs/${id}/members/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 409) {
          addToast("This user is already a member.", "warning");
        } else {
          const err = await res.json();
          throw new Error(err.message || "Failed to add member");
        }
        return;
      }

      addToast("Member added successfully!", "success");
      fetchClubDetails();
    } catch (error) {
      console.error(error);
      addToast(error.message || "Something went wrong.", "error");
    }
  };

  const handleEditMember = async (formData) => {
    const { userId, role, officer_title } = formData;
    if (!userId || !role) return;

    try {
      const res = await fetch(`${APP_URL}/clubs/${id}/members/${userId}/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          officer_title: role === "officer" ? officer_title : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update member");

      addToast("Member info updated!", "success");
      fetchClubDetails();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to update member", "error");
    }
  };

  const handleRemoveMember = async (member) => {
    const confirmDelete = confirm(
      `Are you sure you want to remove ${member.first_name} ${member.last_name}?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${APP_URL}/clubs/${id}/members/${member.id}/remove`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to remove member");
      addToast("Member removed successfully!", "success");
      fetchClubDetails();
    } catch (err) {
      console.error(err);
      addToast(err.message || "Failed to remove member", "error");
    }
  };

  const handleEventClick = (eventId) => {
    nav(`/events/${eventId}`);
  };

  return (
    <>
      {loading ? (
        <SkeletonClubDetails />
      ) : error ? (
        <div className="p-6 text-red-400 text-center">{error}</div>
      ) : (
        <div className="min-h-screen p-6 text-white flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
          <div className="flex-1 space-y-6">
            <div className="bg-sidebar border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
              <img
                src={
                  club.logo_url ||
                  `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(
                    club.name
                  )}&background=111&color=fff`
                }
                alt={club.name}
                className="w-28 h-28 rounded-full object-cover border border-gray-800"
              />

              <div className="flex-1">
                <h1 className="text-2xl font-bold">{club.name}</h1>
                <p className="text-gray-400 text-sm mt-2">
                  {club.description || "No description available."}
                </p>

                {club.adviser && (
                  <div className="mt-5">
                    <h3 className="font-semibold text-white text-xl mt-10">
                      Adviser
                    </h3>
                    <div className="flex items-center mt-3 bg-neutral-900 w-fit">
                      <div className="ml-2">
                        <p className="font-normal">Mr. {club.adviser}</p>
                        <p className="text-xs text-gray-400">Adviser</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Members Section */}
            <MembersSection
              members={members}
              clubId={id}
              filters={filters}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              manageMode={manageMode}
              onAddMember={handleAddMember}
              onEditMember={handleEditMember}
              onRemoveMember={handleRemoveMember}
              onViewApplicants={() => nav("pending-requests")}
            />
          </div>

          {/* --- RIGHT SIDE: Activities & Gallery --- */}
          <div className="lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col gap-6 h-fit lg:sticky lg:top-6">
            {/* Activities Widget */}
            <div className="bg-sidebar border border-gray-800 rounded-xl p-5 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  Activities
                  <span className="bg-blue-600/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                    {events.length}
                  </span>
                </h3>
              </div>

              {/* Scrollable Container for Activities */}
              <div className="h-[280px] overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-3">
                {events.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 opacity-60">
                    <Calendar className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-sm">No upcoming activities</span>
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className="group flex gap-3 p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                    >
                      <div className="relative w-16 h-12 shrink-0 rounded-md overflow-hidden bg-neutral-800">
                        <img
                          src={
                            event.cover_image ||
                            "https://via.placeholder.com/80"
                          }
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-blue-400 transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {event.description || "Event details..."}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Gallery Widget */}
            <div className="bg-sidebar border border-gray-800 rounded-xl p-5 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Gallery</h3>
              </div>

              {/* Scrollable Container for Gallery */}
              <div className="h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                {gallery.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 opacity-60">
                    <ImageIcon className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-sm">Gallery is empty</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {gallery.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square bg-neutral-800 rounded-lg overflow-hidden cursor-pointer border border-[#333]"
                      >
                        {item.type === "photo" ? (
                          <img
                            src={item.url}
                            alt="Gallery"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video
                              src={item.url}
                              className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <PlayCircle className="w-6 h-6 text-white opacity-80" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
