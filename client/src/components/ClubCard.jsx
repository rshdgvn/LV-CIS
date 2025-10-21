import React from "react";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate";
import { APP_URL } from "@/lib/config";

function ClubCard({
  name,
  description,
  logo,
  status,
  onJoin,
  onEnter,
  onCancel,
}) {
  const renderButton = () => {
    if (status === "pending") {
      return (
        <div className="flex flex-col gap-2">
          <button className="mt-4 w-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold py-2 rounded-lg cursor-not-allowed">
            PENDING
          </button>

          {onCancel && (
            <AlertDialogTemplate
              title="Cancel Application?"
              description="Are you sure you want to cancel your club application?"
              onConfirm={onCancel}
              button={
                <button className="w-full bg-red-700 hover:bg-red-800 text-gray-200 text-xs font-semibold py-2 rounded-lg transition-colors">
                  Cancel Application
                </button>
              }
            />
          )}
        </div>
      );
    }

    if (status === "approved") {
      return (
        <button
          onClick={onEnter}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          ENTER NOW
        </button>
      );
    }

    return (
      <AlertDialogTemplate
        title="Join this club?"
        description="Are you sure you want to send a join request to this club?"
        onConfirm={onJoin}
        button={
          <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
            JOIN NOW
          </button>
        }
      />
    );
  };

  return (
    <div className="w-[200px] bg-neutral-900 rounded-2xl overflow-hidden shadow-lg text-white">
      <div className="bg-white h-[100px] flex items-center justify-center">
        {logo ? (
          <img
            src={logo}
            alt={`${name} Logo`}
            className="h-16 w-16 object-contain"
          />
        ) : (
          <div className="text-gray-400 text-xs">Logo</div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-center">{name}</h3>
        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
          {description || "No description available."}
        </p>

        {renderButton()}
      </div>
    </div>
  );
}

export default ClubCard;
