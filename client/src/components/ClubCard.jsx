import React from "react";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate";
import { Handshake, DoorOpen, HourglassIcon } from "lucide-react";

function ClubCard({
  name,
  description,
  logo,
  background,
  status,
  onJoin,
  onEnter,
  onCancel,
}) {
  const renderButton = () => {
    if (status === "pending") {
      return (
        <div className="flex justify-between">
          <button className="flex items-center justify-start gap-2 text-yellow-400/50 text-sm font-semibold transition-colors">
            <HourglassIcon className="w-4 h-4" />
            <span>Pending</span>
          </button>

          <AlertDialogTemplate
            title="Cancel Application?"
            description="Are you sure you want to cancel your club application?"
            onConfirm={onCancel}
            button={
              <button className="flex items-center justify-start gap-2 text-red-400 text-sm font-semibold transition-colors">
                Cancel
              </button>
            }
          />
        </div>
      );
    }

    if (status === "approved") {
      return (
        <button
          onClick={onEnter}
          className="flex items-center justify-start gap-2 text-green-600 text-sm font-semibold transition-colors hover:text-green-500"
        >
          <DoorOpen className="w-4 h-4" />
          Access Club
        </button>
      );
    }

    return (
      <AlertDialogTemplate
        title="Join this club?"
        description="Are you sure you want to join this club?"
        onConfirm={() => onJoin && onJoin("member", null)}
        button={
          <div className="flex items-center justify-start gap-2 text-blue-500 hover:text-blue-400 text-sm font-semibold cursor-pointer transition-colors">
            <Handshake className="w-4 h-4" />
            <span>Join Us</span>
          </div>
        }
      />
    );
  };

  return (
    <div
      onClick={onEnter}
      className="
        w-72 rounded-xl overflow-hidden 
        border border-gray-800 
        bg-neutral-900/80 backdrop-blur-sm
        shadow-[0_4px_20px_rgba(0,0,0,0.3)]
        hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)]
        hover:scale-[1.03]
        transition-all duration-300 ease-out 
        flex flex-col
        cursor-pointer
      "
    >
      <div
        className="relative h-28 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: background
            ? `url(${background})`
            : "linear-gradient(to bottom, #1e1e1e, #111)",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        {logo && (
          <img
            src={logo}
            alt={`${name} Logo`}
            className="relative z-10 w-16 h-16 object-contain rounded-full shadow-lg bg-white"
          />
        )}
      </div>

      <div className="flex flex-col justify-between flex-1 p-4">
        <div>
          <h3 className="text-base font-bold">{name}</h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
            {description || "No description available."}
          </p>
        </div>

        <div className="mt-8">{renderButton()}</div>
      </div>
    </div>
  );
}

export default ClubCard;
