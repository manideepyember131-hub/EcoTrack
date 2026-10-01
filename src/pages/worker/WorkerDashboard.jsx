import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function WorkerDashboard() {
  const navigate = useNavigate();

  // ==================================================
  // UI STATE
  // ==================================================

  const [drawerOpen, setDrawerOpen] = useState(false);

  // ==================================================
  // WORKER STATE
  // ==================================================

  const [workerId, setWorkerId] = useState(null);
  const [workerStatus, setWorkerStatus] = useState("Available");
  const [workerUser, setWorkerUser] = useState(null);

  // ==================================================
  // DASHBOARD STATE
  // ==================================================

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // LOCATION STATE
  // ==================================================

  const [locationUpdating, setLocationUpdating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationError, setLocationError] = useState("");

  // ==================================================
  // TASK ACTION STATE
  // ==================================================

  const [startingTaskId, setStartingTaskId] = useState(null);

  // ==================================================
  // API
  // ==================================================

  const API_BASE_URL = "http://localhost:5000/api";

  // ==================================================
  // WORKER NAVIGATION
  // ==================================================

  const workerLinks = [
    ["worker-dashboard", "Worker Dashboard", "engineering"],
    ["assigned-tasks", "Assigned Tasks", "assignment_ind"],
    ["todays-tasks", "Today's Tasks", "today"],
    ["completed-tasks", "Completed Tasks", "task_alt"],
  ];

  // ==================================================
  // READ LOGGED-IN WORKER
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
        !loggedInUser ||
        loggedInUser.role?.toLowerCase() !== "worker"
      ) {
        navigate("/");
        return;
      }

      if (!loggedInUser.id) {
        throw new Error("Worker user ID is missing.");
      }

      /*
       * IMPORTANT:
       * loggedInUser.id must be users.id.
       *
       * worker_tasks.assigned_to is expected to contain
       * this same users.id.
       */
      setWorkerUser(loggedInUser);
      setWorkerId(loggedInUser.id);
    } catch (err) {
      console.error("Error reading worker account:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    }
  }, [navigate]);

  // ==================================================
  // NAVIGATION
  // ==================================================

  const handleNavigation = (label) => {
    setDrawerOpen(false);

    if (label === "Worker Dashboard") {
      navigate("/worker-dashboard");
      return;
    }

    if (label === "Assigned Tasks") {
      navigate("/assigned-tasks");
      return;
    }

    if (label === "Today's Tasks") {
      navigate("/todays-tasks");
      return;
    }

    if (label === "Completed Tasks") {
      navigate("/completed-tasks");
      return;
    }
  };

  // ==================================================
  // FETCH WORKER DASHBOARD
  // ==================================================

  const fetchWorkerDashboard = useCallback(async () => {
    if (!workerId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/worker/dashboard/${workerId}`
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
          `Dashboard API returned ${response.status} instead of JSON.`
        );
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to load worker dashboard."
        );
      }

      const dashboardData = result.data || {};


      setDashboard(dashboardData);

      if (dashboardData.profile?.status) {
        setWorkerStatus(
          dashboardData.profile.status
        );
      }
    } catch (err) {
      console.error(
        "Worker dashboard error:",
        err
      );

      setError(
        err.message ||
          "Failed to load worker dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  // ==================================================
  // INITIAL DASHBOARD LOAD
  // ==================================================

  useEffect(() => {
    if (workerId) {
      fetchWorkerDashboard();
    }
  }, [workerId, fetchWorkerDashboard]);

  // ==================================================
  // UPDATE WORKER WORKING LOCATION
  // ==================================================

  const updateWorkingLocation = () => {
    if (!workerId) {
      setLocationError(
        "Worker account information is unavailable."
      );
      return;
    }

    setLocationMessage("");
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationUpdating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const {
          latitude,
          longitude,
        } = position.coords;

        try {
          const response = await fetch(
            `${API_BASE_URL}/worker/location/${workerId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude,
                longitude,
              }),
            }
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
              `Location API returned ${response.status} instead of JSON.`
            );
          }

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.message ||
                "Failed to update working location."
            );
          }

          setDashboard((previous) => {
            if (!previous) {
              return previous;
            }

            return {
              ...previous,
              profile: {
                ...(previous.profile || {}),
                latitude,
                longitude,
              },
            };
          });

          setLocationMessage(
            "Working location updated successfully."
          );
        } catch (err) {
          console.error(
            "Worker location update error:",
            err
          );

          setLocationError(
            err.message ||
              "Failed to update working location."
          );
        } finally {
          setLocationUpdating(false);
        }
      },
      (geoError) => {
        let message =
          "Unable to get your current location.";

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            message =
              "Location permission was denied. Please allow location access in your browser.";
            break;

          case geoError.POSITION_UNAVAILABLE:
            message =
              "Your current location is unavailable. Please try again.";
            break;

          case geoError.TIMEOUT:
            message =
              "Location request timed out. Please try again.";
            break;

          default:
            message =
              "Unable to get your current location.";
        }

        setLocationError(message);
        setLocationUpdating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ==================================================
  // START TASK
  // ==================================================

  const startTask = async (taskId) => {
    if (!workerId || !taskId) {
      return;
    }

    try {
      setStartingTaskId(taskId);

      const response = await fetch(
        `${API_BASE_URL}/worker/tasks/${taskId}/${workerId}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
          `Start task API returned ${response.status} instead of JSON.`
        );
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to start task."
        );
      }

      /*
       * Reload the dashboard so:
       * - Today's Work gets the new status
       * - stats get the new counts
       * - Recent Activity gets updated
       */
      await fetchWorkerDashboard();
    } catch (err) {
      console.error(
        "Start task error:",
        err
      );

      alert(
        err.message ||
          "Failed to start task."
      );
    } finally {
      setStartingTaskId(null);
    }
  };

  // ==================================================
  // DATA FROM BACKEND
  // ==================================================

  const profile =
    dashboard?.profile || {};

  /*
   * IMPORTANT:
   * Use backend stats as the source of truth.
   * Do not calculate these independently from another
   * task API request.
   */
  const stats = {
    assignedTasks:
      dashboard?.stats?.assignedTasks ?? 0,

    pending:
      dashboard?.stats?.pending ?? 0,

    inProgress:
      dashboard?.stats?.inProgress ?? 0,

    completed:
      dashboard?.stats?.completed ?? 0,
  };

  /*
   * Dashboard endpoint already gives us the tasks
   * scheduled for today for THIS worker.
   */
  const todayTasks =
    Array.isArray(dashboard?.todayTasks)
      ? dashboard.todayTasks
      : [];

  /*
   * Dashboard endpoint already gives us this worker's
   * recent activity.
   */
  const recentActivity =
    Array.isArray(dashboard?.recentActivity)
      ? dashboard.recentActivity
      : [];

  // ==================================================
  // TASK ICON
  // ==================================================

  const getTaskIcon = (taskType) => {
    const type =
      taskType?.toLowerCase() || "";

    if (type.includes("recycl")) {
      return "recycling";
    }

    if (type.includes("inspect")) {
      return "fact_check";
    }

    if (type.includes("clean")) {
      return "cleaning_services";
    }

    if (type.includes("collection")) {
      return "delete";
    }

    return "delete";
  };

  // ==================================================
  // PRIORITY CLASSES
  // ==================================================

  const getPriorityClasses = (priority) => {
    if (priority?.toLowerCase() === "high") {
      return {
        icon: "bg-red-100 text-red-600",
        badge: "bg-red-100 text-red-700",
      };
    }

    if (priority?.toLowerCase() === "medium") {
      return {
        icon: "bg-orange-100 text-orange-600",
        badge: "bg-orange-100 text-orange-700",
      };
    }

    return {
      icon: "bg-primary-fixed text-primary",
      badge: "bg-primary-fixed text-primary",
    };
  };

  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (time) => {
    if (!time) {
      return "--:--";
    }

    const timeString = String(time);
    const parts = timeString.split(":");

    if (parts.length < 2) {
      return timeString;
    }

    const hours = parts[0];
    const minutes = parts[1];

    let hour = Number(hours);

    if (Number.isNaN(hour)) {
      return timeString;
    }

    const period =
      hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${period}`;
  };

  // ==================================================
  // FORMAT ACTIVITY TIME
  // ==================================================

  const formatActivityTime = (date) => {
    if (!date) {
      return "Recently";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently";
    }

    return parsedDate.toLocaleString();
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8ff] text-[#131b2e]">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>

          <p className="mt-3 font-semibold">
            Loading worker dashboard...
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
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#faf8ff] text-[#131b2e]">
        <div className="rounded-2xl shadow-sm p-6 max-w-md w-full text-center bg-white">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">
              error
            </span>
          </div>

          <h2 className="font-bold text-lg mt-4">
            Unable to load dashboard
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {error}
          </p>

          <button
            onClick={fetchWorkerDashboard}
            className="mt-5 px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm"
          >
            Try Again
          </button>

          <button
            onClick={() =>
              navigate("/worker-profile")
            }
            className="mt-3 px-5 py-2.5 rounded-lg border border-outline-variant font-bold text-sm"
          >
            Open Profile
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN UI
  // ==================================================

  return (
    <div>
      <div className="min-h-screen font-body-md pb-24 bg-[#faf8ff] text-[#131b2e]">

        {/* HEADER */}

        <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl shadow-sm bg-white/90 text-[#131b2e]">
          <div className="h-16 px-4 md:px-8 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined">
                  engineering
                </span>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold truncate">
                    EcoTrack
                  </span>

                  <span className="hidden sm:inline-block bg-secondary-container text-on-secondary-container text-xs px-2 py-1 rounded-full uppercase tracking-wider">
                    Civic Tech
                  </span>
                </div>

                <span className="text-xs text-on-surface-variant">
                  Municipal Worker
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">

              <button
                onClick={() =>
                  alert(
                    "You have 3 new task updates."
                  )
                }
                className="relative w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined">
                  notifications
                </span>

                <span className="absolute top-2 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs rounded-full font-bold">
                  3
                </span>
              </button>

              <button
                onClick={() =>
                  navigate("/worker-profile")
                }
                className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-surface-container-high"
                aria-label="Worker Profile"
              >
                <span className="material-symbols-outlined">
                  account_circle
                </span>
              </button>

              <button
                onClick={() =>
                  setDrawerOpen(true)
                }
                className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
                aria-label="Open navigation menu"
              >
                <span className="material-symbols-outlined">
                  more_vert
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN */}

        <main className="pt-20">
          <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6">

            {/* WELCOME */}

            <section>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">
                        engineering
                      </span>
                    </span>

                    <span className="text-xs font-bold uppercase tracking-wide text-primary">
                      Worker Portal
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-[#131b2e]">
                    Welcome back,{" "}
                    {profile.name ||
                      workerUser?.name ||
                      "Worker"}
                  </h1>

                  <p className="text-sm mt-1 text-[#3d4a42]">
                    Municipal Operations •{" "}
                    {profile.zone || "Zone"}
                  </p>
                </div>

                <div
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${
                    workerStatus === "Available"
                      ? "bg-primary-fixed text-on-primary-fixed"
                      : workerStatus === "Busy"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-secondary-container text-on-secondary-container"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      workerStatus === "Available"
                        ? "bg-green-500"
                        : workerStatus === "Busy"
                        ? "bg-orange-500"
                        : "bg-gray-500"
                    }`}
                  />

                  {workerStatus}
                </div>
              </div>
            </section>

            {/* QUICK STATS */}

            <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                <div className="p-4 rounded-xl shadow-sm bg-white">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    assignment
                  </span>

                  <p className="text-2xl font-bold mt-2">
                    {stats.assignedTasks}
                  </p>

                  <p className="text-xs text-on-surface-variant">
                    Assigned Tasks
                  </p>
                </div>

                <div className="p-4 rounded-xl shadow-sm bg-white">
                  <span className="material-symbols-outlined text-secondary text-3xl">
                    pending_actions
                  </span>

                  <p className="text-2xl font-bold mt-2">
                    {stats.pending}
                  </p>

                  <p className="text-xs text-on-surface-variant">
                    Pending
                  </p>
                </div>

                <div className="p-4 rounded-xl shadow-sm bg-white">
                  <span className="material-symbols-outlined text-orange-500 text-3xl">
                    autorenew
                  </span>

                  <p className="text-2xl font-bold mt-2">
                    {stats.inProgress}
                  </p>

                  <p className="text-xs text-on-surface-variant">
                    In Progress
                  </p>
                </div>

                <div className="p-4 rounded-xl shadow-sm bg-white">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    task_alt
                  </span>

                  <p className="text-2xl font-bold mt-2">
                    {stats.completed}
                  </p>

                  <p className="text-xs text-on-surface-variant">
                    Completed
                  </p>
                </div>
              </div>
            </section>

            {/* TODAY'S WORK */}

            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#131b2e]">
                    Today's Work
                  </h2>

                  <p className="text-xs text-on-surface-variant mt-1">
                    Your priority municipal tasks
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate("/todays-tasks")
                  }
                  className="text-xs text-primary font-bold"
                >
                  View All
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="p-6 rounded-xl shadow-sm text-center bg-white">
                  <span className="material-symbols-outlined text-4xl text-primary">
                    event_available
                  </span>

                  <p className="font-bold mt-2">
                    No tasks scheduled for today
                  </p>

                  <p className="text-xs text-on-surface-variant mt-1">
                    You have no municipal tasks scheduled today.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.slice(0, 2).map((task) => {
                    const priority =
                      task.priority;

                    const taskType =
                      task.taskType;

                    const scheduledTime =
                      task.scheduledTime;

                    const taskStatus =
                      task.status;

                    const taskTitle =
                      task.title;

                    const taskLocation =
                      task.location;

                    const priorityClasses =
                      getPriorityClasses(priority);

                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl shadow-sm bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${priorityClasses.icon}`}
                            >
                              <span className="material-symbols-outlined">
                                {getTaskIcon(taskType)}
                              </span>
                            </div>

                            <div>
                              <span
                                className={`text-xs px-2 py-1 rounded-md font-bold ${priorityClasses.badge}`}
                              >
                                {priority?.toUpperCase() ||
                                  "NORMAL"}{" "}
                                PRIORITY
                              </span>

                              <h3 className="font-bold mt-2">
                                {taskTitle ||
                                  "Waste Collection Task"}
                              </h3>

                              <p className="text-xs text-on-surface-variant mt-1">
                                {taskLocation ||
                                  "Location not available"}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs font-semibold text-orange-500 whitespace-nowrap">
                            {formatTime(scheduledTime)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-4">

                          <button
                            onClick={() =>
                              navigate(
                                `/task-details/${task.id}`
                              )
                            }
                            className="flex-1 h-10 rounded-lg bg-[#006948] text-white font-bold text-sm flex items-center justify-center hover:opacity-90 transition"
                          >
                            View Task
                          </button>

                          <button
                            onClick={() =>
                              startTask(task.id)
                            }
                            disabled={
                              taskStatus === "Completed" ||
                              taskStatus === "In Progress" ||
                              startingTaskId === task.id
                            }
                            className={`flex-1 h-10 rounded-lg text-sm font-bold ${
                              taskStatus === "Completed"
                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                : taskStatus === "In Progress"
                                ? "bg-orange-100 text-orange-700 cursor-not-allowed"
                                : startingTaskId === task.id
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-surface-container-high text-on-surface"
                            }`}
                          >
                            {startingTaskId === task.id
                              ? "Starting..."
                              : taskStatus === "Completed"
                              ? "Completed"
                              : taskStatus === "In Progress"
                              ? "In Progress"
                              : "Start Task"}
                          </button>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* QUICK ACTIONS */}

            <section>
              <h2 className="text-lg font-bold mb-3 text-[#131b2e]">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                <button
                  onClick={() =>
                    navigate("/assigned-tasks")
                  }
                  className="text-left p-4 rounded-xl shadow-sm bg-white"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">
                      assignment_ind
                    </span>
                  </div>

                  <h3 className="font-bold">
                    Assigned Tasks
                  </h3>

                  <p className="text-xs mt-1 text-on-surface-variant">
                    View all assigned work
                  </p>
                </button>

                <button
                  onClick={() =>
                    navigate("/todays-tasks")
                  }
                  className="text-left p-4 rounded-xl shadow-sm bg-white"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary-container text-secondary flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">
                      today
                    </span>
                  </div>

                  <h3 className="font-bold">
                    Today's Tasks
                  </h3>

                  <p className="text-xs mt-1 text-on-surface-variant">
                    See today's schedule
                  </p>
                </button>

                <button
                  onClick={() =>
                    navigate("/completed-tasks")
                  }
                  className="text-left p-4 rounded-xl shadow-sm bg-white"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined">
                      task_alt
                    </span>
                  </div>

                  <h3 className="font-bold">
                    Completed Tasks
                  </h3>

                  <p className="text-xs mt-1 text-on-surface-variant">
                    Review completed work
                  </p>
                </button>

              </div>
            </section>

            {/* WORKER INFORMATION */}

            <section>
              <h2 className="text-lg font-bold mb-3 text-[#131b2e]">
                Worker Information
              </h2>

              <div className="p-4 rounded-xl shadow-sm bg-white">

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">
                      engineering
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold">
                      {profile.name ||
                        workerUser?.name ||
                        "Municipal Worker"}
                    </h3>

                    <p className="text-xs text-on-surface-variant">
                      Worker #
                      {profile.workerCode ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">

                  <div className="p-3 rounded-lg bg-surface-container-low">
                    <p className="text-xs text-on-surface-variant">
                      Assigned Zone
                    </p>

                    <p className="font-bold mt-1">
                      {profile.zone || "N/A"}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low">
                    <p className="text-xs text-on-surface-variant">
                      Vehicle
                    </p>

                    <p className="font-bold mt-1">
                      {profile.vehicle || "N/A"}
                    </p>
                  </div>

                </div>

                {/* WORKING LOCATION */}

                <div className="mt-3 p-4 rounded-lg bg-surface-container-low">
                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">
                          location_on
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-on-surface-variant">
                          Working Location
                        </p>

                        {profile.latitude !== null &&
                        profile.latitude !== undefined &&
                        profile.longitude !== null &&
                        profile.longitude !== undefined ? (
                          <>
                            <p className="font-bold mt-1">
                              Location saved
                            </p>

                            <p className="text-xs text-on-surface-variant mt-1">
                              Lat:{" "}
                              {Number(
                                profile.latitude
                              ).toFixed(6)}
                              <br />
                              Lng:{" "}
                              {Number(
                                profile.longitude
                              ).toFixed(6)}
                            </p>
                          </>
                        ) : (
                          <p className="font-bold mt-1">
                            Location not set
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-primary whitespace-nowrap">
                      {profile.latitude !== null &&
                      profile.latitude !== undefined &&
                      profile.longitude !== null &&
                      profile.longitude !== undefined
                        ? "Saved"
                        : "Not Set"}
                    </span>

                  </div>

                  <button
                    onClick={updateWorkingLocation}
                    disabled={locationUpdating}
                    className={`w-full mt-4 h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-bold ${
                      locationUpdating
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-primary text-on-primary hover:opacity-90"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined ${
                        locationUpdating
                          ? "animate-spin"
                          : ""
                      }`}
                    >
                      {locationUpdating
                        ? "progress_activity"
                        : "my_location"}
                    </span>

                    {locationUpdating
                      ? "Updating Location..."
                      : "Update Working Location"}
                  </button>

                  {locationMessage && (
                    <div className="mt-3 p-3 rounded-lg bg-green-100 text-green-700 text-xs font-semibold flex items-start gap-2">
                      <span className="material-symbols-outlined text-base">
                        check_circle
                      </span>

                      <span>
                        {locationMessage}
                      </span>
                    </div>
                  )}

                  {locationError && (
                    <div className="mt-3 p-3 rounded-lg bg-red-100 text-red-700 text-xs font-semibold flex items-start gap-2">
                      <span className="material-symbols-outlined text-base">
                        error
                      </span>

                      <span>
                        {locationError}
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-on-surface-variant mt-3">
                    Tap the button when you want to update your current
                    working location. Location tracking is not continuous.
                  </p>
                </div>
              </div>
            </section>

            {/* RECENT ACTIVITY */}

            <section className="pb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-[#131b2e]">
                  Recent Activity
                </h2>

                <span className="text-xs text-primary font-bold">
                  Latest
                </span>
              </div>

              <div className="rounded-xl shadow-sm overflow-hidden bg-white">
                {recentActivity.length === 0 ? (
                  <div className="p-6 text-center">
                    <span className="material-symbols-outlined text-3xl text-gray-400">
                      history
                    </span>

                    <p className="text-sm mt-2 text-on-surface-variant">
                      No recent activity
                    </p>
                  </div>
                ) : (
                  recentActivity
                    .slice(0, 5)
                    .map((activity, index) => {
                      const activityStatus =
                        activity.status;

                      const activityTaskCode =
                        activity.taskCode;

                      const activityTitle =
                        activity.title;

                      const activityUpdatedAt =
                        activity.updatedAt;

                      return (
                        <div
                          key={activity.id}
                          className={`p-4 flex gap-3 ${
                            index !==
                            Math.min(
                              recentActivity.length,
                              5
                            ) - 1
                              ? "border-b border-surface-container-high"
                              : ""
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              activityStatus === "Completed"
                                ? "bg-primary-fixed text-primary"
                                : "bg-secondary-container text-secondary"
                            }`}
                          >
                            <span className="material-symbols-outlined">
                              {activityStatus === "Completed"
                                ? "task_alt"
                                : "assignment"}
                            </span>
                          </div>

                          <div>
                            <p className="font-bold text-sm">
                              {activityStatus === "Completed"
                                ? `Task #${activityTaskCode} completed`
                                : `Task #${activityTaskCode} updated`}
                            </p>

                            <p className="text-xs text-on-surface-variant mt-1">
                              {activityTitle}
                            </p>

                            <span className="text-xs text-outline mt-1 block">
                              {formatActivityTime(
                                activityUpdatedAt
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </section>

          </div>
        </main>

        {/* SIDE DRAWER */}

        {drawerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
              onClick={() =>
                setDrawerOpen(false)
              }
            />

            <aside className="fixed top-0 right-0 w-[85vw] max-w-sm h-full z-[70] shadow-2xl overflow-y-auto bg-white text-[#131b2e]">
              <div className="h-16 px-4 flex items-center justify-between sticky top-0 bg-[#f2f3ff]">

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">
                      engineering
                    </span>
                  </div>

                  <span className="font-bold text-primary">
                    EcoTrack
                  </span>
                </div>

                <button
                  onClick={() =>
                    setDrawerOpen(false)
                  }
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined">
                    close
                  </span>
                </button>
              </div>

              <div className="p-4">

                <p className="text-xs uppercase tracking-wider text-primary font-bold px-3 mb-2">
                  Municipal Worker
                </p>

                <nav className="space-y-1">
                  {workerLinks.map(
                    ([id, label, icon]) => (
                      <button
                        key={id}
                        onClick={() =>
                          handleNavigation(label)
                        }
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-[#131b2e] hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-primary">
                          {icon}
                        </span>

                        <span className="text-sm">
                          {label}
                        </span>
                      </button>
                    )
                  )}

                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate("/worker-profile");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-[#131b2e] hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-primary">
                      account_circle
                    </span>

                    <span className="text-sm">
                      Worker Profile
                    </span>
                  </button>
                </nav>

              </div>
            </aside>
          </>
        )}

        {/* BOTTOM NAVIGATION */}

        <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/95 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.08)]">
          <div className="max-w-5xl mx-auto flex justify-around items-center h-20 px-2">

            <button
              onClick={() =>
                navigate("/")
              }
              className="flex flex-col items-center justify-center gap-1 flex-1 text-on-surface-variant"
            >
              <span className="material-symbols-outlined">
                home
              </span>

              <span className="text-xs">
                Home
              </span>
            </button>

            <button
              onClick={() =>
                navigate("/worker-dashboard")
              }
              className="flex flex-col items-center justify-center gap-1 flex-1 text-primary font-bold"
            >
              <span className="material-symbols-outlined">
                engineering
              </span>

              <span className="text-xs">
                Worker Dashboard
              </span>
            </button>

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

            <button
              onClick={() =>
                navigate("/worker-profile")
              }
              className="flex flex-col items-center justify-center gap-1 flex-1 text-on-surface-variant"
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
    </div>
  );
}