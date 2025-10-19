"use client";

import Layout from "@/components/app/layout";
import NavTabs from "@/components/NavTabs";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

function Profile() {
  const { token } = useAuth();

  const tabs = [
    { name: "Overview", href: "/clubs" },
    { name: "Pending", href: "/pending-clubs" },
    { name: "Profile", href: "/profile" },
  ];

  const [member, setMember] = useState({
    student_id: "",
    course: "",
    year_level: "",
    contact: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchMemberInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8000/api/user/member-info", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setMember({
            student_id: data.member?.student_id || "",
            course: data.member?.course || "",
            year_level: data.member?.year_level || "",
            contact: data.member?.contact || "",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberInfo();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/user/member-info", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(member),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("Failed to save profile.");
    }
  };

  return (
    <Layout>
      <NavTabs tabs={tabs} />
      <div className="min-h-screen bg-black p-6 text-white max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <button
            onClick={() => {
              if (editMode) handleSave();
              else setEditMode(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-semibold"
          >
            {editMode ? "Save" : "Edit Profile"}
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading profile...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && (
          <form className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Student ID
              </label>
              <input
                type="text"
                name="student_id"
                value={member.student_id}
                onChange={handleChange}
                readOnly={!editMode}
                className={`w-full p-2 rounded bg-neutral-900 border border-gray-700 text-white ${
                  editMode ? "border-blue-500" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">Course</label>
              <input
                type="text"
                name="course"
                value={member.course}
                onChange={handleChange}
                readOnly={!editMode}
                className={`w-full p-2 rounded bg-neutral-900 border border-gray-700 text-white ${
                  editMode ? "border-blue-500" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Year Level
              </label>
              <input
                type="text"
                name="year_level"
                value={member.year_level}
                onChange={handleChange}
                readOnly={!editMode}
                className={`w-full p-2 rounded bg-neutral-900 border border-gray-700 text-white ${
                  editMode ? "border-blue-500" : ""
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Contact
              </label>
              <input
                type="text"
                name="contact"
                value={member.contact}
                onChange={handleChange}
                readOnly={!editMode}
                className={`w-full p-2 rounded bg-neutral-900 border border-gray-700 text-white ${
                  editMode ? "border-blue-500" : ""
                }`}
              />
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}

export default Profile;
