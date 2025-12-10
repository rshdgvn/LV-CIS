import React from "react";
import { MoreVertical, Edit, Trash2, MapPin, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertDialogTemplate } from "@/components/AlertDialogTemplate";

function EventCard({ event, onEdit, onDelete, canManage }) {
  return (
    <div className="group relative flex flex-col md:flex-row bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-out h-auto md:h-64">
      {/* Image section */}
      <div className="md:w-1/3 w-full h-48 md:h-full relative overflow-hidden">
        <img
          src={event.cover_image || "/placeholder.jpg"}
          alt={event.title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {/* Mobile Badge */}
        <div className="absolute top-3 left-3 md:hidden">
          <span className="bg-neutral-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md border border-neutral-700">
            {event.club?.name || "Club Event"}
          </span>
        </div>
      </div>

      {/* Content section */}
      <div className="flex flex-col p-5 text-white md:w-2/3 relative">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-purple-700 text-sm font-semibold px-3 py-1 rounded-full w-fit mb-3 truncate">
            {event.club?.name || "Unknown Club"}
          </span>

          {/* THREE DOTS MENU */}
          {canManage && (
            <div className="absolute top-3 right-3 z-20">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-neutral-900/50 hover:bg-neutral-800 text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="bg-neutral-900 border-neutral-800 text-white z-50"
                >
                  {/* 1. EDIT BUTTON (Added this) */}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation(); // Stop card click
                      onEdit(event); // Trigger parent edit
                    }}
                    className="cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>

                  {/* 2. DELETE BUTTON (Wrapped in preventative div) */}
                  <div
                    onClick={(e) => e.stopPropagation()} // Stop card click
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {/* CRITICAL: We pass a custom button to AlertDialogTemplate 
                       that looks like a DropdownMenuItem 
                    */}
                    <AlertDialogTemplate
                      title="Delete Event?"
                      description={`Are you sure you want to delete "${event.title}"? This action cannot be undone.`}
                      onConfirm={() => onDelete(event.id)}
                      button={
                        <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-neutral-800 text-red-400 focus:bg-neutral-800 focus:text-red-500 w-full">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </div>
                      }
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold mb-2 truncate pr-8">{event.title}</h2>

        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-3 mb-auto">
          {event.description || "No description available for this event."}
        </p>

        <div className="flex flex-col gap-1.5 mt-4 pt-4 border-t border-neutral-800/50">
          {event.start_date && (
            <div className="flex items-center text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5 mr-2 text-neutral-500" />
              <span>
                {new Date(event.start_date).toLocaleDateString()}
                {event.event_time && ` • ${event.event_time}`}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center text-xs text-gray-400">
              <MapPin className="w-3.5 h-3.5 mr-2 text-neutral-500" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventCard;
