import { baseApi } from './api';

interface Trip {
  id: number;
  user_email: string;
  car_license_plate: string;
  start_time: string;
  end_time: string | null;
  distance?: number;
  driving_behavior?: number;
}

interface TripResponse {
  data: Trip[];
  meta: {
    current_page: number;
    page_size: number;
    total_pages: number;
    total_trips: number;
  };
}

const api = baseApi;

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const authHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authorization token is missing');
  }
  return { Authorization: `Bearer ${token}` };
};

export const getTrips = async (): Promise<TripResponse> => {
  const response = await api.get(`/trips`, { headers: authHeaders() });
  return response.data;
};

export const getTripsPaginated = async (page: number, page_size: number = 10) => {
  const response = await api.get(`/trips`, {
    params: { page, page_size },
    headers: authHeaders(),
  });
  return response.data;
};

export const startTrip = async (licensePlate: string): Promise<any> => {
  const response = await api.post(
    `/trips/start`,
    { license_plate: licensePlate },
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
};

export const stopTrip = async (): Promise<any> => {
  const response = await api.post(
    `/trips/stop`,
    {},
    { headers: { ...authHeaders(), "Content-Type": "application/json" } }
  );
  console.log("Stop trip response:", response.data);
  return response.data;
};

export const getTripById = async (tripId: string): Promise<any> => {
  const response = await api.get(
    `/trips/details/${tripId}`,
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
};

export const updateTrip = async (tripId: string, trip: any): Promise<any> => {
  const response = await api.put(`/trips/${tripId}`, trip, { headers: authHeaders() });
  return response.data;
};