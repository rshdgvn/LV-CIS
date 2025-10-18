import React from "react";

function ClubCard({ name, description, logo, status, onJoin, onEnter }) {
  const renderButton = () => {
    if (status === "pending") {
      return (
        <button
          // disabled
          className="mt-4 w-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold py-2 rounded-lg cursor-not-allowed"
        >
          PENDING
        </button>
      );
    }

    if (status === "member") {
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
      <button
        onClick={onJoin}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
      >
        JOIN NOW
      </button>
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
