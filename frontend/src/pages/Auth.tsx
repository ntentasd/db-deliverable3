import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

const Auth: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);

  const toggleForm = () => {
    setIsSignup((prev) => !prev);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center py-4">
        {isSignup ? "Sign Up" : "Log In"}
      </h2>
      {isSignup ? <SignupForm /> : <LoginForm />}
      <div className="text-center mt-4">
        {isSignup ? (
          <p>
            Already have an account?{" "}
            <button onClick={toggleForm} className="text-blue-600 hover:underline">
              Log In
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{" "}
            <button onClick={toggleForm} className="text-green-600 hover:underline">
              Sign Up
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
