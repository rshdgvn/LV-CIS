"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { toast } from "sonner";
import { SkeletonProfile } from "@/components/skeletons/SkeletonProfile";


export default function Profile() {
  const { token } = useAuth();
  const [data, setData] = useState({
    user: { name: "", username: "", email: "", role: "", avatar: "" },
    member: { course: "", year_level: "" },
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

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

      const res = await fetch(`${APP_URL}/user/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save profile");

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      NProgress.start();
      const res = await fetch(`${APP_URL}/user/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(passwordForm),
      });

      const result = await res.json();

      if (!res.ok)
        throw new Error(result.message || "Failed to change password");

      toast.success("Password updated successfully!");
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update password");
    } finally {
      NProgress.done();
    }
  };

  const handlePasswordInput = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  if (loading) return <SkeletonProfile />;

  return (
    <div className="min-h-screen text-white px-6 py-10 md:px-20">
      <h1 className="text-2xl font-semibold mb-2">Account Settings</h1>
      <p className="text-sm text-gray-400 mb-8">
        Manage your account settings and preferences
      </p>

      {/* PROFILE CARD */}
      <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 mb-10 shadow-lg border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src={
                avatarPreview ||
                data.user.avatar ||
                `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(
                  data.user.name || "User"
                )}`
              }
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
            />
            <div>
              <h2 className="text-lg font-semibold">{data.user.name}</h2>
              <p className="text-sm text-gray-400">{data.user.email}</p>
            </div>
          </div>

          <button
            onClick={() => (editMode ? handleSave() : setEditMode(true))}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-900 hover:bg-blue-950 rounded text-white text-sm font-semibold"
          >
            {editMode ? "Save Profile" : "Edit Profile"}
          </button>
        </div>

        {/* Profile Info */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={data.user.name?.split(" ")[0] || ""}
              readOnly={!editMode}
              onChange={(e) =>
                handleChange("user", "name", e.target.value || "")
              }
              className={`w-full p-2 rounded-md bg-neutral-900 border border-neutral-700 text-white ${
                editMode ? "focus:border-blue-500" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={data.user.name?.split(" ")[1] || ""}
              readOnly={!editMode}
              onChange={(e) =>
                handleChange("user", "name", e.target.value || "")
              }
              className={`w-full p-2 rounded-md bg-neutral-90 0 border border-neutral-700 text-white ${
                editMode ? "focus:border-blue-500" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Course</label>
            <input
              type="text"
              value={data.member.course || ""}
              readOnly={!editMode}
              onChange={(e) =>
                handleChange("member", "course", e.target.value || "")
              }
              className={`w-full p-2 rounded-md bg-neutral-900 border border-neutral-700 text-white ${
                editMode ? "focus:border-blue-500" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Year Level
            </label>
            <input
              type="text"
              value={data.member.year_level || ""}
              readOnly={!editMode}
              onChange={(e) =>
                handleChange("member", "year_level", e.target.value || "")
              }
              className={`w-full p-2 rounded-md bg-neutral-900 border border-neutral-700 text-white ${
                editMode ? "focus:border-blue-500" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* ACCOUNT SECURITY CARD */}
      <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-lg border border-neutral-800">
        <h2 className="text-lg font-semibold mb-4">Account Security</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { name: "current_password", label: "Current Password" },
            { name: "new_password", label: "New Password" },
            {
              name: "new_password_confirmation",
              label: "Confirm New Password",
            },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-gray-400 mb-1">
                {field.label}
              </label>
              <input
                type="password"
                name={field.name}
                value={passwordForm[field.name]}
                onChange={handlePasswordInput}
                required
                className="w-full p-2 rounded-md bg-neutral-900 border border-neutral-700 text-white focus:border-blue-500"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white py-2 rounded font-semibold"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
