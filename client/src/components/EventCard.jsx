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
      "
    >
      <div className="md:w-1/4 w-full h-48 md:h-auto">
        {event.cover_image ? (
          <img
            src={"/placeholder.jpg"}
            className="object-cover w-full h-full"
          />
        ) : (
          <img
            src={event.cover_image}
            alt={event.title}
            className="object-cover w-full h-full"
          />
        )}
      </div>

      <div className="flex flex-col justify-center p-5 text-white md:w-2/3">
        <span className="bg-purple-700 text-sm font-semibold px-3 py-1 rounded-full w-fit mb-3">
          {event.club?.name || "Unknown Club"}
        </span>
        <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          {event.description || "No description available for this event."}
        </p>
        <div className="text-xs text-gray-500 mt-3">
          {event.location} <br />
          {new Date(event.start_date).toLocaleDateString()} -{" "}
          {new Date(event.end_date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export default EventCard;
