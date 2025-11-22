export function getTaskStatusColor(status) {
  switch (status) {
    case "pending":
      return "!bg-yellow-600";
    case "in_progress":
      return "!bg-blue-800";
    case "completed":
      return "!bg-green-700";
    default:
      return "!bg-gray-600";
  }
}
