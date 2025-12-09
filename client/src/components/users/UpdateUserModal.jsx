import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Loader2, Eye, EyeOff, Upload, User as UserIcon } from "lucide-react";
import { APP_URL } from "@/lib/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/providers/ToastProvider"; // 1. Import useToast

export default function UpdateUserModal({ user, open, setOpen, onSuccess }) {
  const { addToast } = useToast(); // 2. Get addToast
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "user",
    course: "",
    year_level: "",
    password: "",
    password_confirmation: "",
    avatar: null, // New file
  });
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const member = user.member || {};
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        role: user.role || "user",
        course: member.course || "",
        year_level: member.year_level ? String(member.year_level) : "",
        password: "",
        password_confirmation: "",
        avatar: null,
      });
      setCurrentAvatarUrl(user.avatar);
      setAvatarPreview(null);
      setErrors({});
    }
  }, [user, open]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // --- Password Strength Helper ---
  const validatePasswordStrength = (password) => {
    if (!password) return null; // Only validate if password is provided (optional update)
    const issues = [];
    if (password.length < 8) issues.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) issues.push("One uppercase letter");
    if (!/[a-z]/.test(password)) issues.push("One lowercase letter");
    if (!/[0-9]/.test(password)) issues.push("One number");
    if (!/[!@#$%^&*]/.test(password))
      issues.push("One special character (!@#$%^&*)");
    return issues;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Client-side password validation
    if (form.password) {
      const passwordIssues = validatePasswordStrength(form.password);
      if (passwordIssues && passwordIssues.length > 0) {
        setErrors({ password: passwordIssues });
        addToast("Password does not meet requirements.", "error");
        setLoading(false);
        return;
      }
      if (form.password !== form.password_confirmation) {
        setErrors({ password_confirmation: ["Passwords do not match."] });
        addToast("Passwords do not match.", "error");
        setLoading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("_method", "PATCH");

    Object.keys(form).forEach((key) => {
      if ((key === "password" || key === "password_confirmation") && !form[key])
        return;
      if (key === "avatar" && !form[key]) return;
      if ((key === "course" || key === "year_level") && form.role !== "user")
        return;

      formData.append(key, form[key]);
    });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_URL}/users/${user.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const responseData = await res.json();

      if (!res.ok) {
        if (res.status === 422 && responseData.errors) {
          setErrors(responseData.errors);
          addToast("Please check the fields for errors.", "error");
        } else {
          const msg = responseData.message || "Failed to update user.";
          setErrors({ general: msg });
          addToast(msg, "error");
        }
        return;
      }

      addToast("User updated successfully!", "success");
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setErrors({ general: "An unexpected error occurred." });
      console.error(err);
      addToast("An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-700 text-neutral-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Avatar Upload */}
          <div className="flex justify-center mb-2">
            <div className="relative group cursor-pointer">
              <Avatar className="w-24 h-24 border-2 border-neutral-700">
                <AvatarImage src={avatarPreview || currentAvatarUrl} />
                <AvatarFallback className="bg-neutral-800">
                  <UserIcon className="w-10 h-10 text-neutral-500" />
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="edit-avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full transition-opacity"
              >
                <Upload className="w-6 h-6 text-white" />
              </label>
              <input
                id="edit-avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="edit_first_name"
                className="text-neutral-400 mb-1.5 block"
              >
                First Name
              </Label>
              <Input
                id="edit_first_name"
                value={form.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                className={`bg-neutral-800 border-neutral-700 ${
                  errors.first_name ? "border-red-500" : ""
                }`}
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.first_name[0]}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="edit_last_name"
                className="text-neutral-400 mb-1.5 block"
              >
                Last Name
              </Label>
              <Input
                id="edit_last_name"
                value={form.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className={`bg-neutral-800 border-neutral-700 ${
                  errors.last_name ? "border-red-500" : ""
                }`}
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.last_name[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="edit_email"
              className="text-neutral-400 mb-1.5 block"
            >
              Email
            </Label>
            <Input
              id="edit_email"
              type="email"
              value={form.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`bg-neutral-800 border-neutral-700 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Label
                htmlFor="edit_password"
                className="text-neutral-400 mb-1.5 block"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="edit_password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`bg-neutral-800 border-neutral-700 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  placeholder="(Leave blank)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Show password validation errors */}
              {errors.password && (
                <div className="text-red-500 text-xs mt-1 flex flex-col">
                  {Array.isArray(errors.password) ? (
                    errors.password.map((msg, i) => (
                      <span key={i}>• {msg}</span>
                    ))
                  ) : (
                    <span>{errors.password}</span>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <Label
                htmlFor="edit_password_confirmation"
                className="text-neutral-400 mb-1.5 block"
              >
                Confirm
              </Label>
              <div className="relative">
                <Input
                  id="edit_password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.password_confirmation}
                  onChange={(e) =>
                    handleInputChange("password_confirmation", e.target.value)
                  }
                  className="bg-neutral-800 border-neutral-700 pr-10"
                  placeholder="(Leave blank)"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password_confirmation[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="edit_role"
              className="text-neutral-400 mb-1.5 block"
            >
              Role
            </Label>
            <Select
              onValueChange={(value) => handleInputChange("role", value)}
              value={form.role}
            >
              <SelectTrigger
                id="edit_role"
                className="bg-neutral-800 border-neutral-700 text-neutral-100"
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role[0]}</p>
            )}
          </div>

          {form.role === "user" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="edit_course"
                  className="text-neutral-400 mb-1.5 block"
                >
                  Course
                </Label>
                <Select
                  onValueChange={(value) => handleInputChange("course", value)}
                  value={form.course}
                >
                  <SelectTrigger
                    id="edit_course"
                    className={`bg-neutral-800 border-neutral-700 text-neutral-100 ${
                      errors.course ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                    <SelectGroup>
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
                {errors.course && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.course[0]}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="edit_year_level"
                  className="text-neutral-400 mb-1.5 block"
                >
                  Year Level
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("year_level", value)
                  }
                  value={form.year_level}
                >
                  <SelectTrigger
                    id="edit_year_level"
                    className={`bg-neutral-800 border-neutral-700 text-neutral-100 ${
                      errors.year_level ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                    {[1, 2, 3, 4].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y} Year
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year_level && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.year_level[0]}
                  </p>
                )}
              </div>
            </div>
          )}

          {errors.general && (
            <p className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">
              {errors.general}
            </p>
          )}

          <DialogFooter className="pt-2 border-t border-neutral-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-white mr-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
