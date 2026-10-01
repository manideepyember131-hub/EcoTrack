import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function TaskDetails() {
  const navigate = useNavigate();
  const params = useParams();

  const taskId = params.taskId || params.id;

  // Keep this as 3 for the current database test
 const loggedInUser = JSON.parse(
  localStorage.getItem("user") || "null"
);

const workerId = loggedInUser?.id;

  const [task, setTask] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/worker/tasks/${taskId}/${workerId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch task details");
        }

        const result = await response.json();

        console.log("========== TASK DETAILS DEBUG ==========");
        console.log("Task ID:", taskId);
        console.log("Worker ID:", workerId);
        console.log("Full API result:", result);
        console.log("Task data:", result.data);
        console.log("========================================");

        if (!result.success) {
          throw new Error(
            result.message || "Failed to fetch task details"
          );
        }

        setTask(result.data);
        setStatus(result.data.status);
      } catch (err) {
        console.error("Error fetching task details:", err);
        setError(err.message || "Unable to load task details.");
      } finally {
        setLoading(false);
      }
    };

    if (!taskId) {
      setError("Task ID is missing from the URL.");
      setLoading(false);
      return;
    }

    fetchTaskDetails();
  }, [taskId]);

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  const handleStartTask = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/worker/tasks/${taskId}/${workerId}/start`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      console.log("Start task response:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to start task"
        );
      }

      setStatus("In Progress");

      setTask((previousTask) => ({
        ...previousTask,
        status: "In Progress",
      }));

      showMessage("Task started successfully");
    } catch (err) {
      console.error("Start task error:", err);
      setError(err.message || "Failed to start task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/worker/tasks/${taskId}/${workerId}/complete`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      console.log("Complete task response:", result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to complete task"
        );
      }

      setStatus("Completed");

      setTask((previousTask) => ({
        ...previousTask,
        status: "Completed",
      }));

      showMessage("Task marked as completed");
    } catch (err) {
      console.error("Complete task error:", err);
      setError(err.message || "Failed to complete task");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const [hours, minutes] = time.split(":");

    const parsedTime = new Date();

    parsedTime.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return parsedTime.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusStyle = () => {
    if (status === "Completed") {
      return "bg-[#85f8c4] text-[#006948]";
    }

    if (status === "In Progress") {
      return "bg-[#99efe5] text-[#006a63]";
    }

    return "bg-[#ffdad6] text-[#93000a]";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-[#006948]">
            progress_activity
          </span>

          <p className="mt-3 text-[#6d7a72]">
            Loading task details...
          </p>
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-[#eaedff] p-6 max-w-md w-full text-center">

          <span className="material-symbols-outlined text-5xl text-[#93000a]">
            error
          </span>

          <h2 className="text-xl font-bold mt-3">
            Unable to Load Task
          </h2>

          <p className="text-sm text-[#6d7a72] mt-2">
            {error}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 px-5 py-3 rounded-xl bg-[#006948] text-white font-semibold"
          >
            Go Back
          </button>

        </div>
      </div>
    );
  }

  const hasCoordinates =
    task?.latitude !== null &&
    task?.latitude !== undefined &&
    task?.longitude !== null &&
    task?.longitude !== undefined &&
    Number.isFinite(Number(task.latitude)) &&
    Number.isFinite(Number(task.longitude));

  const latitude = hasCoordinates
    ? Number(task.latitude)
    : null;

  const longitude = hasCoordinates
    ? Number(task.longitude)
    : null;

  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${latitude},${longitude}`
      )}`
    : "#";

  const googleMapsEmbedUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        `${latitude},${longitude}`
      )}&z=16&output=embed`
    : "";

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-24">

      {/* HEADER */}
      <header className="bg-white border-b border-[#eaedff] sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#131b2e] font-semibold"
          >
            <span className="material-symbols-outlined">
              arrow_back
            </span>

            <span>Task Details</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006948]">
              local_shipping
            </span>

            <span className="font-bold text-[#006948]">
              EcoTrack
            </span>
          </div>

        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-5">

        {/* ERROR */}
        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] rounded-xl px-4 py-3 flex items-start gap-3">

            <span className="material-symbols-outlined">
              error
            </span>

            <p className="text-sm font-medium">
              {error}
            </p>

          </div>
        )}

        {/* SUCCESS */}
        {message && (
          <div className="bg-[#85f8c4] text-[#006948] rounded-xl px-4 py-3 flex items-center gap-3">

            <span className="material-symbols-outlined">
              check_circle
            </span>

            <p className="text-sm font-semibold">
              {message}
            </p>

          </div>
        )}

        {/* TASK HEADER */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#eaedff] p-5">

          <div className="flex items-start justify-between gap-4">

            <div>

              <p className="text-xs text-[#6d7a72] font-medium">
                Task Code
              </p>

              <p className="text-sm font-bold mt-1">
                {task.taskCode || "-"}
              </p>

              <h1 className="text-2xl font-bold mt-4">
                {task.title || "Waste Collection Task"}
              </h1>

              {task.taskType && (
                <p className="text-sm text-[#6d7a72] mt-1">
                  Waste Type: {task.taskType}
                </p>
              )}

            </div>

            <span
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusStyle()}`}
            >
              {status || "Pending"}
            </span>

          </div>

        </section>

        {/* LOCATION */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#eaedff] p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-xl bg-[#85f8c4] text-[#006948] flex items-center justify-center">
              <span className="material-symbols-outlined">
                location_on
              </span>
            </div>

            <div>

              <h3 className="font-bold">
                Collection Location
              </h3>

              <p className="text-xs text-[#6d7a72]">
                Citizen reported waste location
              </p>

            </div>

          </div>

          {hasCoordinates ? (
            <div className="space-y-3">

              <div className="rounded-xl overflow-hidden border border-[#dfe5e1] bg-[#f2f3ff]">

                <iframe
                  title="Waste collection location"
                  src={googleMapsEmbedUrl}
                  className="w-full h-64 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

              </div>

              <div className="p-4 rounded-xl bg-[#f2f3ff]">

                <div className="flex items-center gap-2 mb-3">

                  <span className="material-symbols-outlined text-[#006948]">
                    gps_fixed
                  </span>

                  <p className="font-semibold text-sm">
                    Reported GPS Location
                  </p>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <div>

                    <p className="text-xs text-[#6d7a72]">
                      Latitude
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {latitude.toFixed(7)}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-[#6d7a72]">
                      Longitude
                    </p>

                    <p className="text-sm font-semibold mt-1">
                      {longitude.toFixed(7)}
                    </p>

                  </div>

                </div>

              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-[#006948] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
              >

                <span className="material-symbols-outlined">
                  map
                </span>

                Open in Google Maps

              </a>

            </div>
          ) : (
            <div className="rounded-xl bg-[#f2f3ff] p-6 text-center">

              <span className="material-symbols-outlined text-4xl text-[#6d7a72]">
                location_off
              </span>

              <p className="font-semibold mt-2">
                GPS location unavailable
              </p>

              <p className="text-sm text-[#6d7a72] mt-1">
                No coordinates were saved for this waste report.
              </p>

            </div>
          )}

          <div className="mt-4">

            <p className="text-sm font-semibold">
              Address
            </p>

            <p className="text-sm text-[#6d7a72] mt-1">
              {task.location || "Location not provided"}
            </p>

          </div>

        </section>

        {/* TASK INFORMATION */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#eaedff] p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-xl bg-[#99efe5] text-[#006a63] flex items-center justify-center">
              <span className="material-symbols-outlined">
                assignment
              </span>
            </div>

            <div>

              <h3 className="font-bold">
                Task Information
              </h3>

              <p className="text-xs text-[#6d7a72]">
                Details about this collection task
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="p-4 rounded-xl bg-[#f8f9ff]">

              <p className="text-xs text-[#6d7a72]">
                Task Type
              </p>

              <p className="font-semibold mt-1">
                {task.taskType || "-"}
              </p>

            </div>

            <div className="p-4 rounded-xl bg-[#f8f9ff]">

              <p className="text-xs text-[#6d7a72]">
                Priority
              </p>

              <p className="font-semibold mt-1">
                {task.priority || "-"}
              </p>

            </div>

            <div className="p-4 rounded-xl bg-[#f8f9ff]">

              <p className="text-xs text-[#6d7a72]">
                Scheduled Date
              </p>

              <p className="font-semibold mt-1">
                {formatDate(task.scheduledDate)}
              </p>

            </div>

            <div className="p-4 rounded-xl bg-[#f8f9ff]">

              <p className="text-xs text-[#6d7a72]">
                Scheduled Time
              </p>

              <p className="font-semibold mt-1">
                {formatTime(task.scheduledTime)}
              </p>

            </div>

          </div>

        </section>

        {/* DESCRIPTION */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#eaedff] p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-xl bg-[#d9e7ff] text-[#345b9b] flex items-center justify-center">
              <span className="material-symbols-outlined">
                description
              </span>
            </div>

            <div>

              <h3 className="font-bold">
                Description
              </h3>

              <p className="text-xs text-[#6d7a72]">
                Citizen complaint details
              </p>

            </div>

          </div>

          <div className="rounded-xl bg-[#f8f9ff] p-4">

            <p className="text-sm text-[#424b5a] leading-6">
              {task.description || "No description provided."}
            </p>

          </div>

        </section>

        {/* TASK METADATA */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#eaedff] p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-xl bg-[#ffe5b5] text-[#855b00] flex items-center justify-center">
              <span className="material-symbols-outlined">
                info
              </span>
            </div>

            <div>

              <h3 className="font-bold">
                Task Metadata
              </h3>

              <p className="text-xs text-[#6d7a72]">
                Task activity information
              </p>

            </div>

          </div>

          <div className="space-y-3">

            <div className="flex justify-between items-center gap-4">

              <span className="text-sm text-[#6d7a72]">
                Task ID
              </span>

              <span className="text-sm font-semibold">
                #{task.id}
              </span>

            </div>

            <div className="h-px bg-[#eaedff]" />

            <div className="flex justify-between items-center gap-4">

              <span className="text-sm text-[#6d7a72]">
                Waste Report ID
              </span>

              <span className="text-sm font-semibold">
                #{task.wasteReportId || "-"}
              </span>

            </div>

            <div className="h-px bg-[#eaedff]" />

            <div className="flex justify-between items-center gap-4">

              <span className="text-sm text-[#6d7a72]">
                Started At
              </span>

              <span className="text-sm font-semibold text-right">
                {task.startedAt
                  ? new Date(task.startedAt).toLocaleString("en-IN")
                  : "-"}
              </span>

            </div>

            <div className="h-px bg-[#eaedff]" />

            <div className="flex justify-between items-center gap-4">

              <span className="text-sm text-[#6d7a72]">
                Completed At
              </span>

              <span className="text-sm font-semibold text-right">
                {task.completedAt
                  ? new Date(task.completedAt).toLocaleString("en-IN")
                  : "-"}
              </span>

            </div>

          </div>

        </section>

        {/* ACTIONS */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#eaedff] p-5">

          <h3 className="font-bold mb-4">
            Task Actions
          </h3>

          {status === "Pending" && (
            <button
              onClick={handleStartTask}
              disabled={actionLoading}
              className="w-full h-12 rounded-xl bg-[#006948] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {actionLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>

                  Starting Task...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">
                    play_arrow
                  </span>

                  Start Task
                </>
              )}

            </button>
          )}

          {status === "In Progress" && (
            <button
              onClick={handleCompleteTask}
              disabled={actionLoading}
              className="w-full h-12 rounded-xl bg-[#006948] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {actionLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>

                  Completing Task...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">
                    check_circle
                  </span>

                  Complete Task
                </>
              )}

            </button>
          )}

          {status === "Completed" && (
            <div className="w-full rounded-xl bg-[#85f8c4] text-[#006948] px-4 py-4 flex items-center justify-center gap-2 font-semibold">

              <span className="material-symbols-outlined">
                check_circle
              </span>

              Task Completed

            </div>
          )}

        </section>

      </main>
    </div>
  );
}