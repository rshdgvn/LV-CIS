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
import { Loader2 } from "lucide-react";
import { APP_URL } from "@/lib/config";

export default function UpdateUserModal({ user, open, setOpen, onSuccess }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "user",
    course: "",
    year_level: "",
    password: "",
    password_confirmation: "", // Added
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      // FIX: Accessing user.member.course instead of user.course
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
      });
      setErrors({});
    }
  }, [user, open]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const dataToSend = { ...form };

    // Remove empty password
    if (!dataToSend.password) {
      delete dataToSend.password;
      delete dataToSend.password_confirmation;
    }

    // Clean up student fields if not user
    if (dataToSend.role !== "user") {
      delete dataToSend.course;
      delete dataToSend.year_level;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await res.json();

      if (!res.ok) {
        if (res.status === 422 && responseData.errors) {
          setErrors(responseData.errors);
        } else {
          setErrors({
            general: responseData.message || "Failed to update user.",
          });
        }
        return;
      }

      setOpen(false);
      onSuccess?.();
    } catch (err) {
      setErrors({ general: "An unexpected error occurred." });
      console.error(err);
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
          {/* First Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="edit_first_name"
              className="text-right text-neutral-400"
            >
              First Name
            </Label>
            <div className="col-span-3">
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
                <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
              )}
            </div>
          </div>

          {/* Last Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="edit_last_name"
              className="text-right text-neutral-400"
            >
              Last Name
            </Label>
            <div className="col-span-3">
              <Input
                id="edit_last_name"
                value={form.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className={`bg-neutral-800 border-neutral-700 ${
                  errors.last_name ? "border-red-500" : ""
                }`}
              />
              {errors.last_name && (
                <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit_email" className="text-right text-neutral-400">
              Email
            </Label>
            <div className="col-span-3">
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
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="edit_password"
              className="text-right text-neutral-400"
            >
              Password
            </Label>
            <div className="col-span-3">
              <Input
                id="edit_password"
                type="password"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`bg-neutral-800 border-neutral-700 ${
                  errors.password ? "border-red-500" : ""
                }`}
                placeholder="(Leave blank to keep)"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="edit_password_confirmation"
              className="text-right text-xs text-neutral-400"
            >
              Confirm Password
            </Label>
            <div className="col-span-3">
              <Input
                id="edit_password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={(e) =>
                  handleInputChange("password_confirmation", e.target.value)
                }
                className="bg-neutral-800 border-neutral-700"
                placeholder="(Leave blank to keep)"
              />
            </div>
          </div>

          {/* Role */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit_role" className="text-right text-neutral-400">
              Role
            </Label>
            <div className="col-span-3">
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
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>
          </div>

          {form.role === "user" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit_course"
                  className="text-right text-neutral-400"
                >
                  Course
                </Label>
                <div className="col-span-3">
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("course", value)
                    }
                    value={form.course}
                  >
                    <SelectTrigger
                      id="edit_course"
                      className={`bg-neutral-800 border-neutral-700 text-neutral-100 ${
                        errors.course ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
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
                  {errors.course && (
                    <p className="text-red-500 text-xs mt-1">{errors.course}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit_year_level"
                  className="text-right text-neutral-400"
                >
                  Year Level
                </Label>
                <div className="col-span-3">
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
                      <SelectValue placeholder="Select Year" />
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
                      {errors.year_level}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {errors.general && (
            <p className="text-red-500 text-sm col-span-4 text-center mt-2 bg-red-900/20 p-2 rounded">
              {errors.general}
            </p>
          )}

          <DialogFooter className="pt-4 mt-2 border-t border-neutral-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-neutral-100 mr-2"
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
