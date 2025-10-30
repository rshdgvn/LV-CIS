export function getTaskStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-600";
    case "in_progress":
      return "bg-blue-600";
    case "completed":
      return "bg-green-600";
    default:
      return "bg-gray-600";
  }
}
