"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
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
import { User, Loader2, Camera, Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/providers/ToastProvider";

// Custom component to display validation errors
const ErrorMessage = ({ message }) => {
  return message ? (
    <p className="text-red-400 text-xs mt-1 italic">{message}</p>
  ) : null;
};

export default function Profile() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const fileInputRef = useRef(null);

  const isAdmin = formData?.user?.role?.toLowerCase() === "admin";
  const { addToast } = useToast();

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

      if (!res.ok) {
        const errorData = await res.json();
        addToast(errorData.message, "error");
        return;
      }

      const json = await res.json();
      setData(json);
      setFormData(JSON.parse(JSON.stringify(json)));
    } catch (err) {
      console.error(err);

      addToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const handleChange = (section, key, value) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      const errorKey = section === "user" ? key : `${section}.${key}`;
      delete newErrors[errorKey];
      return newErrors;
    });

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
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors["avatar"];
        return newErrors;
      });
    }
  };

  const handleAvatarClick = () => {
    if (editMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    NProgress.start();
    setValidationErrors({});

    try {
      const fd = new FormData();
      fd.append("_method", "PATCH");
      fd.append("first_name", formData.user.first_name || "");
      fd.append("last_name", formData.user.last_name || "");
      fd.append("email", formData.user.email || "");

      if (formData.user.avatar instanceof File) {
        fd.append("avatar", formData.user.avatar);
      }

      if (!isAdmin && formData.member) {
        fd.append("course", formData.member.course || "");
        fd.append("year_level", formData.member.year_level || "");
      }

      const res = await fetch(`${APP_URL}/user/profile`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const json = await res.json();

      if (res.status === 422) {
        setValidationErrors(json.errors || {});
        addToast("Validation failed. Please check the form.", "error");
        throw new Error("Validation Error");
      }

      if (!res.ok) {
        const errorData = await res.json();
        addToast(errorData.message, "error");
        return;
      }

      setData(json);
      setFormData(JSON.parse(JSON.stringify(json)));
      setAvatarPreview(null);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      if (err.message !== "Validation Error") {
        addToast("Failed to update profile. Try again.", "error");
      }
    } finally {
      addToast("Profile updated successfully!", "success");

      setIsSaving(false);
      NProgress.done();
    }
  };

  const handleCancel = () => {
    setFormData(JSON.parse(JSON.stringify(data)));
    setAvatarPreview(null);
    setEditMode(false);
    setValidationErrors({});
  };

  // --- Password Validation Helper ---
  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    if (!/[!@#$%^&*]/.test(password))
      errors.push("One special character (!@#$%^&*)");
    return errors;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrors({});

    // Client-side Strength Validation
    const strengthErrors = validatePasswordStrength(passwordForm.new_password);
    if (strengthErrors.length > 0) {
      setPasswordErrors({ new_password: ["Password is too weak."] });
      addToast("Password is too weak. Check requirements.", "toast");
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setPasswordErrors({
        new_password_confirmation: ["Passwords do not match."],
      });
      addToast("Passwords do not match.", "error");
      return;
    }

    NProgress.start();

    try {
      const res = await fetch(`${APP_URL}/user/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordForm),
      });

      const result = await res.json();

      if (res.status === 422) {
        setPasswordErrors(result.errors || {});
        addToast("Password change failed. Check inputs.", "error");
        throw new Error("Validation Error");
      }

      if (!res.ok) {
        const errorData = await res.json();
        addToast(errorData.message, "error");
        return;
      }

      addToast("Password updated successfully!", "success");
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err) {
      console.error(err);
      if (err.message !== "Validation Error") {
        addToast(err.message || "Failed to change password.", "error");
      }
    } finally {
      NProgress.done();
    }
  };

  if (loading || !data || !formData) return <SkeletonProfile />;

  const baseInputStyle =
    "w-full p-2 rounded-md bg-neutral-900 border text-white transition-colors pr-10"; // Added pr-10 for eye icon
  const readOnlyInputStyle = "cursor-default border-neutral-700 opacity-90";
  const editableInputStyle = "border-neutral-700 focus:border-blue-500";
  const selectTriggerStyle =
    "bg-neutral-900 border-neutral-700 text-white data-[state=open]:border-blue-500 data-[state=open]:ring-0";

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
        {/* PROFILE INFO (Unchanged logic, just truncated for brevity if needed) */}
        <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 mb-10 shadow-lg border border-neutral-800">
          {/* ... (Avatar & Personal Info Logic remains exactly as provided in your prompt) ... */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`relative w-20 h-20 shrink-0 ${
                  editMode ? "cursor-pointer group" : ""
                }`}
                onClick={handleAvatarClick}
              >
                <img
                  src={
                    avatarPreview ||
                    data.user.avatar ||
                    `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(
                      `${data.user.first_name} ${data.user.last_name}`
                    )}`
                  }
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover border-2 border-neutral-700 transition-opacity"
                />
                {editMode && (
                  <div className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full border-2 border-neutral-900 shadow-lg group-hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                ref={fileInputRef}
              />
              {editMode && (
                <ErrorMessage
                  message={
                    validationErrors.avatar ? validationErrors.avatar[0] : null
                  }
                />
              )}

              <div>
                <h2 className="text-lg font-semibold">
                  {formData.user.first_name} {formData.user.last_name}
                </h2>
                <p className="text-sm text-gray-400">
                  {formData.user.email}
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-900/50 text-blue-300 capitalize">
                    {formData.user.role}
                  </span>
                </p>
              </div>
            </div>

            {editMode ? (
              <div className="flex gap-3 mt-4 md:mt-0">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-semibold"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
                  className="bg-neutral-700 hover:bg-neutral-800 border-neutral-700 rounded text-white text-sm font-semibold"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-semibold"
              >
                Edit Profile
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div>
              <Label className="text-sm text-gray-400">First Name</Label>
              <Input
                type="text"
                readOnly={!editMode}
                value={formData.user.first_name}
                onChange={(e) =>
                  handleChange("user", "first_name", e.target.value)
                }
                className={`${baseInputStyle} ${
                  !editMode ? readOnlyInputStyle : editableInputStyle
                }`}
              />
              <ErrorMessage
                message={
                  validationErrors.first_name
                    ? validationErrors.first_name[0]
                    : null
                }
              />
            </div>
            <div>
              <Label className="text-sm text-gray-400">Last Name</Label>
              <Input
                type="text"
                readOnly={!editMode}
                value={formData.user.last_name}
                onChange={(e) =>
                  handleChange("user", "last_name", e.target.value)
                }
                className={`${baseInputStyle} ${
                  !editMode ? readOnlyInputStyle : editableInputStyle
                }`}
              />
              <ErrorMessage
                message={
                  validationErrors.last_name
                    ? validationErrors.last_name[0]
                    : null
                }
              />
            </div>
            <div className={isAdmin ? "md:col-span-2" : ""}>
              <Label className="text-sm text-gray-400">Email</Label>
              <Input
                type="email"
                readOnly={!editMode}
                value={formData.user.email}
                onChange={(e) => handleChange("user", "email", e.target.value)}
                className={`${baseInputStyle} ${
                  !editMode ? readOnlyInputStyle : editableInputStyle
                }`}
              />
              <ErrorMessage
                message={
                  validationErrors.email ? validationErrors.email[0] : null
                }
              />
            </div>

            {!isAdmin && (
              <>
                <div>
                  <Label className="text-sm text-gray-400">Course</Label>
                  <Select
                    value={formData.member?.course || ""}
                    onValueChange={(v) =>
                      editMode && handleChange("member", "course", v)
                    }
                    disabled={!editMode}
                  >
                    <SelectTrigger className={`w-full ${selectTriggerStyle}`}>
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-neutral-100">
                      <SelectGroup>
                        <SelectLabel>Courses</SelectLabel>
                        {["ACT", "BAB", "BSA", "BSAIS", "BSIS", "BSSW"].map(
                          (c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <ErrorMessage
                    message={
                      validationErrors["course"]
                        ? validationErrors["course"][0]
                        : null
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-400">Year Level</Label>
                  <Select
                    value={formData.member?.year_level || ""}
                    onValueChange={(v) =>
                      editMode && handleChange("member", "year_level", v)
                    }
                    disabled={!editMode}
                  >
                    <SelectTrigger className={`w-full ${selectTriggerStyle}`}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700 text-neutral-100">
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
                  <ErrorMessage
                    message={
                      validationErrors["year_level"]
                        ? validationErrors["year_level"][0]
                        : null
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 shadow-lg border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Account Security</h2>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-900/20 border border-yellow-900/50 text-yellow-500 text-xs">
              <Info size={14} />
              <span>
                Password must be at least 8 chars with uppercase, number &
                symbol.
              </span>
            </div>
          </div>

          <div className="sm:hidden flex items-start gap-2 mb-4 px-3 py-2 rounded-lg bg-yellow-900/20 border border-yellow-900/50 text-yellow-500 text-xs">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              Password must be at least 8 chars, include uppercase, lowercase,
              number & symbol.
            </span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label className="text-sm text-gray-400">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  name="current_password"
                  required
                  value={passwordForm.current_password}
                  onChange={(e) => {
                    setPasswordErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.current_password;
                      return newErrors;
                    });
                    setPasswordForm({
                      ...passwordForm,
                      current_password: e.target.value,
                    });
                  }}
                  className={`${baseInputStyle} ${editableInputStyle}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              <ErrorMessage
                message={
                  passwordErrors.current_password
                    ? passwordErrors.current_password[0]
                    : null
                }
              />
            </div>

            <div>
              <Label className="text-sm text-gray-400">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  name="new_password"
                  required
                  value={passwordForm.new_password}
                  onChange={(e) => {
                    setPasswordErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.new_password;
                      return newErrors;
                    });
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    });
                  }}
                  className={`${baseInputStyle} ${editableInputStyle}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordErrors.new_password && (
                <div className="text-red-400 text-xs mt-1 italic flex flex-col">
                  {Array.isArray(passwordErrors.new_password)
                    ? passwordErrors.new_password.map((msg, i) => (
                        <span key={i}>{msg}</span>
                      ))
                    : passwordErrors.new_password}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm text-gray-400">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="new_password_confirmation"
                  required
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => {
                    setPasswordErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.new_password_confirmation;
                      return newErrors;
                    });
                    setPasswordForm({
                      ...passwordForm,
                      new_password_confirmation: e.target.value,
                    });
                  }}
                  className={`${baseInputStyle} ${editableInputStyle}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              <ErrorMessage
                message={
                  passwordErrors.new_password_confirmation
                    ? passwordErrors.new_password_confirmation[0]
                    : null
                }
              />
            </div>

            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold w-full sm:w-auto"
            >
              Change Password
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
