import React, { useEffect, useState } from "react";
import { getSettings, SettingsMessage, updateSetting, UserSettings } from "../services/settingsApi";
import EditableField from "../components/EditableField";
import SettingsForm from "../components/SettingsForm";
import { validateField } from "../services/validation";
import ErrorMessage from "../components/ErrorMessage";
import { useNavigate } from "react-router-dom";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const defaultSettings: UserSettings = {
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
  };

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        setSettings({ ...defaultSettings, ...data });
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

  const handleSave = async (field: keyof UserSettings, newValue: any): Promise<SettingsMessage> => {
    try {
      const parsedValue =
        typeof newValue === "boolean"
          ? newValue
          : newValue === "N/A"
          ? null
          : isNaN(Number(newValue))
          ? newValue
          : parseFloat(newValue);
  
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

  if (error && error !== "settings not found") {
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <>
    <button
      onClick={() => navigate("/profile")}
      className="h-10 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition"
    >
      Back to Profile
    </button>
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 text-gray-200 rounded-lg shadow-lg">
      
      <h1 className="text-3xl font-bold text-teal-400 mb-6">Settings</h1>

      <div className="space-y-6">
        {Object.entries(settings)
          .filter(([key]) => key !== "user_email")
          .map(([key, value]) => {
            const isCheckbox = typeof value === "boolean";

            return (
              <div key={key} className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-300 capitalize">
                  {key.replace(/_/g, " ")}
                </label>

                <EditableField
                  value={typeof value === "boolean" ? value : value === null ? "" : value}
                  type={isCheckbox ? "boolean" : key === "drive_mode" ? "enum" : "decimal"}
                  validate={(val) => validateField(key, val)}
                  onSave={(newValue) => handleSave(key as keyof UserSettings, newValue)}
                  enumOptions={key === "drive_mode" ? ["COMFORT", "SPORT", "ECO"] : undefined}
                />
              </div>
            );
          })}
      </div>
    </div>
    </>
  );
};

export default Settings;
