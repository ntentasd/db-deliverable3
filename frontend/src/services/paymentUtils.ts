export function calculateAmount(distance: number, costPerKm: number): number {
  return Math.round(distance * costPerKm * 100) / 100; // Consistent rounding to 2 decimal places
}
