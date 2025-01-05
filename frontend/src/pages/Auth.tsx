import React, { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(
    new URLSearchParams(location.search).get("mode") === "signup"
  );

  useEffect(() => {
    const queryMode = new URLSearchParams(location.search).get("mode");
    setIsSignup(queryMode === "signup");
  }, [location.search]);

  const toggleForm = () => {
    const newMode = isSignup ? "" : "signup";
    navigate(`/auth${newMode ? `?mode=${newMode}` : ""}`);
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
      <Helmet>
        <title>DataDrive - {isSignup ? "Sign Up" : "Log In"}</title>
      </Helmet>
      <h2 className="text-3xl font-bold text-center text-teal-400 mb-6">
        {isSignup ? "Sign Up" : "Log In"}
      </h2>
      {isSignup ? <SignupForm /> : <LoginForm />}
      <div className="text-center mt-6">
        {isSignup ? (
          <p className="text-gray-400">
            Already have an account?{" "}
            <button
              onClick={toggleForm}
              className="text-teal-500 hover:underline"
            >
              Log In
            </button>
          </p>
        ) : (
          <p className="text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={toggleForm}
              className="text-teal-500 hover:underline"
            >
              Sign Up
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
