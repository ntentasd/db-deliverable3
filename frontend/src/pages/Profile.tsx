import React, { useEffect, useState } from "react";
import { deleteAccount, fetchDetails, updateFullname, updateUsername, UserMessage } from "../services/usersApi";
import { User } from "../services/usersApi";
import { capitalizeFirstLetter, formatDateTime } from "../services/formatUtils";
import ProfileInfo from "../components/ProfileInfo";
import EditableField from "../components/EditableField";
import { isAdminJWT } from "../services/authUtils";

const Profile: React.FC = () => {
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
        driving_behavior: 0,
        created_at: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    const getUserDetails = async () => {
      try {
        const userData = await fetchDetails();
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
    const response = await updateUsername(newUsername);
    setUser((prevUser) => (prevUser ? { ...prevUser, user_name: newUsername } : prevUser));
    return response;
  };

  const handleUpdateFullname = async (newFullname: string): Promise<UserMessage> => {
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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white border rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        {isAdmin ? "Admin Profile" : "User Profile"}
      </h2>
      {user ? (
        <div className="space-y-6">
          {isAdmin ? (
            <>
              <ProfileInfo label="Username" value={user.user_name} />
              <ProfileInfo label="Fullname" value={user.full_name} />
            </>
          ) : (
            <>
              <EditableField
                label="Username"
                value={user.user_name || ""}
                onSave={handleUpdateUsername}
              />
              <EditableField
                label="Fullname"
                value={user.full_name || ""}
                onSave={handleUpdateFullname}
              />
            </>
          )}
          <ProfileInfo label="Email" value={user.email || ""} />
          {!isAdmin && (
            <>
            <ProfileInfo
              label="Joined"
              value={formatDateTime(user.created_at) || ""}
            />
            <div className="text-center mt-6">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 active:ring-offset-0"
              >
                Delete Account
              </button>
            </div>
            </>
          )}
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default Profile;
