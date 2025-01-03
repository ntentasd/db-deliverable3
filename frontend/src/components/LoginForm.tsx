import React, { useState } from "react";
import { login } from "../services/usersApi";
import { useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "../services/formatUtils";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trimStart() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(formData.email, formData.password);
      console.log("Login response:", response);

      if (response.token) {
        localStorage.setItem("authToken", response.token);

        // Delay navigation to ensure token is set
        setTimeout(() => {
          navigate("/profile");
        }, 100);
      } else {
        console.error("No token received from login response.");
        setError("Login failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {error && <p className="text-red-500 text-sm text-center">{capitalizeFirstLetter(error)}</p>}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 ${
          isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
      >
        {isLoading ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
};

export default LoginForm;
