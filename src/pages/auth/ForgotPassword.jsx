import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to process request"
        );
      }

      setSuccess(
        "If an account exists with this email, a password reset link has been sent."
      );

      setEmail("");

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">

        {/* Header */}
        <div className="text-center mb-6">

          <div className="flex justify-center mb-3">
            <span className="material-symbols-outlined text-green-700 text-5xl">
              lock_reset
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#131b2e]">
            Forgot Password?
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Enter your registered email and we'll send you a
            password reset link.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleForgotPassword}
          className="space-y-4"
        >

          {/* Email */}
          <div>

            <label className="block text-sm font-semibold mb-1">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your registered email"
              required
              className="w-full h-12 px-4 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600"
            />

          </div>

          {/* Send Reset Link */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold transition disabled:opacity-70"
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>

        </form>

        {/* Back to Login */}
        <div className="text-center mt-5 text-sm text-gray-600">

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-green-700 font-bold hover:underline"
          >
            ← Back to Login
          </button>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;