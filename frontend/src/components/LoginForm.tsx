import React, { useState } from "react";
import { login } from "../services/usersApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { capitalizeFirstLetter } from "../services/formatUtils";

interface LoginFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ loading, setLoading }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
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

    try {
      const response = await login(formData.email, formData.password);

      if (response.token) {
        setAuthToken(response.token);
        navigate("/profile");
      } else {
        setError("Login failed. Please try again.");
      }
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
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full p-3 rounded-lg font-semibold text-white transition-all duration-300 ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-teal-500 hover:bg-teal-600"
        }`}
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
};

export default LoginForm;
