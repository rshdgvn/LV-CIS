"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { toast } from "sonner";
import { SkeletonProfile } from "@/components/skeletons/SkeletonProfile";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "lucide-react";

export default function Profile() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [formData, setFormData] = useState(null); // ← editable copy
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
      setFormData(JSON.parse(JSON.stringify(json))); // deep copy
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
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
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

      const fd = new FormData();
      fd.append("_method", "PATCH");

      fd.append("first_name", formData.user.first_name || "");
      fd.append("last_name", formData.user.last_name || "");
      fd.append("email", formData.user.email || "");
      fd.append("role", formData.user.role || "");

      if (formData.user.avatar instanceof File) {
        fd.append("avatar", formData.user.avatar);
      }

      fd.append("course", formData.member.course || "");
      fd.append("year_level", formData.member.year_level || "");

      const res = await fetch(`${APP_URL}/user/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to save profile");

      const updated = await res.json();
      setData(updated); // update actual data
      setFormData(JSON.parse(JSON.stringify(updated))); // reset form copy
      setAvatarPreview(null);
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

  const handleCancel = () => {
    setFormData(JSON.parse(JSON.stringify(data))); // restore saved data
    setAvatarPreview(null);
    setEditMode(false);
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
      toast.error(err.message);
    } finally {
      NProgress.done();
    }
  };

  if (loading || !data || !formData) return <SkeletonProfile />;

  const readOnlySelectStyle = !editMode ? "cursor-default opacity-100" : "";

  return (
    <>
      <div className="flex flex-col gap-2 my-8 mx-4">
        <div className="flex flex-row items-center gap-5">
          <div className="shrink-0 p-2 bg-blue-900/30 rounded-lg">
            <User className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-4xl font-semibold">Account Settings</h1>
        </div>
        <p className="text-gray-400 my-2">
          Manage your account settings and preferences
        </p>
      </div>
      <div className="min-h-screen text-white px-6 pb-10 md:px-20">
        <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 mb-10 shadow-lg border border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={
                  avatarPreview ||
                  data.user.avatar ||
                  `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(
                    `${data.user.first_name} ${data.user.last_name}`
                  )}`
                }
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
              />

              {editMode && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="text-sm text-gray-300"
                />
              )}

              <div>
                <h2 className="text-lg font-semibold">
                  {data.user.first_name} {data.user.last_name}
                </h2>
                <p className="text-sm text-gray-400">{data.user.email}</p>
              </div>
            </div>

            {editMode ? (
              <div className="flex gap-3 mt-4 md:mt-0">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-950 rounded text-white text-sm font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded text-white text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 rounded text-white text-sm font-semibold"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* FORM */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {/* FIRST NAME */}
            <div>
              <label className="text-sm text-gray-400">First Name</label>
              <input
                type="text"
                readOnly={!editMode}
                value={formData.user.first_name}
                onChange={(e) =>
                  handleChange("user", "first_name", e.target.value)
                }
                className={`w-full p-2 rounded-md bg-neutral-900 border border-neutral-700 text-white ${
                  !editMode ? "cursor-default" : ""
                }`}
              />
            </div>

            {/* LAST NAME */}
            <div>
              <label className="text-sm text-gray-400">Last Name</label>
              <input
                type="text"
                readOnly={!editMode}
                value={formData.user.last_name}
                onChange={(e) =>
                  handleChange("user", "last_name", e.target.value)
                }
                className={`w-full p-2 rounded-md bg-neutral-900 border border-neutral-700 text-white ${
                  !editMode ? "cursor-default" : ""
                }`}
              />
            </div>

            {/* COURSE SELECT */}
            <div>
              <label className="text-sm text-gray-400">Course</label>
              <Select
                value={formData.member.course}
                onValueChange={(v) =>
                  editMode && handleChange("member", "course", v)
                }
                disabled={!editMode}
              >
                <SelectTrigger className={`w-full ${readOnlySelectStyle}`}>
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent
                  className={!editMode ? "pointer-events-none" : ""}
                >
                  <SelectGroup>
                    <SelectLabel>Courses</SelectLabel>
                    {["ACT", "BAB", "BSA", "BSAIS", "BSIS", "BSSW"].map(
                      (course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* YEAR LEVEL */}
            <div>
              <label className="text-sm text-gray-400">Year Level</label>
              <Select
                value={formData.member.year_level}
                onValueChange={(v) =>
                  editMode && handleChange("member", "year_level", v)
                }
                disabled={!editMode}
              >
                <SelectTrigger className={`w-full ${readOnlySelectStyle}`}>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent
                  className={!editMode ? "pointer-events-none" : ""}
                >
                  <SelectGroup>
                    <SelectLabel>Year</SelectLabel>
                    {[1, 2, 3, 4].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* PASSWORD SECTION */}
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
            ].map((f) => (
              <div key={f.name}>
                <label className="text-sm text-gray-400">{f.label}</label>
                <input
                  type="password"
                  name={f.name}
                  required
                  value={passwordForm[f.name]}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      [e.target.name]: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded-md bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-950 text-white py-2 rounded font-semibold"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
