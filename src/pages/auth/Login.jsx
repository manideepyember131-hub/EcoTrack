import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // ==================================================
  // LOGIN STATES
  // ==================================================

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // FORGOT PASSWORD STATES
  // ==================================================

  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  const [forgotEmail, setForgotEmail] =
    useState("");

  const [forgotMessage, setForgotMessage] =
    useState("");

  const [forgotLoading, setForgotLoading] =
    useState(false);

  // ==================================================
  // FORGOT PASSWORD
  // ==================================================

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setForgotMessage("");

    if (!forgotEmail.trim()) {
      setForgotMessage(
        "Please enter your registered email address."
      );
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotEmail.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to process password reset request."
        );
      }

      setForgotMessage(
        "If an account exists with this email, a password reset link has been sent."
      );

      setForgotEmail("");
    } catch (error) {
      setForgotMessage(error.message);
    } finally {
      setForgotLoading(false);
    }
  };

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // Remove unnecessary spaces
    const cleanIdentifier = identifier.trim();

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!cleanIdentifier || !password) {
      setError(
        "Please enter your email/phone and password."
      );
      return;
    }

    if (!role) {
      setError("Please select your role.");
      return;
    }

    setLoading(true);

    try {
      // ==================================================
      // LOGIN API
      // ==================================================

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            identifier: cleanIdentifier,
            password,
          }),
        }
      );

      const data = await response.json();

      // ==================================================
      // LOGIN ERROR
      // ==================================================

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      // ==================================================
      // CHECK USER ROLE
      // ==================================================

      const loggedInRole =
        data.user?.role?.toLowerCase();

      // ==================================================
      // VERIFY SELECTED ROLE
      // ==================================================

      if (role !== loggedInRole) {
        setError(
          `This account is registered as ${
            loggedInRole === "worker"
              ? "Worker"
              : "Citizen"
          }. Please select the correct role.`
        );

        return;
      }

      // ==================================================
      // STORE AUTHENTICATION INFORMATION
      // ==================================================

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log(
        "Logged-in user:",
        data.user
      );

      console.log(
        "Selected role:",
        role
      );

      // ==================================================
      // REDIRECT ACCORDING TO ROLE
      // ==================================================

      if (loggedInRole === "worker") {
        navigate("/worker-dashboard");
      } else if (
        loggedInRole === "citizen"
      ) {
        navigate("/citizen");
      } else {
        setError(
          "Your account has an unsupported role."
        );
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="text-center mb-6">

          <div className="flex justify-center mb-3">

            <span className="material-symbols-outlined text-green-700 text-5xl">
              recycling
            </span>

          </div>

          <h1 className="text-2xl font-bold text-[#131b2e]">
            Welcome to EcoTrack
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Sign in to continue
          </p>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* ==================================================
            LOGIN FORM
        ================================================== */}

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          {/* ==================================================
              EMAIL / PHONE
          ================================================== */}

          <div>

            <label className="block text-sm font-semibold mb-1">
              Email or Phone Number
            </label>

            <input
              type="text"
              value={identifier}
              onChange={(e) =>
                setIdentifier(e.target.value)
              }
              placeholder="Enter your email or phone number"
              required
              className="w-full h-12 px-4 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600"
            />

          </div>

          {/* ==================================================
              PASSWORD
          ================================================== */}

          <div>

            <label className="block text-sm font-semibold mb-1">
              Password
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
                placeholder="Enter your password"
                required
                className="w-full h-12 px-4 pr-12 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600"
              />

              {/* Show / Hide Password */}

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
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

          </div>

          {/* ==================================================
              ROLE
          ================================================== */}

          <div>

            <label className="block text-sm font-semibold mb-1">
              Role
            </label>

            <div className="relative">

              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-green-700 pointer-events-none">
                person
              </span>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                required
                className="w-full h-12 pl-11 pr-10 rounded-lg bg-gray-100 outline-none focus:ring-2 focus:ring-green-600 appearance-none"
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

              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                expand_more
              </span>

            </div>

          </div>

          {/* ==================================================
              FORGOT PASSWORD
          ================================================== */}

          <div className="text-right">

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setForgotMessage("");
              }}
              className="text-sm text-green-700 font-semibold hover:underline"
            >
              Forgot Password?
            </button>

          </div>

          {/* ==================================================
              LOGIN BUTTON
          ================================================== */}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-green-700 hover:bg-green-800 text-white font-bold transition disabled:opacity-70"
          >

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>

        </form>

        {/* ==================================================
            FORGOT PASSWORD SECTION
        ================================================== */}

        {showForgotPassword && (
          <div className="mt-5 p-4 rounded-xl bg-[#f8f9ff] border border-[#e2e7ff]">

            <div className="flex items-center justify-between mb-3">

              <h2 className="font-bold text-lg">
                Reset Password
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotMessage("");
                }}
                className="text-gray-500 hover:text-red-600"
              >

                <span className="material-symbols-outlined">
                  close
                </span>

              </button>

            </div>

            <p className="text-sm text-gray-600 mb-4">
              Enter your registered email address and
              we'll send you a password reset link.
            </p>

            <form
              onSubmit={handleForgotPassword}
              className="space-y-3"
            >

              <input
                type="email"
                value={forgotEmail}
                onChange={(e) =>
                  setForgotEmail(e.target.value)
                }
                placeholder="Enter your registered email"
                required
                className="w-full h-11 px-4 rounded-lg bg-white border border-[#e2e7ff] outline-none focus:ring-2 focus:ring-green-600"
              />

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full h-11 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold transition disabled:opacity-70"
              >

                {forgotLoading
                  ? "Sending..."
                  : "Send Reset Link"}

              </button>

            </form>

            {forgotMessage && (
              <div className="mt-3 p-3 rounded-lg bg-green-100 text-green-700 text-sm">
                {forgotMessage}
              </div>
            )}

          </div>
        )}

        {/* ==================================================
            REGISTER
        ================================================== */}

        <div className="text-center mt-5 text-sm text-gray-600">

          Don't have an account?

          <button
            type="button"
            onClick={() =>
              navigate("/register")
            }
            className="ml-1 text-green-700 font-bold hover:underline"
          >
            Register
          </button>

        </div>

      </div>

    </div>
  );
};

export default Login;