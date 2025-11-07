"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { toast } from "sonner";

export default function Profile() {
  const { token } = useAuth();
  const [data, setData] = useState({
    user: { name: "", username: "", email: "", role: "", avatar: "" },
    member: { course: "", year_level: "" },
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      NProgress.start();
      const res = await fetch(`${APP_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const handleChange = (section, key, value) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData((prev) => ({
        ...prev,
        user: { ...prev.user, avatar: file },
      }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      NProgress.start();

      const formData = new FormData();
      formData.append("_method", "PATCH");

      Object.entries(data.user).forEach(([key, value]) => {
        if (key === "avatar") {
          if (value instanceof File) {
            formData.append("avatar", value);
          }
        } else {
          formData.append(key, value ?? "");
        }
      });

      Object.entries(data.member).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });

      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const res = await fetch(`${APP_URL}/user/profile`, {
        method: "POST", 
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Update failed:", errText);
        throw new Error("Failed to save profile");
      }

      const updated = await res.json();
      setData(updated);
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-300">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-md mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <button
          onClick={() => (editMode ? handleSave() : setEditMode(true))}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-semibold"
        >
          {editMode ? "Save" : "Edit Profile"}
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <img
            src={
              avatarPreview ||
              data.user.avatar ||
              "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=" +
                encodeURIComponent(data.user.name || "User")
            }
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
          />
          {editMode && (
            <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 cursor-pointer hover:bg-blue-700">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              📷
            </label>
          )}
        </div>
        <p className="mt-3 text-sm text-gray-400">
          Role: <span className="text-white font-medium">{data.user.role}</span>
        </p>
      </div>

      {/* User Info */}
      <div className="space-y-4 mb-8">
        {["name", "username", "email"].map((field) => (
          <div key={field}>
            <label className="block text-gray-400 text-sm mb-1 capitalize">
              {field}
            </label>
            <input
              type="text"
              value={data.user[field] || ""}
              readOnly={!editMode}
              onChange={(e) =>
                handleChange("user", field, e.target.value || "")
              }
              className={`w-full p-2 rounded bg-neutral-900 border border-gray-700 text-white ${
                editMode ? "border-blue-500" : ""
              }`}
            />
          </div>
        ))}
      </div>

      {/* Member Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-2">Member Information</h2>
        {["course", "year_level"].map((field) => (
          <div key={field}>
            <label className="block text-gray-400 text-sm mb-1 capitalize">
              {field.replace("_", " ")}
            </label>
            <input
              type="text"
              value={data.member[field] || ""}
              readOnly={!editMode}
              onChange={(e) =>
                handleChange("member", field, e.target.value || "")
              }
              className={`w-full p-2 rounded bg-neutral-900 border border-gray-700 text-white ${
                editMode ? "border-blue-500" : ""
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
