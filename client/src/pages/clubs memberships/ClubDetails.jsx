"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { APP_URL } from "@/lib/config";
import MembersSection from "@/components/MembersSection";
import { AlertTemplate } from "@/components/AlertTemplate";
import { SkeletonClubDetails } from "@/components/skeletons/SkeletonClubDetails";

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

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Active");
  const [manageMode, setManageMode] = useState(false);
  const filters = ["Active", "Inactive", "All"];

  const showAlert = (type, title, description) => {
    setAlert({ type, title, description });
  };

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

      console.log(data.events)
      const galleryItems = [];
      data.events.forEach((event) => {
        event.photos.forEach((photo) =>
          galleryItems.push({ type: "photo", url: photo })
        );
        event.videos.forEach((video) =>
          galleryItems.push({ type: "video", url: video })
        );
      });
      setGallery(galleryItems);
    } catch (err) {
      console.error(err);
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

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const members = useMemo(() => club?.users || [], [club?.users]);

  const handleAddMember = async (formData) => {
    const { userId, email, role, officer_title } = formData;
    if (!id || !role || (!userId && !email)) {
      showAlert(
        "error",
        "Missing Fields",
        "Please fill out all required fields."
      );
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
          showAlert(
            "warning",
            "Duplicate Member",
            "This user is already a member of the club."
          );
        } else {
          const err = await res.json();
          throw new Error(err.message || "Failed to add member");
        }
        return;
      }

      showAlert("success", "Member Added", "Member added successfully!");
      fetchClubDetails();
    } catch (error) {
      console.error(error);
      showAlert("error", "Error", error.message || "Something went wrong.");
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

      showAlert("success", "Member Updated", "Member info updated!");
      fetchClubDetails();
    } catch (err) {
      console.error(err);
      showAlert("error", "Error", err.message || "Failed to update member");
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to remove member");
      showAlert("success", "Member Removed", "Member removed successfully!");
      fetchClubDetails();
    } catch (err) {
      console.error(err);
      showAlert("error", "Error", err.message || "Failed to remove member");
    }
  };

  const handleViewApplicants = () => {
    nav("pending-requests");
  };

  return (
    <>
      {alert && (
        <div className="flex items-center fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <AlertTemplate
            icon={
              alert.type === "success" ? (
                <CheckCircle2Icon className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircleIcon className="h-6 w-6 text-red-500" />
              )
            }
            title={alert.title}
            description={alert.description}
          />
        </div>
      )}

      {loading ? (
        <SkeletonClubDetails />
      ) : error ? (
        <div className="p-6 text-red-400 text-center">{error}</div>
      ) : (
        <div className="min-h-screen p-6 text-white lg:flex lg:gap-6">
          {/* Left side: Club Info & Members */}
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
                    <h3 className="font-semibold text-white text-lg mt-10">
                      Adviser
                    </h3>
                    <div className="flex items-center mt-3 bg-neutral-900 p-3 w-fit">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 text-white text-sm font-medium">
                        {club.adviser.initialss ||
                          club.adviser
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Mr. {club.adviser}</p>
                        <p className="text-xs text-gray-400">Adviser</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
              onViewApplicants={handleViewApplicants}
            />
          </div>

          {/* Right side: Activities & Gallery */}
          <div className="min-h-screen lg:w-1/3 flex flex-col gap-6">
            {/* Activities */}
            <div className="bg-sidebar border border-gray-800 rounded-xl p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold">Activities</h3>
                <button className="text-sm text-blue-400 hover:underline">
                  View all
                </button>
              </div>
              {events.length === 0 ? (
                <div className="text-gray-400 text-sm flex-1 flex items-center justify-center">
                  No activities found.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 bg-neutral-900 p-3 rounded-md"
                    >
                      <img
                        src={
                          event.cover_image || "https://via.placeholder.com/80"
                        }
                        alt={event.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <p className="font-medium">{event.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gallery */}
            <div className="bg-sidebar border border-gray-800 rounded-xl p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold">Gallery</h3>
                <button className="text-sm text-blue-400 hover:underline">
                  View all
                </button>
              </div>
              {gallery.length === 0 ? (
                <div className="text-gray-400 text-sm flex-1 flex items-center justify-center">
                  No photos or videos yet.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4">
                  {gallery.map((item, idx) =>
                    item.type === "photo" ? (
                      <img
                        key={idx}
                        src={item.url}
                        alt="Event Photo"
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <video
                        key={idx}
                        controls
                        className="w-full h-32 object-cover rounded"
                      >
                        <source src={item.url} type="video/mp4" />
                      </video>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
