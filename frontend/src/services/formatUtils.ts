export const formatDateTime = (dateTime: string | null): string => {
  if (!dateTime) return "Ongoing";
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPlaceholder = (value: number | null | undefined, unit?: string): string => {
  return value == null ? "Not yet calculated" : `${value}${unit ? ` ${unit}` : ""}`;
};

export const formatLicensePlate = (value: string): string => {
  return value.slice(0, 3) + '-' + value.slice(3)
}

export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};