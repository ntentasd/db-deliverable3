import axios from "axios";

export const baseApi = axios.create({
  baseURL: (window as any).env?.REACT_APP_BACKEND_URL || "http://localhost:8000",
});