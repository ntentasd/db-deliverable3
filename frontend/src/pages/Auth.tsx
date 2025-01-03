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
      <h2 className="text-2xl font-bold text-center">
        {isSignup ? "Sign Up" : "Log In"}
      </h2>
      <div className="text-center my-4">
        <button
          onClick={toggleForm}
          className="text-blue-500 hover:underline"
        >
          {isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
        </button>
      </div>
      {isSignup ? <SignupForm /> : <LoginForm />}
    </div>
  );
};

export default Auth;
