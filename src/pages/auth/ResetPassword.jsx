import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();

  // Get token from:
  // /reset-password?token=XXXXXXXX
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check token
    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    // Check password
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    // Check password length
    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Password reset failed."
        );
      }

      setSuccess(
        "Password reset successfully! Redirecting to login..."
      );

      // Redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error("Reset password error:", error);

      setError(
        error.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // If token is missing
  if (!token) {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 text-center">

          <div className="flex justify-center mb-4">
            <span className="material-symbols-outlined text-red-600 text-5xl">
              error
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#131b2e]">
            Invalid Reset Link
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            This password reset link is invalid or incomplete.
          </p>

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="mt-6 w-full h-12 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold"
          >
            Request New Reset Link
          </button>

        </div>

      </div>
    );
  }

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
            Reset Password
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Create a new password for your EcoTrack account.
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
          onSubmit={handleResetPassword}
          className="space-y-4"
        >

          {/* New Password */}
          <div>

            <label className="block text-sm font-semibold mb-1">
              New Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter new password"
                required
                className="w-full h-12 px-4 pr-12 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700"
              >
                <span className="material-symbols-outlined">
                  {showPassword
                    ? "visibility_off"
                    : "visibility"}
                </span>
              </button>

            </div>

          </div>

          {/* Confirm Password */}
          <div>

            <label className="block text-sm font-semibold mb-1">
              Confirm New Password
            </label>

            <div className="relative">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
                required
                className="w-full h-12 px-4 pr-12 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700"
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword
                    ? "visibility_off"
                    : "visibility"}
                </span>
              </button>

            </div>

          </div>

          {/* Password Requirements */}
          <div className="text-xs text-gray-500">
            Password must contain at least 8 characters.
          </div>

          {/* Reset Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold transition disabled:opacity-70"
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
          </button>

        </form>

        {/* Back to Login */}
        <div className="text-center mt-5">

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

export default ResetPassword;