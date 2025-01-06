import { baseApi, Metadata } from "./api";
import { Car } from "./carsApi";

export interface Service {
  id: number;
  car_license_plate: string;
  service_date: string;
  description: string | null;
  service_cost: number;
}

export interface ServiceResponse {
  data: {
    car: Car;
    services: Service[];
  },
  meta: Metadata;
}

const api = baseApi;

export const getServicesPaginated = async (license_plate: string, page: number, page_size: number = 3): Promise<ServiceResponse> => {
  try {
    const response = await api.get(`/details/${license_plate}/services`, {
      headers: { 'Content-Type': 'application/json' },
      params: { page, page_size },
    });
    return response.data;
  } catch (err: any) {
    console.error("Error in getServicesPaginated:", err.response || err.message);
    throw new Error(err.response?.data?.error || "Failed to fetch services.");
  }
}