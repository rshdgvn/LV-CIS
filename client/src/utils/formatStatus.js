// src/utils/formatStatus.js

export function formatStatus(status) {
  if (!status) {
    return {
      label: "Unknown",
      color: "text-gray-400",
      bg: "bg-neutral-800 border border-neutral-700",
    };
  }

  const normalized = status.toLowerCase();

  switch (normalized) {
    case "present":
      return {
        label: "Present",
        color: "text-green-400",
        bg: "bg-green-900/30 border border-green-700/30",
      };

    case "late":
      return {
        label: "Late",
        color: "text-yellow-400",
        bg: "bg-yellow-900/30 border border-yellow-700/30",
      };

    case "absent":
      return {
        label: "Absent",
        color: "text-red-400",
        bg: "bg-red-900/30 border border-red-700/30",
      };
    case "excuse":
      return {
        label: "Excused",
        color: "text-blue-400",
        bg: "bg-blue-900/30 border border-blue-700/30",
      };

    default:
      return {
        label: status,
        color: "text-gray-400",
        bg: "bg-neutral-800 border border-neutral-700",
      };
  }
}
