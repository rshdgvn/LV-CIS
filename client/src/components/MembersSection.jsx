import {
  PencilIcon,
  Trash2Icon,
  XIcon,
  CheckIcon,
  MoreHorizontal,
  UserPlus,
  Users,
  ArrowLeft,
  Search,
  Loader2,
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { APP_URL } from "@/lib/config";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate";
import { useToast } from "@/providers/ToastProvider";

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
  const { addToast } = useToast();

  const [manageMode, setManageMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [applicantMode, setApplicantMode] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Email Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 5;

  const [formData, setFormData] = useState({
    userId: null,
    name: "",
    email: "", // Default add by email
    role: "member",
    officer_title: "",
  });

  const openAddModal = () => {
    setFormData({
      userId: null,
      name: "",
      email: "",
      role: "member",
      officer_title: "",
    });
    setSearchQuery("");
    setSearchResults([]);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setFormData({
      userId: member.id,
      name: `${member.first_name} ${member.last_name}`,
      email: member.email,
      role: member.pivot?.role || "member",
      officer_title: member.pivot?.officer_title || "",
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // --- SEARCH USERS (Debounced) ---
  useEffect(() => {
    if (modalMode !== "add" || !searchQuery) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // NOTE: Ensure your backend has an endpoint for searching users: GET /users?search=...
        const res = await fetch(`${APP_URL}/users?search=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Filter out users who are already members (optional optimization)
          const availableUsers = data.filter(
            (u) => !members.some((m) => m.id === u.id)
          );
          setSearchResults(availableUsers.slice(0, 5)); // Limit to 5
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, token, modalMode, members]);

  const handleSelectUser = (user) => {
    setFormData({ ...formData, email: user.email });
    setSearchQuery(user.email); // Set input to selected email
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure email is passed from searchQuery if added manually
    const finalData = { ...formData, email: searchQuery };

    if (modalMode === "add") await onAddMember(finalData);
    else await onEditMember(finalData);

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
      addToast("Failed to load applicants.", "error");
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

      addToast(
        status === "approved"
          ? "Membership approved successfully!"
          : "Membership rejected successfully!",
        "success"
      );

      fetchApplicants();
    } catch (err) {
      addToast(
        err.message || "An error occurred while updating status.",
        "error"
      );
    }
  };

  useEffect(() => {
    if (applicantMode) fetchApplicants();
  }, [applicantMode]);

  const filteredMembers = useMemo(() => {
    if (!activeFilter || activeFilter === "All") return members;
    if (activeFilter === "Active")
      return members.filter((m) => m.pivot?.activity_status === "active");
    if (activeFilter === "Inactive")
      return members.filter((m) => m.pivot?.activity_status === "inactive");
    return members;
  }, [members, activeFilter]);

  const regularMembers = useMemo(() => {
    const officers = filteredMembers.filter(
      (m) => m.pivot?.role === "officer" || m.pivot?.officer_title
    );
    const regulars = filteredMembers.filter((m) => m.pivot?.role === "member");
    return [...officers, ...regulars];
  }, [filteredMembers]);

  const indexOfLast = currentPage * membersPerPage;
  const indexOfFirst = indexOfLast - membersPerPage;
  const paginatedMembers = regularMembers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(regularMembers.length / membersPerPage);

  const { isOfficer } = useClub();

  return (
    <div className="bg-sidebar border border-gray-800 rounded-xl p-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
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
          <h2 className="text-lg sm:text-xl font-semibold">
            {applicantMode ? "Applicants" : "Members"}
          </h2>
        </div>

        {!applicantMode && (
          <div className="flex flex-wrap justify-end gap-2 sm:gap-3 items-center">
            <div className="flex flex-wrap justify-end gap-1 bg-black p-1 rounded-lg">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 sm:px-3 py-1 text-[0.6rem] sm:text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
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

      <div className="min-h-[300px]">
        {applicantMode ? (
          loading ? (
            <div className="flex items-center justify-center text-white h-40">
              <Loader2 className="w-6 h-6 animate-spin" />
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
                      {user.course} {user.year_level}
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
            <p className="text-gray-400 text-center py-10">
              No applicants yet.
            </p>
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
                    !manageMode &&
                    nav(`/member-attendances/${member.id}/${clubId}`)
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
                    <p className="font-medium text-sm cursor-pointer hover:text-blue-400">{`${member.first_name} ${member.last_name}`}</p>
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
                  <p
                    className={`text-xs capitalize ${
                      member.pivot?.activity_status === "inactive"
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {member.pivot?.activity_status}
                  </p>
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
          <p className="text-gray-400 text-center py-10">No members yet.</p>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-900 border border-neutral-800 text-neutral-100">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {modalMode === "add" ? "Add Member" : "Edit Member"}
              </DialogTitle>
              <DialogDescription className="text-neutral-400">
                {modalMode === "add"
                  ? "Enter the email of the user you want to add."
                  : "Update the member details below."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {modalMode === "add" ? (
                // --- ADD MODE: EMAIL SEARCH ---
                <div className="grid gap-2 relative">
                  <Label htmlFor="searchEmail">Email Address</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                    <Input
                      id="searchEmail"
                      type="email"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        // Hide suggestions immediately if user clears input
                        if (!e.target.value) setShowSuggestions(false);
                      }}
                      onFocus={() => {
                        if (searchResults.length > 0) setShowSuggestions(true);
                      }}
                      className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                      placeholder="Search user by email..."
                      autoComplete="off"
                      required
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                      </div>
                    )}
                  </div>

                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchResults.length > 0 && (
                    <ul className="absolute z-50 w-full bg-neutral-800 border border-neutral-700 rounded-md mt-[70px] max-h-48 overflow-y-auto shadow-lg">
                      {searchResults.map((user) => (
                        <li
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="px-4 py-2 hover:bg-neutral-700 cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <img
                            src={
                              user.avatar ||
                              `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random`
                            }
                            alt="avatar"
                            className="w-6 h-6 rounded-full"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                              {user.first_name} {user.last_name}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {user.email}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {showSuggestions &&
                    searchQuery &&
                    searchResults.length === 0 &&
                    !isSearching && (
                      <div className="absolute z-50 w-full bg-neutral-800 border border-neutral-700 rounded-md mt-[70px] p-2 text-center text-xs text-neutral-400">
                        No users found
                      </div>
                    )}
                </div>
              ) : (
                // --- EDIT MODE: READ ONLY NAME ---
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    disabled
                    className="bg-neutral-800 border-neutral-700 text-neutral-400 cursor-not-allowed"
                  />
                </div>
              )}

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
                    placeholder="Enter officer title (e.g. President)"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={modalMode === "add" && !searchQuery}
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
