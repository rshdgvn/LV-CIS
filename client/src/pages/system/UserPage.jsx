"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, MoreVertical, Users } from "lucide-react";
import { APP_URL } from "@/lib/config";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SkeletonAttendances } from "@/components/skeletons/SkeletonAttendances";
import AddUserModal from "@/components/users/AddUserModal";
import UpdateUserModal from "@/components/users/UpdateUserModal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/providers/ToastProvider";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate"; // 1. Import Alert Dialog

const formatRole = (role) => {
  if (!role) return "N/A";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export default function UsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(res.status);

      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      addToast("Failed to load users. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const email = user.email.toLowerCase();
      const searchTerm = search.toLowerCase();

      return fullName.includes(searchTerm) || email.includes(searchTerm);
    });
  }, [users, search]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, users]);

  // 2. Updated handleDelete (Removed window.confirm)
  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${APP_URL}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(res.status);

      addToast("User deleted successfully.", "success");
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      addToast("Failed to delete user.", "error");
    }
  };

  if (loading) return <SkeletonAttendances />;

  return (
    <div className="px-8 py-6 text-neutral-100 w-full flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Users size={32} className="text-blue-500" />
        <h1 className="text-3xl font-semibold">User Management</h1>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-[350px]">
            <Search className="w-5 h-5 text-neutral-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <Input
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-full h-10 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-blue-600 border border-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 flex items-center gap-2 cursor-pointer transition-colors duration-200"
          >
            <Plus size={16} /> Add User
          </Button>
        </div>

        <Card className="border border-neutral-800 rounded-2xl p-0 shadow-lg">
          <Table className="bg-neutral-900 rounded-2xl w-full">
            <TableHeader className="bg-neutral-800">
              <TableRow className="border-neutral-700 hover:bg-neutral-800">
                <TableHead className="px-6 py-3 text-left w-[20%] text-neutral-300">
                  Name
                </TableHead>
                <TableHead className="px-6 py-3 text-left w-[30%] text-neutral-300">
                  Email
                </TableHead>
                <TableHead className="px-6 py-3 text-center w-[15%] text-neutral-300">
                  Role
                </TableHead>
                <TableHead className="px-6 py-3 text-center w-[20%] text-neutral-300">
                  Clubs
                </TableHead>
                <TableHead className="px-6 py-3 text-right w-[15%] text-neutral-300">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="text-neutral-200">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-b border-neutral-800/70 hover:bg-neutral-800 transition"
                  >
                    <TableCell className="px-6 py-4 font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-neutral-400">
                      {user.email}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-center">
                      <Badge
                        className={`
                          ${
                            user.role === "admin"
                              ? "bg-red-800 hover:bg-red-700"
                              : "bg-blue-800 hover:bg-blue-700"
                          }
                          text-white font-semibold
                        `}
                      >
                        {formatRole(user.role)}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-center text-neutral-400">
                      {user.clubs?.length > 0 ? user.clubs.length : "None"}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="bg-neutral-900 border border-neutral-700 text-neutral-200">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setUpdateModalOpen(true);
                            }}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Edit size={14} /> Edit
                          </DropdownMenuItem>

                          {/* 3. Replaced DropdownMenuItem with AlertDialogTemplate */}
                          <div onClick={(e) => e.stopPropagation()}>
                            <AlertDialogTemplate
                              title="Delete User?"
                              description={`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`}
                              onConfirm={() => handleDelete(user.id)}
                              button={
                                <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-neutral-800 text-red-400 focus:bg-neutral-800 focus:text-red-500 w-full">
                                  <Trash2 size={14} className="mr-2" /> Delete
                                </div>
                              }
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan="5"
                    className="text-center py-6 text-neutral-500 italic"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

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
                        : "text-neutral-400 hover:text-white"
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
                        className={
                          currentPage === pageNum
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "text-neutral-400 hover:text-white"
                        }
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
                        : "text-neutral-400 hover:text-white"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <AddUserModal
        open={addModalOpen}
        setOpen={setAddModalOpen}
        onSuccess={fetchUsers}
      />

      <UpdateUserModal
        open={updateModalOpen}
        setOpen={setUpdateModalOpen}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
