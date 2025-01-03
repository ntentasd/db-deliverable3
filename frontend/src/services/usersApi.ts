import { authHeaders, baseApi } from './api';

export interface User {
  email: string;
  user_name: string;
  full_name: string;
  password?: string;
  driving_behavior: number;
  created_at: string;
}

interface UserResponse {
  message?: string;
  user?: User;
  token: string;
}

export interface UserMessage {
  message: string;
}

const api = baseApi;

export const login = async (email: string, password: string): Promise<UserResponse> => {
  const response = await api.post(`/login`,
    { email, password },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export const signup = async (email: string, username: string, full_name: string, password: string): Promise<UserResponse> => {
  const response = await api.post(`/signup`,
    { email, username, full_name, password },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export const fetchDetails = async (): Promise<User> => {
  const response = await api.get(
    `/user`,
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export const updateUsername = async (username: string): Promise<UserMessage> => {
  const response = await api.put(
    `/user/username`,
    { username: username  },
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export const updateFullname = async (fullname: string): Promise<UserMessage> => {
  const response = await api.put(
    `/user/full_name`,
    { full_name: fullname  },
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export const deleteAccount = async (): Promise<UserMessage> => {
  const response = await api.delete(
    `/user`,
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
}