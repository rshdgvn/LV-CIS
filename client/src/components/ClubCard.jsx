import React, { useState, useEffect } from "react";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate";
import { ArrowLeft } from "lucide-react";

function ClubCard({
  name,
  description,
  logo,
  status,
  onJoin,
  onEnter,
  onCancel,
}) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("member");
  const [officerTitle, setOfficerTitle] = useState("");

  const resetDialog = () => {
    setStep(1);
    setSelectedRole("member");
    setOfficerTitle("");
  };

  const handleContinue = () => {
    if (step === 1 && selectedRole === "officer") {
      setStep(2);
      return; 
    }

    if (step === 2 && !officerTitle.trim()) {
      return; 
    }

    if (onJoin) {
      onJoin(
        selectedRole,
        selectedRole === "officer" ? officerTitle.trim() : null
      );
    }
  };

  const renderDialogDescription = () => {
    if (step === 1) {
      return (
        <div>
          <p className="mb-3 text-sm text-gray-300">
            Choose your role before sending the join request:
          </p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="role"
                value="member"
                checked={selectedRole === "member"}
                onChange={() => setSelectedRole("member")}
              />
              Member
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="role"
                value="officer"
                checked={selectedRole === "officer"}
                onChange={() => setSelectedRole("officer")}
              />
              Officer
            </label>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div>
          <p className="mb-2 text-sm text-gray-300">
            Enter your officer title:
          </p>
          <input
            type="text"
            placeholder="e.g. President, Secretary"
            value={officerTitle}
            onChange={(e) => setOfficerTitle(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 text-sm"
          />

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-blue-400 text-xs hover:text-blue-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>
      );
    }
  };

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
        title={step === 1 ? "Join this club?" : "Officer Title"}
        description={renderDialogDescription()}
        onConfirm={handleContinue}
        onOpenChange={(open) => {
          if (!open) resetDialog();
        }}
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
