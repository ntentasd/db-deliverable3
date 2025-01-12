import { authHeaders, baseApi, Metadata } from "./api";

export interface Review {
  trip_id: number | null;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
}

interface ReviewData {
  emails: string[] | null;
  reviews: Review[] | null;
}

export interface ReviewResponse {
  data: ReviewData;
  meta: Metadata;
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

const api = baseApi;

export const getCarReviews = async (licensePlate: string, page: number, page_size: number = 5): Promise<ReviewResponse> => {
  const response = await api.get(
    `/reviews/car/${licensePlate}`, {
      params: { page, page_size },
      headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export const createReview = async (trip_id: number, rating: number, comment: string): Promise<MessageResponse> => {
  const response = await api.post(
    `/reviews`,
    { trip_id, rating, comment },
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } },
  );
  return response.data;
}