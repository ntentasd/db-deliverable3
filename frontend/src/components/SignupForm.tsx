import React, { useState } from "react";
import { signup } from "../services/usersApi";
import { useNavigate } from "react-router-dom";

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    full_name: "",
    password: "",
  });
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
      localStorage.setItem("authToken", response.token);
      navigate("/profile");
    } catch (err: any) {
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
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          id="full_name"
          type="text"
          name="full_name"
          value={formData.full_name}
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
        className={`w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 ${
          isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
      >
        {isLoading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
};

export default SignupForm;