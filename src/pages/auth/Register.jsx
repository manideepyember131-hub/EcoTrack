import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    if (!address.trim()) {
      setError("Please enter your address.");
      return;
    }

    if (!role) {
      setError("Please select your role.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            address,
            role,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      setSuccess(
        "Registration successful! Redirecting to login..."
      );

      // Clear form
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setRole("");
      setPassword("");
      setConfirmPassword("");

      // Redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 1500);
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
              person_add
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#131b2e]">
            Create EcoTrack Account
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Join the EcoTrack community
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
          onSubmit={handleRegister}
          className="space-y-4"
        >

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full h-12 px-4 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full h-12 px-4 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Phone Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                // Allow only numbers
                const value = e.target.value.replace(/\D/g, "");

                // Limit to 10 digits
                if (value.length <= 10) {
                  setPhone(value);
                }
              }}
              placeholder="Enter 10-digit phone number"
              required
              maxLength={10}
              className="w-full h-12 px-4 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Address
            </label>

            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete address"
              required
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600 resize-none"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">
                Select your role
              </option>

              <option value="citizen">
                Citizen
              </option>

              <option value="worker">
                Worker
              </option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a password"
                required
                className="w-full h-12 px-4 pr-12 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <span className="material-symbols-outlined">
                  {showPassword
                    ? "visibility_off"
                    : "visibility"}
                </span>
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-1">
              Password must contain at least 8 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Confirm Password
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
                  setConfirmPassword(e.target.value)
                }
                placeholder="Re-enter your password"
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
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword
                    ? "visibility_off"
                    : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold transition disabled:opacity-70"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <div className="text-center mt-5 text-sm text-gray-600">
          Already have an account?

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="ml-1 text-green-700 font-bold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;