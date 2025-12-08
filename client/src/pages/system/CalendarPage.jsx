import React from "react";
import { Calendar1Icon, ArrowLeft } from "lucide-react";
import Calendar from "./Calendar";
import { useNavigate } from "react-router-dom";

const CalendarPage = () => {
  const nav = useNavigate();

  return (
    <>
      <button
        onClick={() => nav(-1)}
        className="absolute top-4 left-4 z-50 p-2 rounded-md bg-neutral-800/60 hover:bg-neutral-950/60 transition"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex flex-col gap-2 mt-5 ml-24">
        <div className="flex flex-row items-center gap-5 mb-5">
          <div className="shrink-0 p-2 bg-blue-900/30 rounded-lg">
            <Calendar1Icon className="w-9 h-9 text-blue-400" />
          </div>
          <h1 className="text-4xl font-semibold">Calendar</h1>
        </div>
      </div>
      <Calendar />
    </>
  );
};

export default CalendarPage;
