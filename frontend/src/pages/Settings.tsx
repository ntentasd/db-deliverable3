import React, { useEffect, useState } from "react";
import { getSettings, SettingsMessage, updateSetting, UserSettings } from "../services/settingsApi";
import { FaExclamationTriangle } from "react-icons/fa";
import EditableField from "../components/EditableField";
import { validateField } from "../services/validation";
import SettingsForm from "../components/SettingsForm";

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch settings:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to fetch settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (field: keyof UserSettings, newValue: string): Promise<SettingsMessage> => {
    try {
      const parsedValue = isNaN(Number(newValue)) ? newValue : parseFloat(newValue);
  
      const response = await updateSetting({ [field]: parsedValue });
      setSettings((prev) => prev && { ...prev, [field]: parsedValue });
      return response;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Update failed.");
    }
  };

  const isSettingsEmpty = Object.values(settings).every((value) => value === null || value === false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400 text-lg">Loading settings...</p>
      </div>
    );
  }

  if (isSettingsEmpty) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 p-6">
        <SettingsForm onSuccess={() => window.location.reload()} />
      </div>
    );
  }

  // if (
  //   settings.seat_position_horizontal === null &&
  //   settings.seat_position_vertical === null &&
  //   settings.seat_recline_angle === null &&
  //   settings.steering_wheel_position === null &&
  //   settings.left_mirror_angle === null &&
  //   settings.right_mirror_angle === null &&
  //   settings.rearview_mirror_angle === null &&
  //   settings.cabin_temperature === null &&
  //   settings.drive_mode === null &&
  //   settings.suspension_height === null
  // ) {
  //   return (
  //     <div className="max-w-4xl mx-auto space-y-12 p-6">
  //       <SettingsForm onSuccess={() => window.location.reload()} />
  //     </div>
  //   );
  // }

  if (error && error !== "settings not found") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="border-2 border-red-400 text-red-700 rounded-xl p-8 shadow-2xl max-w-lg w-full text-center">
          <FaExclamationTriangle size={64} className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Error</h2>
          <p className="text-lg mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-red-600 text-white text-lg rounded-lg hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 text-gray-200 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-teal-400 mb-6">Settings</h1>

      <div className="space-y-6">
      <EditableField
          label="Seat Position (Horizontal)"
          value={settings.seat_position_horizontal?.toString() || ""}
          type="decimal"
          validate={(val) => validateField("seat_position_horizontal", val)}
          onSave={(newValue) => handleSave("seat_position_horizontal", newValue)}
        />
        <EditableField
          label="Seat Position (Vertical)"
          value={settings.seat_position_vertical?.toString() || ""}
          type="decimal"
          validate={(val) => validateField("seat_position_vertical", val)}
          onSave={(newValue) => handleSave("seat_position_vertical", newValue)}
        />
        <EditableField
          label="Seat Recline Angle"
          value={settings.seat_recline_angle?.toString() || ""}
          type="decimal"
          validate={(val) => validateField("seat_recline_angle", val)}
          onSave={(newValue) => handleSave("seat_recline_angle", newValue)}
        />
        <EditableField
          label="Steering Wheel Position"
          value={settings.steering_wheel_position?.toString() || ""}
          type="decimal"
          validate={(val) => validateField("steering_wheel_position", val)}
          onSave={(newValue) => handleSave("steering_wheel_position", newValue)}
        />
        <EditableField
          label="Left Mirror Angle"
          value={settings.left_mirror_angle?.toString() || ""}
          type="decimal"
          validate={(val) => validateField("left_mirror_angle", val)}
          onSave={(newValue) => handleSave("left_mirror_angle", newValue)}
        />
        <EditableField
          label="Right Mirror Angle"
          value={settings.right_mirror_angle?.toString() || ""}
          type="decimal"
          validate={(val) => validateField("right_mirror_angle", val)}
          onSave={(newValue) => handleSave("right_mirror_angle", newValue)}
        />
        <EditableField
          label="Rearview Mirror Angle"
          value={settings.rearview_mirror_angle?.toString() || ""}
          type="decimal"
          validate={(val) => validateField("rearview_mirror_angle", val)}
          onSave={(newValue) => handleSave("rearview_mirror_angle", newValue)}
        />
        <EditableField
          label="Cabin Temperature"
          value={settings.cabin_temperature?.toString() || ""}
          type="decimal"
          validate={(val) => validateField("cabin_temperature", val)}
          onSave={(newValue) => handleSave("cabin_temperature", newValue)}
        />
        <EditableField
          label="Drive Mode"
          value={settings.drive_mode || ""}
          type="enum"
          enumOptions={["COMFORT", "SPORT", "ECO"]}
          validate={(val) => validateField("drive_mode", val)}
          onSave={(newValue) => handleSave("drive_mode", newValue)}
        />
        <EditableField
          label="Suspension Height"
          value={settings.suspension_height?.toString() || ""}
          type="decimal"
          validate={(val) => validateField("suspension_height", val)}
          onSave={(newValue) => handleSave("suspension_height", newValue)}
        />
        <EditableField
          label="Engine Start/Stop"
          value={settings.engine_start_stop ? "Enabled" : "Disabled"}
          type="boolean"
          validate={(val) => validateField("engine_start_stop", val)}
          onSave={(newValue) => handleSave("engine_start_stop", newValue)}
        />
        <EditableField
          label="Cruise Control"
          value={settings.cruise_control ? "Enabled" : "Disabled"}
          type="boolean"
          validate={(val) => validateField("cruise_control", val)}
          onSave={(newValue) => handleSave("cruise_control", newValue)}
        />
      </div>
    </div>
  );
};

export default Settings;
