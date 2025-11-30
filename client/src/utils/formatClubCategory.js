export function formatClubCategory(category) {
  const map = {
    academics: "Academics",
    culture_and_performing_arts: "Culture & Performing Arts",
    socio_politics: "Socio-Politics",
  };

  return map[category] || "Unknown";
}
