import React, { useState } from "react";
import { signup } from "../services/usersApi";
import { useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "../services/formatUtils";
import { useAuth } from "../contexts/AuthContext";

interface SignupFromProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const SignupForm: React.FC<SignupFromProps> = ({ loading, setLoading }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    full_name: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const { setAuthToken } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trimStart() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value.trim()])
    );

    try {
      const response = await signup(
        trimmedData.email,
        trimmedData.username,
        trimmedData.full_name,
        trimmedData.password
      );
      setAuthToken(response.token);
      navigate("/profile");
    } catch (err: any) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-red-500 text-sm text-center">
          {capitalizeFirstLetter(error)}
        </p>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-400">
          Username
        </label>
        <input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-400">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-400">
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full p-3 rounded-lg font-semibold text-white transition-all duration-300 ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-purple-500 hover:bg-purple-600"
        }`}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
};

export default SignupForm;
