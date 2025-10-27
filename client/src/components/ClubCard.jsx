import React from "react";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate";

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
        <div className="w-full">
          <button className="w-full bg-yellow-500/20 text-yellow-400 text-sm font-semibold py-3 rounded-xl cursor-not-allowed border border-yellow-500/40 shadow-inner">
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
          className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-md"
        >
          ENTER NOW
        </button>
      );
    }

    return (
      <AlertDialogTemplate
        title="Join this club?"
        description="Are you sure you want to join this club?"
        onConfirm={() => onJoin && onJoin("member", null)}
        button={
          <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-md">
            ENTER NOW
          </button>
        }
      />
    );
  };

  return (
    <div className="w-72 h-96 bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700 text-white hover:scale-[1.02] transition-transform duration-300 flex flex-col">
      <div
        className="relative h-[150px] bg-cover bg-center flex items-center justify-center"
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
            className="relative z-10 w-20 h-20 object-contain rounded-full border-4 border-white/30 shadow-lg"
          />
        )}
      </div>

      <div className="flex flex-col justify-between flex-1 p-8 text-center">
        <div>
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="text-gray-400 text-sm mt-2 line-clamp-3">
            {description || "No description available."}
          </p>
        </div>

        <div className="mt-6">{renderButton()}</div>
      </div>
    </div>
  );
}

export default ClubCard;
