export const CAT_PRESETS: Record<string, string[]> = {
  restaurant: [
    "Reservation",
    "Complaint",
    "Compliment",
    "Catering Inquiry",
    "General Question",
  ],
  salon: [
    "Appointment",
    "Complaint",
    "Compliment",
    "Service Question",
    "General Question",
  ],
  retail: [
    "Product Question",
    "Complaint",
    "Return / Exchange",
    "Compliment",
    "General Question",
  ],
  default: ["Complaint", "Compliment", "Question", "Suggestion", "Other"],
};
