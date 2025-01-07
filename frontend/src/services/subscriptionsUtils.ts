import { authHeaders, baseApi } from "./api";

export interface Subscription {
  name: string;
  price_per_month: number;
  description: string;
}

export interface UserSubscription {
  subscription_name: string;
  start_date?: string | null;
  end_date?: string | null;
  is_cancelled?: boolean;
}

export interface SubscriptionMessage {
  message: string;
  end_date: string;
}

export interface CancelMessage {
  message: string;
}

const api = baseApi;

export const getSubscriptions = async (): Promise<Subscription[]> => {
  const response = await api.get(
    `/subscriptions`, {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
}

export const getActiveSubscription = async (): Promise<UserSubscription> => {
  const response = await api.get(
    `/subscriptions/active`, {
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    }
  );
  return response.data;
}

export const buySubscription = async (user_subscription: UserSubscription): Promise<SubscriptionMessage> => {
  const response = await api.post(
    `/subscriptions/buy`,
    user_subscription,
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
}

export const cancelSubscription = async (): Promise<CancelMessage> => {
  const response = await api.put(
    `/subscriptions/cancel`,
    {},
    { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
  );
  return response.data;
}