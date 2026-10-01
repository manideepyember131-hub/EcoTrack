import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const WorkerProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // LOAD LOGGED-IN WORKER
  // ==================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const loggedInUser = JSON.parse(storedUser);

      if (
        !loggedInUser?.role ||
        loggedInUser.role.toLowerCase() !== "worker"
      ) {
        navigate("/");
        return;
      }

      if (!loggedInUser.id) {
        setError("Worker user ID was not found.");
        setLoading(false);
        return;
      }

      setUser(loggedInUser);

      fetchWorkerProfile(loggedInUser.id);
    } catch (err) {
      console.error("Error reading logged-in user:", err);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      navigate("/login");
    }
  }, [navigate]);

  // ==================================================
  // FETCH WORKER PROFILE
  // ==================================================

  const fetchWorkerProfile = async (userId) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/worker/profile/${workerId}`
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Expected JSON but received:",
          text
        );

        throw new Error(
          `Profile API returned ${response.status}. Check that your Express backend is running and the worker profile route is correct.`
        );
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load worker profile."
        );
      }

      setWorker(result.data);
    } catch (err) {
      console.error(
        "Error loading worker profile:",
        err
      );

      setError(
        err.message || "Unable to load worker profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>

          <p className="mt-3 text-on-surface-variant font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-surface rounded-2xl shadow-md p-6 max-w-md w-full text-center border border-outline-variant">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-red-600">
              error
            </span>
          </div>

          <h2 className="text-xl font-bold mt-4 text-on-surface">
            Unable to load profile
          </h2>

          <p className="text-on-surface-variant mt-2 text-sm">
            {error}
          </p>

          <button
            onClick={() => navigate("/worker-dashboard")}
            className="mt-5 px-5 py-3 rounded-xl bg-primary text-on-primary font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // LOCATION CHECK
  // ==================================================

  const hasLocation =
    worker?.latitude !== null &&
    worker?.latitude !== undefined &&
    worker?.longitude !== null &&
    worker?.longitude !== undefined;

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==================================================
  // PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="bg-surface border-b border-outline-variant">
        <div className="max-w-5xl mx-auto px-5 py-5 flex items-center gap-4">

          <button
            onClick={() => navigate("/worker-dashboard")}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant"
            aria-label="Back to worker dashboard"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </button>

          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              Worker Profile
            </h1>

            <p className="text-sm text-on-surface-variant">
              View your worker information
            </p>
          </div>

        </div>
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="max-w-5xl mx-auto px-5 py-6">

        {/* ==================================================
            PROFILE CARD
        ================================================== */}

        <section className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">

          {/* Profile Header */}

          <div className="p-6 bg-primary/5 flex flex-col sm:flex-row items-center sm:items-start gap-5">

            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-on-primary">
                engineering
              </span>
            </div>

            <div className="text-center sm:text-left">

              <h2 className="text-2xl font-bold text-on-surface">
                {worker?.name ||
                  user?.name ||
                  "Municipal Worker"}
              </h2>

              <p className="text-on-surface-variant mt-1">
                Municipal Waste Worker
              </p>

              {worker?.worker_code && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-outline-variant">

                  <span className="material-symbols-outlined text-sm">
                    badge
                  </span>

                  <span className="text-sm font-medium">
                    Worker Code: {worker.worker_code}
                  </span>

                </div>
              )}

            </div>

          </div>

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <div className="p-6">

            <h3 className="text-lg font-bold text-on-surface mb-5">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Full Name */}

              <div>
                <p className="text-sm text-on-surface-variant">
                  Full Name
                </p>

                <p className="mt-1 font-medium text-on-surface">
                  {worker?.name ||
                    user?.name ||
                    "Not available"}
                </p>
              </div>

              {/* Email */}

              <div>
                <p className="text-sm text-on-surface-variant">
                  Email
                </p>

                <p className="mt-1 font-medium text-on-surface">
                  {worker?.email ||
                    user?.email ||
                    "Not available"}
                </p>
              </div>

              {/* Phone */}

              <div>
                <p className="text-sm text-on-surface-variant">
                  Phone
                </p>

                <p className="mt-1 font-medium text-on-surface">
                  {worker?.phone ||
                    user?.phone ||
                    "Not available"}
                </p>
              </div>

              {/* Worker Code */}

              <div>
                <p className="text-sm text-on-surface-variant">
                  Worker Code
                </p>

                <p className="mt-1 font-medium text-on-surface">
                  {worker?.worker_code ||
                    "Not available"}
                </p>
              </div>

              {/* Assigned Zone */}

              <div>
                <p className="text-sm text-on-surface-variant">
                  Assigned Zone
                </p>

                <p className="mt-1 font-medium text-on-surface">
                  {worker?.zone || "Not assigned"}
                </p>
              </div>

              {/* Vehicle */}

              <div>
                <p className="text-sm text-on-surface-variant">
                  Vehicle
                </p>

                <p className="mt-1 font-medium text-on-surface">
                  {worker?.vehicle || "Not assigned"}
                </p>
              </div>

              {/* Worker Status */}

              <div>
                <p className="text-sm text-on-surface-variant">
                  Worker Status
                </p>

                <div className="mt-1">

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      worker?.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : worker?.status === "Busy"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {worker?.status || "Unknown"}
                  </span>

                </div>
              </div>

              {/* Role */}

              <div>
                <p className="text-sm text-on-surface-variant">
                  Account Role
                </p>

                <p className="mt-1 font-medium text-on-surface">
                  {worker?.role || "Worker"}
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            LOCATION CARD
        ================================================== */}

        <section className="mt-6 bg-surface rounded-2xl shadow-sm border border-outline-variant p-6">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">
                location_on
              </span>
            </div>

            <div>

              <h3 className="text-lg font-bold text-on-surface">
                Current Location
              </h3>

              <p className="text-sm text-on-surface-variant">
                Last reported worker location
              </p>

            </div>

          </div>

          {hasLocation ? (
            <div className="space-y-3">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Latitude */}

                <div className="bg-background rounded-xl p-4">

                  <p className="text-xs text-on-surface-variant">
                    Latitude
                  </p>

                  <p className="font-semibold mt-1">
                    {Number(worker.latitude).toFixed(6)}
                  </p>

                </div>

                {/* Longitude */}

                <div className="bg-background rounded-xl p-4">

                  <p className="text-xs text-on-surface-variant">
                    Longitude
                  </p>

                  <p className="font-semibold mt-1">
                    {Number(worker.longitude).toFixed(6)}
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${worker.latitude},${worker.longitude}`,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90"
              >

                <span className="material-symbols-outlined">
                  map
                </span>

                Open Location in Maps

              </button>

            </div>
          ) : (
            <div className="text-center py-6">

              <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                location_off
              </span>

              <p className="mt-2 text-on-surface-variant">
                Location has not been reported yet.
              </p>

            </div>
          )}

        </section>

        {/* ==================================================
            ACCOUNT INFORMATION
        ================================================== */}

        <section className="mt-6 bg-surface rounded-2xl shadow-sm border border-outline-variant p-6">

          <h3 className="text-lg font-bold text-on-surface mb-5">
            Account Information
          </h3>

          <div className="space-y-4">

            {/* Role */}

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-on-surface-variant">
                  Account Role
                </p>

                <p className="font-medium mt-1">
                  Worker
                </p>

              </div>

              <span className="material-symbols-outlined text-primary">
                verified_user
              </span>

            </div>

            <div className="border-t border-outline-variant" />

            {/* Status */}

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-on-surface-variant">
                  Account Status
                </p>

                <p className="font-medium mt-1">
                  Active
                </p>

              </div>

              <span className="material-symbols-outlined text-green-600">
                check_circle
              </span>

            </div>

          </div>

        </section>

        {/* ==================================================
            LOGOUT
        ================================================== */}

        <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50"
        >

          <span className="material-symbols-outlined">
            logout
          </span>

          Logout

        </button>

      </main>

      {/* ==================================================
          BOTTOM NAVIGATION
      ================================================== */}

      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/95 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.08)]">

        <div className="max-w-5xl mx-auto flex justify-around items-center h-20 px-2">

          {/* Home */}

          <button
            onClick={() => navigate("/")}
            className="flex flex-col items-center justify-center gap-1 flex-1 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">
              home
            </span>

            <span className="text-xs">
              Home
            </span>
          </button>

          {/* Worker Dashboard */}

          <button
            onClick={() =>
              navigate("/worker-dashboard")
            }
            className="flex flex-col items-center justify-center gap-1 flex-1 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">
              engineering
            </span>

            <span className="text-xs">
              Worker Dashboard
            </span>
          </button>

          {/* Tasks */}

          <button
            onClick={() =>
              navigate("/assigned-tasks")
            }
            className="flex flex-col items-center justify-center gap-1 flex-1 text-on-surface-variant"
          >
            <span className="material-symbols-outlined">
              assignment
            </span>

            <span className="text-xs">
              Tasks
            </span>
          </button>

          {/* Profile */}

          <button
            onClick={() =>
              navigate("/worker-profile")
            }
            className="flex flex-col items-center justify-center gap-1 flex-1 text-primary font-bold"
          >
            <span className="material-symbols-outlined">
              account_circle
            </span>

            <span className="text-xs">
              Profile
            </span>
          </button>

        </div>

      </nav>

    </div>
  );
};

export default WorkerProfile;