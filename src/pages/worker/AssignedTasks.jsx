import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AssignedTasks = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [workerId, setWorkerId] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      console.log(
        "Assigned Tasks - Logged-in worker ID:",
        loggedInUser.id
      );

      setWorkerId(loggedInUser.id);
    } catch (err) {
      console.error(
        "Error reading worker account:",
        err
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    }
  }, [navigate]);

  // ==================================================
  // FETCH ASSIGNED TASKS
  // ==================================================

  useEffect(() => {
    if (!workerId) {
      return;
    }

    const fetchAssignedTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/worker/tasks/${workerId}`
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
            `Assigned Tasks API returned ${response.status} instead of JSON.`
          );
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Failed to fetch assigned tasks."
          );
        }

        console.log(
          "Assigned Tasks API result:",
          result
        );

        console.log(
          "Assigned Tasks count:",
          result.data?.length || 0
        );

        setAllTasks(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      } catch (err) {
        console.error(
          "Error fetching assigned tasks:",
          err
        );

        setError(
          err.message ||
            "Unable to load assigned tasks."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTasks();
  }, [workerId]);

  // ==================================================
  // PAGE DATA
  // ==================================================

  let pageTitle = "Assigned Tasks";
  let pageDescription =
    "View and manage your assigned municipal tasks";

  let tasks = allTasks;

  // ==================================================
  // TODAY'S TASKS
  // ==================================================

  if (location.pathname === "/todays-tasks") {
    pageTitle = "Today's Tasks";
    pageDescription = "Tasks scheduled for today";

    // Use local browser date instead of UTC date.
    const today = new Date();

    const year = today.getFullYear();
    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      today.getDate()
    ).padStart(2, "0");

    const localToday =
      `${year}-${month}-${day}`;

    tasks = allTasks.filter(
      (task) =>
        task.scheduledDate === localToday
    );
  }

  // ==================================================
  // COMPLETED TASKS
  // ==================================================

  if (location.pathname === "/completed-tasks") {
    pageTitle = "Completed Tasks";
    pageDescription =
      "View your previously completed tasks";

    tasks = allTasks.filter(
      (task) => task.status === "Completed"
    );
  }

  // ==================================================
  // STATUS STYLE
  // ==================================================

  const getStatusStyle = (status) => {
    if (status === "Completed") {
      return "bg-[#dff7e9] text-[#006948]";
    }

    if (status === "In Progress") {
      return "bg-[#fff4d6] text-[#8a6200]";
    }

    return "bg-[#eafdf5] text-[#006948]";
  };

  // ==================================================
  // PRIORITY STYLE
  // ==================================================

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-[#ffe5e5] text-[#b42318]";
    }

    if (priority === "Medium") {
      return "bg-[#fff4d6] text-[#8a6200]";
    }

    return "bg-[#eafdf5] text-[#006948]";
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(
      `${date}T00:00:00`
    );

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    const [hours, minutes] =
      String(time).split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  // ==================================================
  // VIEW TASK
  // ==================================================

  const handleViewTask = (task) => {
    navigate(
      `/task-details/${task.id}`
    );
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-[#f6fbf8] p-6">

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#16352b]">
          {pageTitle}
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          {pageDescription}
        </p>
      </div>

      {/* Loading */}

      {loading && (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">
            Loading tasks...
          </p>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">

          <p className="text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 rounded-lg bg-[#006948] px-4 py-2 text-sm font-medium text-white"
          >
            Try Again
          </button>

        </div>
      )}

      {/* Empty */}

      {!loading &&
        !error &&
        tasks.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">

            <p className="text-gray-600">
              No tasks found.
            </p>

          </div>
        )}

      {/* Task List */}

      {!loading &&
        !error &&
        tasks.length > 0 && (
          <div className="space-y-4">

            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl bg-white p-5 shadow-sm"
              >

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  {/* Task Information */}

                  <div className="flex-1">

                    <div className="mb-2 flex flex-wrap items-center gap-2">

                      <span className="text-xs font-medium text-gray-500">
                        {task.taskCode}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>

                    </div>

                    <h2 className="text-lg font-semibold text-[#16352b]">
                      {task.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      {task.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">

                      <span>
                        📍 {task.location}
                      </span>

                      <span>
                        📅{" "}
                        {formatDate(
                          task.scheduledDate
                        )}
                      </span>

                      <span>
                        🕐{" "}
                        {formatTime(
                          task.scheduledTime
                        )}
                      </span>

                      <span>
                        🔧 {task.taskType}
                      </span>

                    </div>

                  </div>

                  {/* Action */}

                  <div>

                    <button
                      onClick={() =>
                        handleViewTask(task)
                      }
                      className="rounded-lg bg-[#006948] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#00563b]"
                    >
                      View Task
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

    </div>
  );
};

export default AssignedTasks;