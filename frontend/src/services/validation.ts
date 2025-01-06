export const validateField = (field: string, value: any): string | null => {
  if (value === null || value === "") return "This field is required.";
  
  if (typeof value === "number") {
    if (value < 0) return "Value cannot be negative.";
    if (field.includes("temperature") && (value < -50 || value > 50)) {
      return "Temperature must be between -50 and 50.";
    }
  }
  return null; // No error
};
