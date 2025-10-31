export function formatTaskStatus(status) {
  if (!status) return "";

  const map = {
    pending: "Pending",
    in_progress: "Ongoing",
    completed: "Completed",
  };

  return map[status] || status.charAt(0).toUpperCase() + status.slice(1);
}
