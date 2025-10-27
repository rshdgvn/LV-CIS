import React from "react";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate";
import { Handshake, DoorOpen } from "lucide-react";

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
        <div className="w-6">
          <button className="bg-yellow-500/20 text-yellow-400 text-sm font-semibold py-3 rounded-xl cursor-not-allowed border border-yellow-500/40 shadow-inner">
            PENDING
          </button>

          {onCancel && (
            <div className="mt-3">
              <AlertDialogTemplate
                title="Cancel Application?"
                description="Are you sure you want to cancel your club application?"
                onConfirm={onCancel}
                button={
                  <button className="w-full bg-red-700 hover:bg-red-800 text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-md">
                    Cancel Application
                  </button>
                }
              />
            </div>
          )}
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
    <div className="w-72 rounded-2xl overflow-hidden shadow-xl border border-gray-800 text-white hover:scale-[1.02] transition-transform duration-300 flex flex-col">
      <samp></samp>{" "}
      <div
        className="relative h-28 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: background
            ? `url(${background})`
            : "linear-gradient(to bottom, #1e1e1e, #111)",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        {logo && (
          <img
            src={logo}
            alt={`${name} Logo`}
            className="relative z-10 w-16 h-16 object-contain rounded-full shadow-lg"
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

        <div className="mt-6">{renderButton()}</div>
      </div>
    </div>
  );
}

export default ClubCard;
