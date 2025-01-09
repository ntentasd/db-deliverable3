import React, { useEffect, useState } from "react";
import {
  getSubscriptions,
  getActiveSubscription,
  buySubscription,
  cancelSubscription,
  Subscription,
  SubscriptionMessage,
  UserSubscription,
  CancelMessage,
} from "../services/subscriptionsUtils";
import { capitalizeFirstLetter } from "../services/formatUtils";
import ErrorMessage from "../components/ErrorMessage";
import { FaTrashAlt } from "react-icons/fa";

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<UserSubscription | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionsData = async () => {
      try {
        const [allSubscriptions, activeSub] = await Promise.allSettled([
          getSubscriptions(),
          getActiveSubscription(),
        ]);

        if (allSubscriptions.status === "fulfilled") {
          setSubscriptions(allSubscriptions.value);
        } else {
          setError("Failed to load subscriptions.");
        }

        if (activeSub.status === "fulfilled") {
          setActiveSubscription(activeSub.value);
        } else if (activeSub.reason?.response?.status === 404) {
          setActiveSubscription(null);
        } else {
          setError("Failed to load active subscription.");
        }

        setLoading(false);
      } catch {
        setError("An unexpected error occurred. Please try again later.");
        setLoading(false);
      }
    };

    fetchSubscriptionsData();
  }, []);

  const handleBuySubscription = async (subscriptionName: string) => {
    try {
      const response: SubscriptionMessage = await buySubscription({
        subscription_name: subscriptionName,
      });
      setMessage(response.message);

      const updatedActiveSubscription = await getActiveSubscription();
      setActiveSubscription(updatedActiveSubscription);
    } catch {
      setError("Failed to purchase subscription. Please try again.");
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel your active subscription?");
    if (confirmed) {
      try {
        const response: CancelMessage = await cancelSubscription();
        console.log("Subscription cancelled:", response.message);
        setActiveSubscription(null);
        setMessage(response.message);
      } catch (err: any) {
        console.error("Failed to cancel subscription:", err);
        setError("Failed to cancel subscription. Please try again.");
      }
    }
  };

  if (loading) return <div className="text-center text-teal-400">Loading...</div>;

  if (error) {
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-800 text-gray-200 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-teal-400 mb-12">Manage Subscriptions</h1>
      {message && <p className="text-green-400 mb-4">{capitalizeFirstLetter(message)}</p>}

      {/* Active Subscription Section */}
      {activeSubscription && (
        <div className="mb-8 p-6 bg-teal-900 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-teal-300">Active Subscription</h2>
          <p className="text-gray-400 mt-2">
            <strong>Subscription Name:</strong> {capitalizeFirstLetter(activeSubscription.subscription_name)}
          </p>
          <p className="text-gray-400 mt-1">
            <strong>Start Date:</strong> {new Date(activeSubscription.start_date || Date.now()).toLocaleDateString()}
          </p>
          <p className="text-gray-400 mt-1">
            <strong>End Date:</strong> {new Date(activeSubscription.end_date || Date.now()).toLocaleDateString()}
          </p>
          <button
            onClick={handleCancelSubscription}
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded flex items-center space-x-2 hover:bg-red-600 transition"
          >
            <FaTrashAlt />
            <span>Cancel Subscription</span>
          </button>
        </div>
      )}

      {/* Available Subscriptions Section */}
      <h2 className="text-2xl font-bold text-teal-400 mb-4">Available Subscriptions</h2>
      <div className="space-y-4">
        {subscriptions.map((subscription) => {
          const isAnyActive = !!activeSubscription;
          const isActive = activeSubscription?.subscription_name === subscription.name;

          return (
            <div
              key={subscription.name}
              className={`p-4 rounded-lg shadow-md border flex ${
                isActive ? "border-purple-500" : "border-gray-700"
              } bg-gray-700 hover:shadow-lg transition`}
            >
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold text-teal-300">{subscription.name}</h2>
                <p className="text-gray-300 mt-2">{subscription.description}</p>
                <p className="text-purple-400 font-bold mt-2">
                  ${subscription.price_per_month} per month
                </p>
              </div>
              <div className="w-full flex justify-end items-center">
                <button
                  onClick={() => handleBuySubscription(subscription.name)}
                  disabled={isAnyActive}
                  className={`mt-4 py-2 px-4 rounded-md transition h-1/2 ${
                    isAnyActive
                      ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                      : "bg-purple-500 text-white hover:bg-purple-600"
                  }`}
                >
                  {isActive ? "Active Subscription" : "Buy Subscription"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscriptions;
