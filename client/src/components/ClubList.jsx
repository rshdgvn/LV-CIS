"use client";

import React, { useEffect } from "react";
import ClubCard from "@/components/ClubCard";

export default function ClubList({
  clubs = [],
  status,
  onEnter,
  onJoin,
  onCancel,
}) {
  useEffect(() => {
    console.log(clubs);
  }, []);

  return (
    <div className="flex flex-wrap gap-6">
      {clubs.map((club) => (
        <ClubCard
          key={club.id}
          name={club.name}
          description={club.description}
          logo={club.logo_url}
          background="/Lv-Background.jpg"
          status={status}
          onEnter={onEnter ? () => onEnter(club.id) : undefined}
          onJoin={onJoin ? () => onJoin(club.id) : undefined}
          onCancel={onCancel ? () => onCancel(club.id) : undefined}
        />
      ))}
    </div>
  );
}
