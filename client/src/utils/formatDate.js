export function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid date";

  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}
