import axios from "axios";

export interface Metadata {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_trips: number;
}

export const baseApi = axios.create({
  baseURL: (window as any).env?.REACT_APP_BACKEND_URL || "http://localhost:8000",
});

export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const authHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authorization token is missing');
  }
  return { Authorization: `Bearer ${token}` };
};