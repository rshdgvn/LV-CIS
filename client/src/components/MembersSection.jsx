import {
  PencilIcon,
  Trash2Icon,
  XIcon,
  CheckIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  MoreHorizontal,
  UserPlus,
  Users,
  ArrowLeft,
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";
import { AlertTemplate } from "@/components/AlertTemplate";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useClub } from "@/contexts/ClubContext";

export default function MembersSection({
  members,
  clubId,
  filters,
  activeFilter,
  setActiveFilter,
  onAddMember,
  onEditMember,
  onRemoveMember,
}) {
  const nav = useNavigate();
  const { token } = useAuth();

  const [manageMode, setManageMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [applicantMode, setApplicantMode] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 5;

  const [formData, setFormData] = useState({
    userId: null,
    name: "",
    role: "member",
    officer_title: "",
  });

  const openAddModal = () => {
    setFormData({ userId: null, name: "", role: "member", officer_title: "" });
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setFormData({
      userId: member.id,
      name: `${member.first_name} ${member.last_name}`,
      role: member.pivot?.role || "member",
      officer_title: member.pivot?.officer_title || "",
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === "add") await onAddMember(formData);
    else await onEditMember(formData);
    setIsModalOpen(false);
  };

  const fetchApplicants = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${APP_URL}/clubs/${clubId}/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch applicants");
      const data = await res.json();
      setApplicants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId, status) => {
    if (!token) return;
    try {
      const res = await fetch(`${APP_URL}/clubs/${clubId}/members/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      setAlert({
        type: "success",
        title: status === "approved" ? "Approved!" : "Rejected!",
        description:
          status === "approved"
            ? "Membership approved successfully!"
            : "Membership rejected successfully!",
      });

      fetchApplicants();
    } catch (err) {
      setAlert({
        type: "error",
        title: "Action Failed",
        description: err.message || "An error occurred while updating status.",
      });
    }
  };

  useEffect(() => {
    if (applicantMode) fetchApplicants();
  }, [applicantMode]);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  const regularMembers = useMemo(() => {
    const officers = members.filter(
      (m) => m.pivot?.role === "officer" || m.pivot?.officer_title
    );
    const regulars = members.filter((m) => m.pivot?.role === "member");
    return [...officers, ...regulars];
  }, [members]);

  const indexOfLast = currentPage * membersPerPage;
  const indexOfFirst = indexOfLast - membersPerPage;
  const paginatedMembers = regularMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(regularMembers.length / membersPerPage);

  const { isOfficer } = useClub();

  return (
    <div className="bg-sidebar border border-gray-800 rounded-xl p-6 relative">
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <h2 className="text-lg sm:text-xl font-semibold">
            {applicantMode ? "Applicants" : "Members"}
          </h2>

          {applicantMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setApplicantMode(false)}
              className="text-blue-900 hover:text-blue-950"
              aria-label="Back to Members"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        {!applicantMode && (
          <div className="flex flex-wrap justify-end gap-2 sm:gap-3 items-center">
            <div className="flex flex-wrap justify-end gap-1 bg-black p-1 rounded-lg">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 sm:px-3 py-1 text-[0.6rem] sm:text-xs font-medium rounded-md transition-all duration-200 ${
                    activeFilter === filter
                      ? "bg-blue-900 text-white"
                      : "bg-transparent text-gray-300 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            {isOfficer(clubId) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center h-9 w-9 p-0 hover:bg-muted"
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => openAddModal()}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 text-green-500" />
                    <span>Add Member</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setApplicantMode(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="h-4 w-4 text-orange-400" />
                    <span>View Applicants</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setManageMode((prev) => !prev)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <PencilIcon className="h-4 w-4 text-blue-700" />
                    <span>
                      {manageMode ? "Exit Manage Mode" : "Manage Members"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      <div className="h-96">
        {applicantMode ? (
          loading ? (
            <div className="flex items-center justify-center text-white">
              <div className="loader"></div>
            </div>
          ) : applicants.length > 0 ? (
            applicants.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:bg-gray-950 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        `${user.first_name} ${user.last_name}`
                      )}&background=111&color=fff`
                    }
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{`${user.first_name} ${user.last_name}`}</p>
                    <p className="text-xs text-gray-400">
                      {user.student_id} | {user.course} | {user.year_level}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <AlertDialogTemplate
                    title="Approve applicant?"
                    description="Are you sure you want to approve this applicant?"
                    onConfirm={() =>
                      handleUpdateStatus(user.user_id, "approved")
                    }
                    button={
                      <CheckIcon className="w-5 h-5 text-green-500 hover:text-green-300 cursor-pointer" />
                    }
                  />
                  <AlertDialogTemplate
                    title="Reject applicant?"
                    description="Are you sure you want to reject this applicant?"
                    onConfirm={() =>
                      handleUpdateStatus(user.user_id, "rejected")
                    }
                    button={
                      <XIcon className="w-5 h-5 text-red-500 hover:text-red-300 cursor-pointer" />
                    }
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No applicants yet.</p>
          )
        ) : paginatedMembers.length > 0 ? (
          <>
            {paginatedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:bg-gray-950 transition"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() =>
                    !manageMode && nav(`/club/${clubId}/members/${member.id}`)
                  }
                >
                  <img
                    src={
                      member.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        `${member.first_name} ${member.last_name}`
                      )}&background=111&color=fff`
                    }
                    alt={`${member.first_name} ${member.last_name}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{`${member.first_name} ${member.last_name}`}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {member.pivot?.officer_title ||
                        member.pivot?.role ||
                        "Member"}
                    </p>
                  </div>
                </div>

                {manageMode ? (
                  <div className="flex gap-3">
                    <button onClick={() => openEditModal(member)}>
                      <PencilIcon className="w-4 h-4 text-blue-700 hover:text-blue-600" />
                    </button>
                    <button onClick={() => onRemoveMember(member)}>
                      <Trash2Icon className="w-4 h-4 text-red-500 hover:text-red-400" />
                    </button>
                  </div>
                ) : (
                  <p className="text-green-400 text-xs">Active</p>
                )}
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(p - 1, 1));
                        }}
                        className={
                          currentPage === 1
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {/* Dynamic Page Links */}
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNum = index + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === pageNum}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNum);
                            }}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.min(p + 1, totalPages));
                        }}
                        className={
                          currentPage === totalPages
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400 text-center">No members yet.</p>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-900 border border-neutral-800">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {modalMode === "add" ? "Add Member" : "Edit Member"}
              </DialogTitle>
              <DialogDescription>
                {modalMode === "add"
                  ? "Fill out the details below to add a new member."
                  : "Update the member details below and click save to apply changes."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {modalMode === "add" && (
                <>
                  {/* Add By Selection */}
                  <div className="grid gap-2">
                    <Label htmlFor="addBy">Add Member By</Label>
                    <select
                      id="addBy"
                      value={formData.addBy || "userId"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          addBy: e.target.value,
                          userId: "",
                          email: "",
                        })
                      }
                      className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="userId">User ID</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  {/* Input Field for Either User ID or Email */}
                  <div className="grid gap-2">
                    <Label htmlFor="userInput">
                      {formData.addBy === "email" ? "Email" : "User ID"}
                    </Label>
                    <Input
                      id="userInput"
                      type={formData.addBy === "email" ? "email" : "text"}
                      value={
                        formData.addBy === "email"
                          ? formData.email || ""
                          : formData.userId || ""
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [formData.addBy === "email" ? "email" : "userId"]:
                            e.target.value,
                        })
                      }
                      placeholder={
                        formData.addBy === "email"
                          ? "Enter user email"
                          : "Enter user ID"
                      }
                      required
                    />
                  </div>
                </>
              )}

              {/* Role Selector */}
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="member">Member</option>
                  <option value="officer">Officer</option>
                </select>
              </div>

              {/* Officer Title */}
              {formData.role === "officer" && (
                <div className="grid gap-2">
                  <Label htmlFor="officer_title">Officer Title</Label>
                  <Input
                    id="officer_title"
                    value={formData.officer_title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        officer_title: e.target.value,
                      })
                    }
                    placeholder="Enter officer title"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-900 hover:bg-blue-950 text-white"
              >
                {modalMode === "add" ? "Add Member" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
