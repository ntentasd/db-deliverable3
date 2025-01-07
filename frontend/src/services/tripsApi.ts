import { authHeaders, baseApi, Metadata } from './api';

export interface Trip {
  id: number;
  user_email: string;
  car_license_plate: string;
  start_time: string;
  end_time: string | null;
  distance?: number;
  driving_behavior: number;
  amount: number | null;
  payment_method: string | null;
}

interface TripResponse {
  data: Trip[];
  meta: Metadata;
}

export interface TripCost {
  trip: Trip;
  cost_per_km: number;
}

const api = baseApi;

export const getTrips = async (): Promise<Trip[]> => {
  const response = await api.get(`/trips`, { headers: authHeaders() });
  return response.data;
};

export const getActiveTrip = async (): Promise<Trip> => {
  const response = await api.get(
    `/trips/active`,
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export const getTripsPaginated = async (page: number, page_size: number = 5): Promise<TripResponse> => {
  const response = await api.get(`/trips`, {
    params: { page, page_size },
    headers: authHeaders(),
  });
  return response.data;
};

export const startTrip = async (license_plate: string): Promise<any> => {
  const response = await api.post(
    `/trips/start`,
    { license_plate: license_plate },
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
};

export const stopTrip = async (distance: number, driving_behavior: number, payment_method: string, amount: number): Promise<any> => {
  const response = await api.post(
    `/trips/stop`,
    { distance, driving_behavior, payment_method, amount },
    { headers: { ...authHeaders(), "Content-Type": "application/json" } }
  );
  return response.data;
};

export const getTripById = async (trip_id: string): Promise<TripCost> => {
  const response = await api.get(
    `/trips/details/${trip_id}`,
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
};

export const updateTrip = async (trip_id: string, trip: any): Promise<any> => {
  const response = await api.put(`/trips/${trip_id}`, trip, { headers: authHeaders() });
  return response.data;
};

export const isSingleTrip = (data: Trip[] | Trip): data is Trip => {
  return !Array.isArray(data);
};

export const isTripList = (data: Trip[] | Trip): data is Trip[] => {
  return Array.isArray(data);
}