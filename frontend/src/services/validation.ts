export const validateField = (field: string, value: any): string | null => {
  if (value === null || value === "") return null;

  if (typeof value === "number") {
    switch (field) {
      case "seat_position_horizontal":
      case "seat_position_vertical":
      case "steering_wheel_position":
      case "suspension_height":
        if (value < 0 || value > 999.9) {
          return "Value must be between 0 and 999.9.";
        }
        break;
      case "seat_recline_angle":
      case "rearview_mirror_angle":
      case "left_mirror_angle":
      case "right_mirror_angle":
        if (value < 0 || value > 90) {
          return "Value must be between 0 and 90.";
        }
        break;
      case "cabin_temperature":
        if (value < 15 || value > 35) {
          return "Temperature must be between 15 and 35.";
        }
        break;
      default:
        break;
    }
  }

  if (field === "drive_mode" && !["COMFORT", "SPORT", "ECO"].includes(value)) {
    return "Invalid drive mode selected. Allowed values are: COMFORT, SPORT, ECO.";
  }

  if (typeof value === "boolean") {
    return null;
  }

  return null;
};
