import React from "react";

function EventCard({ event }) {
  return (
    <div
      className="
        flex flex-col md:flex-row
        bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden
        shadow-[0_4px_20px_rgba(0,0,0,0.3)]
        hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)]
        hover:scale-[1.02]
        transition-all duration-300 ease-out
        h-64   /* ✅ Fixed consistent card height */
      "
    >
      {/* Image section */}
      <div className="md:w-1/3 w-full h-full">
        <img
          src={event.cover_image || "/placeholder.jpg"}
          alt={event.title}
          className="object-cover w-full h-full" 
        />
      </div>

      {/* Content section */}
      <div className="flex flex-col justify-center p-5 text-white md:w-2/3 overflow-hidden">
        <span className="bg-purple-700 text-sm font-semibold px-3 py-1 rounded-full w-fit mb-3 truncate">
          {event.club?.name || "Unknown Club"}
        </span>

        <h2 className="text-2xl font-bold mb-2 truncate">{event.title}</h2>

        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
          {event.description || "No description available for this event."}
        </p>

        <div className="text-xs text-gray-500 mt-3">
          {event.location && (
            <>
              {event.location}
              <br />
            </>
          )}
          {event.start_date && event.end_date && (
            <>
              {new Date(event.start_date).toLocaleDateString()} –{" "}
              {new Date(event.end_date).toLocaleDateString()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCard;
