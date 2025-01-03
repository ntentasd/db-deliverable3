export const formatDateTime = (dateTime: string | null): string => {
  if (!dateTime) return "Ongoing";
  const date = new Date(dateTime);
  return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
};

export const formatPlaceholder = (value: number | null | undefined, unit?: string): string => {
  return value == null ? "Not yet calculated" : `${value}${unit ? ` ${unit}` : ""}`;
};

export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};