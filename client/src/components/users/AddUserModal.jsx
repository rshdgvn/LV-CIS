import React, { useState } from "react";
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
} from "@/components/ui/select";
import {
  Loader2,
  Eye,
  EyeOff,
  Upload,
  User as UserIcon,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { APP_URL } from "@/lib/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/providers/ToastProvider"; // 1. Import useToast

export default function AddUserModal({ open, setOpen, onSuccess }) {
  const { addToast } = useToast(); // 2. Get addToast
  const initialForm = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "user",
    course: "",
    year_level: "",
    avatar: null,
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, avatar: file }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setForm((prev) => ({ ...prev, avatar: null }));
    setAvatarPreview(null);
    const input = document.getElementById("avatar-upload");
    if (input) input.value = "";
  };

  const handlePreviewAvatar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (avatarPreview) {
      window.open(avatarPreview, "_blank");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== "") {
        if (
          (key === "course" || key === "year_level") &&
          form.role !== "user"
        ) {
          return;
        }
        formData.append(key, form[key]);
      }
    });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_URL}/users`, {
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
          // 3. Error Toast (Validation)
          addToast("Please fix the errors in the form.", "error");
        } else {
          const msg = responseData.message || "Failed to create user.";
          setErrors({ general: msg });
          // 3. Error Toast (General)
          addToast(msg, "error");
        }
        return;
      }

      // 4. Success Toast
      addToast("User created successfully!", "success");
      setOpen(false);
      setForm(initialForm);
      setAvatarPreview(null);
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
          <DialogTitle className="text-xl font-bold">Add New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="flex justify-center mb-2">
            <div className="relative group w-24 h-24">
              <Avatar className="w-24 h-24 border-2 border-neutral-700">
                <AvatarImage src={avatarPreview} className="object-cover" />
                <AvatarFallback className="bg-neutral-800">
                  <UserIcon className="w-10 h-10 text-neutral-500" />
                </AvatarFallback>
              </Avatar>

              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                {avatarPreview ? (
                  <>
                    <button
                      type="button"
                      onClick={handlePreviewAvatar}
                      className="p-1.5 bg-neutral-800/80 rounded-full hover:bg-blue-600 hover:text-white text-neutral-300 transition-colors"
                      title="Preview"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="p-1.5 bg-neutral-800/80 rounded-full hover:bg-red-600 hover:text-white text-neutral-300 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer p-2 rounded-full hover:bg-neutral-700 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </label>
                )}
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {avatarPreview && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 border-2 border-neutral-900 shadow-sm z-10"
                  title="Change Image"
                >
                  <Upload size={12} className="text-white" />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="first_name"
                className="text-neutral-400 mb-1.5 block"
              >
                First Name
              </Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                className={`bg-neutral-800 border-neutral-700 ${
                  errors.first_name ? "border-red-500" : ""
                }`}
                placeholder="John"
              />
              {errors.first_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.first_name[0]}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="last_name"
                className="text-neutral-400 mb-1.5 block"
              >
                Last Name
              </Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className={`bg-neutral-800 border-neutral-700 ${
                  errors.last_name ? "border-red-500" : ""
                }`}
                placeholder="Doe"
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.last_name[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-neutral-400 mb-1.5 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`bg-neutral-800 border-neutral-700 ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Label
                htmlFor="password"
                className="text-neutral-400 mb-1.5 block"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`bg-neutral-800 border-neutral-700 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password[0]}
                </p>
              )}
            </div>
            <div className="relative">
              <Label
                htmlFor="password_confirmation"
                className="text-neutral-400 mb-1.5 block"
              >
                Confirm
              </Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.password_confirmation}
                  onChange={(e) =>
                    handleInputChange("password_confirmation", e.target.value)
                  }
                  className="bg-neutral-800 border-neutral-700 pr-10"
                  placeholder="••••••"
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
            </div>
          </div>

          <div>
            <Label htmlFor="role" className="text-neutral-400 mb-1.5 block">
              Role
            </Label>
            <Select
              onValueChange={(value) => handleInputChange("role", value)}
              defaultValue={form.role}
            >
              <SelectTrigger
                id="role"
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
                  htmlFor="course"
                  className="text-neutral-400 mb-1.5 block"
                >
                  Course
                </Label>
                <Select
                  onValueChange={(value) => handleInputChange("course", value)}
                  value={form.course}
                >
                  <SelectTrigger
                    id="course"
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
                  htmlFor="year_level"
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
                    id="year_level"
                    className={`bg-neutral-800 border-neutral-700 text-neutral-100 ${
                      errors.year_level ? "border-red-500" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                    {[1, 2, 3, 4, 5].map((y) => (
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
                  Saving...
                </>
              ) : (
                "Save User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
