"use client";

import React, { useEffect } from "react";
import ClubCard from "@/components/ClubCard";

export default function ClubList({ clubs = [], status, onEnter, onJoin, onCancel }) {
  if (clubs.length === 0) {
    return (
      <p className="text-gray400 text-center">
        {status === "approved"
          ? "You have no approved clubs."
          : "No clubs available."}
      </p>
    );
  }

  useEffect(() => {
    console.log(clubs)
  },[])

  return (
    <div className="flex flex-wrap gap-6">
      {clubs.map((club) => (
        <ClubCard
          key={club.id}
          name={club.name}
          description={club.description}
          logo={club.logo_url}
          status={status}
          onEnter={onEnter ? () => onEnter(club.id) : undefined}
          onJoin={onJoin ? () => onJoin(club.id) : undefined}
          onCancel={onCancel ? () => onCancel(club.id) : undefined}
        />
      ))}
    </div>
  );
}
