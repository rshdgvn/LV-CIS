"use client";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

export function SmallCalendar() {
  const [date, setDate] = useState(new Date());

  return (
    <Calendar
      mode="single"
      defaultMonth={date}
      selected={date}
      onSelect={setDate}
      className="rounded-lg border shadow-sm bg-neutral-800/20"
    />
  );
}
