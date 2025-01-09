import React, { useEffect, useState } from "react";
import {
  deleteAccount,
  fetchDetails,
  updateFullname,
  updateUsername,
  UserMessage,
} from "../services/usersApi";
import { User } from "../services/usersApi";
import { capitalizeFirstLetter, formatDateTime } from "../services/formatUtils";
import EditableField from "../components/EditableField";
import { isAdminJWT } from "../services/authUtils";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isAdminJWT()) {
      setIsAdmin(true);
      setUser({
        email: "admin@datadrive.com",
        user_name: "Admin",
        full_name: "Admin",
        driving_behavior: null,
        created_at: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    const getUserDetails = async () => {
      try {
        const userData = await fetchDetails();
        console.log(userData);
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user details:", err);
        setError("Failed to load user details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getUserDetails();
  }, []);

  const handleUpdateUsername = async (newUsername: string): Promise<UserMessage> => {
    if (!newUsername.trim() || newUsername.length < 3) {
      throw new Error("Username must be at least 3 characters long.");
    }
    const response = await updateUsername(newUsername);
    setUser((prevUser) => (prevUser ? { ...prevUser, user_name: newUsername } : prevUser));
    return response;
  };
  
  const handleUpdateFullname = async (newFullname: string): Promise<UserMessage> => {
    if (!newFullname.trim() || newFullname.length < 3) {
      throw new Error("Fullname must be at least 3 characters long.");
    }
    const response = await updateFullname(newFullname);
    setUser((prevUser) => (prevUser ? { ...prevUser, full_name: newFullname } : prevUser));
    return response;
  };

  const handleDeleteAccount = async () => {
    const userConfirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!userConfirmed) {
      return;
    }

    try {
      const response = await deleteAccount();
      alert(capitalizeFirstLetter(response.message));
      localStorage.removeItem("authToken");
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete your account. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-300">
        <p className="text-lg">Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }

  const username = user?.user_name || "";

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
      <Helmet>
        <title>DataDrive - {capitalizeFirstLetter(username)}'s Profile</title>
      </Helmet>
      <h2 className="text-3xl font-bold mb-8 text-center text-teal-400">
        {isAdmin ? "Admin Profile" : "User Profile"}
      </h2>
      {user ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-600 pb-4">
              <span className="text-gray-300 font-semibold">Username:</span>
              {isAdmin ? (
                <span className="text-white">{user.user_name}</span>
              ) : (
                <EditableField
                  value={user.user_name || ""}
                  type="text"
                  validate={(value) =>
                    !value.trim() || value.length < 3 ? "Username must be at least 3 characters long." : null
                  }
                  onSave={(newValue) => handleUpdateUsername(newValue as string)}
                />
              )}
            </div>
            <div className="flex justify-between items-center border-b border-gray-600 pb-4">
              <span className="text-gray-300 font-semibold">Fullname:</span>
              {isAdmin ? (
                <span className="text-white">{user.full_name}</span>
              ) : (
                <EditableField
                  value={user.full_name || ""}
                  type="text"
                  validate={(value) =>
                    !value.trim() || value.length < 3 ? "Fullname must be at least 3 characters long." : null
                  }
                  onSave={(newValue) => handleUpdateFullname(newValue as string)}
                />
              )}
            </div>
            <div className="flex justify-between items-center border-b border-gray-600 pb-4">
              <span className="text-gray-300 font-semibold">Email:</span>
              <span className="text-white">{user.email || ""}</span>
            </div>
            {!isAdmin && (
              <div className="flex justify-between items-center border-b border-gray-600 pb-4">
                <span className="text-gray-300 font-semibold">Driving Behavior:</span>
                <span
                  className={
                    user.driving_behavior != null
                      ? user.driving_behavior <= 7
                        ? "text-green-400"
                        : user.driving_behavior <= 8.5
                        ? "text-orange-400"
                        : "text-red-400"
                      : "text-gray-400"
                  }
                >
                  {user.driving_behavior != null
                    ? user.driving_behavior.toFixed(2)
                    : "N/A"}
                </span>
              </div>
            )}
            {!isAdmin && (
              <div className="flex justify-between items-center border-b border-gray-600 pb-4">
                <span className="text-gray-300 font-semibold">Joined:</span>
                <span className="text-white">{formatDateTime(user.created_at) || ""}</span>
              </div>
            )}
          </div>
          {!isAdmin && (
            <div className="flex justify-around text-center mt-6 w-full">
              <button
                onClick={() => navigate("/profile/settings")}
                className="bg-purple-500 cursor-pointer text-white px-6 py-2 rounded-lg shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 active:ring-offset-0"
              >
                Settings
              </button>

              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 cursor-pointer text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 active:ring-offset-0"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400">No user data available.</p>
      )}
    </div>
  );
};

export default Profile;
