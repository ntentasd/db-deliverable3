import React, { useState } from "react";
import { insertSettings, UserSettings } from "../services/settingsApi";
import { validateField } from "../services/validation";

interface SettingsFormProps {
  onSuccess: () => void;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ onSuccess }) => {
  // Form data excluding user_email
  const [formData, setFormData] = useState<Omit<UserSettings, "user_email">>({
    seat_position_horizontal: null,
    seat_position_vertical: null,
    seat_recline_angle: null,
    steering_wheel_position: null,
    left_mirror_angle: null,
    right_mirror_angle: null,
    rearview_mirror_angle: null,
    cabin_temperature: null,
    drive_mode: null,
    suspension_height: null,
    engine_start_stop: false,
    cruise_control: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = 
      target.type === "checkbox" 
        ? target.checked 
        : target.type === "number"
        ? target.value === "" ? null : parseFloat(target.value)
        : target.value;
    const fieldName = target.name as keyof typeof formData;
  
    const errorMessage = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
  
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const sanitizedData: Partial<UserSettings> = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== undefined)
    );
  
    try {
      console.log("Sanitized Data:", sanitizedData);
      await insertSettings(sanitizedData as UserSettings);
      onSuccess();
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };
  
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-2xl font-bold text-teal-400">Settings</h2>

      {Object.keys(formData).map((key) => {
        const value = formData[key as keyof typeof formData];
        const error = errors[key];
        const isCheckbox = typeof value === "boolean";

        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-300 capitalize mb-1">
              {key.replace(/_/g, " ")}
            </label>

            {isCheckbox ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name={key}
                  checked={value as boolean}
                  onChange={handleChange}
                  className="hidden"
                  id={key}
                />
                <label
                  htmlFor={key}
                  className={`relative inline-flex items-center h-6 w-11 cursor-pointer rounded-full ${
                    value ? "bg-teal-500" : "bg-gray-500"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transform transition ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  ></span>
                </label>
              </div>
            ) : key === "drive_mode" ? (
              <select
                name={key}
                value={value || ""}
                onChange={handleChange}
                className={`w-full p-2 mt-1 rounded bg-gray-700 border ${
                  error ? "border-red-500" : "border-gray-600"
                } text-white focus:outline-none focus:ring-2 ${
                  error ? "focus:ring-red-500" : "focus:ring-teal-500"
                }`}
              >
                <option value="">Select a mode</option>
                <option value="COMFORT">Comfort</option>
                <option value="SPORT">Sport</option>
                <option value="ECO">Eco</option>
              </select>
            ) : (
              <input
                type="number"
                name={key}
                value={value || ""}
                onChange={handleChange}
                className={`w-full p-2 mt-1 rounded bg-gray-700 border ${
                  error ? "border-red-500" : "border-gray-600"
                } text-white focus:outline-none focus:ring-2 ${
                  error ? "focus:ring-red-500" : "focus:ring-teal-500"
                }`}
              />
            )}

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      })}

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className="w-1/4 bg-teal-500 text-white py-2 rounded hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
        >
          Save Settings
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;