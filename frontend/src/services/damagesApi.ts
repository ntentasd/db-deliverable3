import { authHeaders, baseApi, Metadata } from "./api";
import { Car } from "./carsApi";
import { MessageResponse } from "./reviewsApi";

export interface Damage {
  id: number;
  car_license_plate: string;
  reported_date: string;
  description: string | null;
  repaired: boolean;
  repair_cost: number;
}

export interface DamageResponse {
  data: {
    car: Car;
    damages: Damage[];
  },
  meta: Metadata;
}

const api = baseApi;

export const getDamagesPaginated = async (license_plate: string, page: number, page_size: number = 3): Promise<DamageResponse> => {
  try {
    const response = await api.get(`/details/${license_plate}/damages`, {
      headers: { "Content-Type": "application/json" },
      params: { page, page_size },
    });
    return response.data;
  } catch (err: any) {
    console.error("Error in getDamagesPaginated:", err.response || err.message);
    throw new Error(err.response?.data?.error || "Failed to fetch damages.");
  }
}

export const addDamage = async (license_plate: string, reported_date: string, description: string, repaired: boolean, repair_cost: number): Promise<MessageResponse> => {
  const response = await api.post(`/cars/damages`,
    { license_plate, reported_date, description, repaired, repair_cost },
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } },
  );
  return response.data;
}