import { authHeaders, baseApi } from "./api";

export interface UserSettings {
  seat_position_horizontal: number | null;
  seat_position_vertical: number | null;
  seat_recline_angle: number | null;
  steering_wheel_position: number | null;
  left_mirror_angle: number | null;
  right_mirror_angle: number | null;
  rearview_mirror_angle: number | null;
  cabin_temperature: number | null;
  drive_mode: "COMFORT" | "SPORT" | "ECO" | null;
  suspension_height: number | null;
  engine_start_stop: boolean;
  cruise_control: boolean;
}

export interface SettingsMessage {
  message: string;
}

const api = baseApi;

export const getSettings = async (): Promise<UserSettings> => {
  const response = await api.get(`/user/settings`, {
    headers: { ...authHeaders(), "Content-Type": "application/json" },
  });

  console.log("Response from backend:", response.data);

  return response.data as UserSettings;
};

export const insertSettings = async (settings: UserSettings): Promise<string> => {
  console.log('Payload sent to backend:', settings);
  const response = await api.post(
    `/user/settings`,
    settings,
    { headers: { ...authHeaders(), "Content-Type": "application/json" } }
  );
  return response.data;
};


export const updateSetting = async (settings: Partial<UserSettings>): Promise<SettingsMessage> => {
  const filteredSettings = Object.fromEntries(
    Object.entries(settings).filter(([_, value]) => value !== null && value !== undefined)
  );

  const response = await api.put(
    `/user/settings`,
    filteredSettings,
    { headers: { ...authHeaders(), "Content-Type": "application/json" } }
  );
  return response.data;
};
