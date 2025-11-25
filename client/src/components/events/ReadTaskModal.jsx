// components/events/ReadTaskModal.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function ReadTaskModal({ open, setOpen, task, onEdit }) {
  if (!task) return null;

  useEffect(()=>{
    console.log(task)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-neutral-950 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Task Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          <div>
            <p className="text-neutral-400 text-sm">Title</p>
            <p className="text-lg font-semibold">{task.title}</p>
          </div>

          <div>
            <p className="text-neutral-400 text-sm">Description</p>
            <p className="whitespace-pre-wrap">
              {task.description || "No description"}
            </p>
          </div>

          <div>
            <p className="text-neutral-400 text-sm">Status</p>
            <p className="capitalize">{task.status}</p>
          </div>

          <div>
            <p className="text-neutral-400 text-sm">Due Date</p>
            <p>
              {task.due_date
                ? new Date(task.due_date).toLocaleDateString()
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-neutral-400 text-sm mb-1">Assigned Members</p>
            {task.assigned?.length ? (
              <div className="space-y-2">
                {task.assigned.map((a) => (
                  <div
                    key={a.assignment_id}
                    className="flex items-center gap-2"
                  >
                    <img
                      src={
                        a.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${a.user?.first_name}+${a.user?.last_name}`
                      }
                      className="w-8 h-8 rounded-full"
                    />
                    <span>
                      {a.user?.first_name} {a.user?.last_name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">Not assigned</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            className="bg-blue-700 hover:bg-blue-600"
            onClick={() => {
              setOpen(false);
              onEdit(task.id);
            }}
          >
            Update Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
