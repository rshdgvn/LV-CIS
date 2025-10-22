import { PencilIcon, Trash2Icon, PlusIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MembersSection({
  members,
  clubId,
  filters,
  activeFilter,
  setActiveFilter,
  onAddMember,
  onEditMember,
  onRemoveMember,
  onViewApplicants, 
}) {
  const nav = useNavigate();
  const [manageMode, setManageMode] = useState(false);

  const regularMembers = useMemo(() => {
    const officers = members.filter(
      (m) => m.pivot?.role === "officer" || m.pivot?.officer_title
    );
    const regulars = members.filter((m) => m.pivot?.role === "member");
    return [...officers, ...regulars];
  }, [members]);

  return (
    <div className="bg-sidebar border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-row gap-5">
          <h2 className="text-xl font-semibold">Members</h2>
          {manageMode && (
            <>
              <button
                onClick={onAddMember}
                className="flex items-center gap-2 text-sm text-blue-400 hover:underline"
              >
                <PlusIcon className="w-4 h-4" />
                Add Member
              </button>
              <button
                onClick={onViewApplicants}
                className="flex items-center gap-2 text-sm text-blue-400 hover:underline"
              >
                View Applicants
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setManageMode(!manageMode)}
            className="text-sm text-blue-400 hover:underline"
          >
            {manageMode ? "Exit" : "Manage"}
          </button>
          <div className="flex gap-2 bg-black p-1 rounded-lg">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-[0.5rem] font-medium rounded-md transition-all duration-200 ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-transparent text-gray-300 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        {regularMembers.length > 0 ? (
          regularMembers.map((member) => (
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
                    member.profile_image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      member.name
                    )}&background=111&color=fff`
                  }
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {member.pivot?.officer_title ||
                      member.pivot?.role ||
                      "Member"}
                  </p>
                </div>
              </div>

              {manageMode ? (
                <div className="flex gap-3">
                  <button onClick={() => onEditMember(member)}>
                    <PencilIcon className="w-4 h-4 text-blue-400 hover:text-blue-200" />
                  </button>
                  <button onClick={() => onRemoveMember(member)}>
                    <Trash2Icon className="w-4 h-4 text-red-500 hover:text-red-400" />
                  </button>
                </div>
              ) : (
                <p className="text-green-400 text-xs">Active</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No members yet.</p>
        )}
      </div>
    </div>
  );
}
