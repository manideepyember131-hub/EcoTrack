import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Temporary user ID until authentication is connected
const userId = 1;

const formatDate = (dateValue) => {
  if (!dateValue) return "Date not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeValue) => {
  if (!timeValue) return "Time not available";

  const parts = timeValue.split(":");

  if (parts.length < 2) {
    return timeValue;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return timeValue;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatTimeRange = (startTime, endTime) => {
  if (!startTime && !endTime) {
    return "Time not available";
  }

  if (!endTime) {
    return formatTime(startTime);
  }

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export default function CommunityActivities({
  darkMode = false,
}) {
  const [activities, setActivities] = useState([]);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [joinedActivities, setJoinedActivities] =
    useState([]);

  const [selectedActivity, setSelectedActivity] =
    useState(null);

  const [toast, setToast] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [joiningActivityId, setJoiningActivityId] =
    useState(null);

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /*
   * Fetch all community activities
   */
  const fetchActivities = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/community-activities`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch community activities"
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch community activities"
        );
      }

      setActivities(data.activities || []);
    } catch (err) {
      console.error(
        "Error fetching community activities:",
        err
      );

      setError(
        "Unable to load community activities. Please try again."
      );
    }
  };

  /*
   * Fetch activities joined by current user
   */
  const fetchJoinedActivities = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/community-activities/joined/${userId}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch joined activities"
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch joined activities"
        );
      }

      /*
       * Backend can return activityIds.
       */
      if (Array.isArray(data.activityIds)) {
        setJoinedActivities(data.activityIds);
        return;
      }

      /*
       * Fallback if backend returns activities.
       */
      if (Array.isArray(data.activities)) {
        setJoinedActivities(
          data.activities.map((activity) => activity.id)
        );
        return;
      }

      setJoinedActivities([]);
    } catch (err) {
      console.error(
        "Error fetching joined activities:",
        err
      );
    }
  };

  /*
   * Initial data loading
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchActivities(),
        fetchJoinedActivities(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  /*
   * Join / Leave activity
   */
  const toggleJoin = async (activityId) => {
    const alreadyJoined =
      joinedActivities.includes(activityId);

    try {
      setJoiningActivityId(activityId);

      if (alreadyJoined) {
        const response = await fetch(
          `${API_BASE_URL}/api/community-activities/leave`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              activity_id: activityId,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to leave the activity"
          );
        }

        setJoinedActivities((previous) =>
          previous.filter(
            (id) => id !== activityId
          )
        );

        showToast("You have left the activity.");
      } else {
        const response = await fetch(
          `${API_BASE_URL}/api/community-activities/join`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              activity_id: activityId,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to join the activity"
          );
        }

        setJoinedActivities((previous) => [
          ...previous,
          activityId,
        ]);

        showToast(
          "Successfully joined the activity!"
        );
      }

      /*
       * Refresh activity counts after join/leave.
       */
      await fetchActivities();
    } catch (err) {
      console.error(
        "Error updating activity participation:",
        err
      );

      showToast(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setJoiningActivityId(null);
    }
  };

  /*
   * Search + category filtering
   */
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const title =
        activity.title?.toLowerCase() || "";

      const location =
        activity.location?.toLowerCase() || "";

      const category =
        activity.category?.toLowerCase() || "";

      const description =
        activity.description?.toLowerCase() || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        title.includes(searchText) ||
        location.includes(searchText) ||
        category.includes(searchText) ||
        description.includes(searchText);

      const matchesFilter =
        activeFilter === "All" ||
        activity.category === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activities, search, activeFilter]);

  return (
    <div
      className={`min-h-screen pb-28 transition-colors duration-300 ${
        darkMode
          ? "bg-[#0f172a] text-white"
          : "bg-[#faf8ff] text-[#131b2e]"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
          darkMode
            ? "bg-[#0f172a]/90 border-slate-700"
            : "bg-[#faf8ff]/90 border-slate-200"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                darkMode
                  ? "bg-emerald-900/60 text-emerald-300"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <span className="material-symbols-outlined text-[25px]">
                groups
              </span>
            </div>

            <div>
              <h1
                className={`text-xl font-bold ${
                  darkMode
                    ? "text-white"
                    : "text-[#131b2e]"
                }`}
              >
                Community Activities
              </h1>

              <p
                className={`text-sm ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Make your community cleaner and greener
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* Welcome Card */}
        <section
          className={`rounded-2xl p-5 shadow-sm ${
            darkMode
              ? "bg-gradient-to-r from-emerald-950 to-slate-800"
              : "bg-gradient-to-r from-emerald-50 to-teal-50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                darkMode
                  ? "bg-emerald-800 text-emerald-200"
                  : "bg-emerald-600 text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[25px]">
                volunteer_activism
              </span>
            </div>

            <div>
              <h2
                className={`text-lg font-bold ${
                  darkMode
                    ? "text-white"
                    : "text-[#131b2e]"
                }`}
              >
                Make an Impact Together
              </h2>

              <p
                className={`mt-1 text-sm leading-6 ${
                  darkMode
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                Participate in local cleanup drives and
                environmental awareness activities happening
                around your community.
              </p>
            </div>
          </div>
        </section>

        {/* Search */}
        <section>
          <div className="relative">
            <span
              className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              search
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search activities or locations..."
              className={`w-full h-12 pl-11 pr-4 rounded-xl outline-none transition ${
                darkMode
                  ? "bg-slate-800 text-white placeholder:text-slate-500 border border-slate-700 focus:border-emerald-500"
                  : "bg-white text-[#131b2e] placeholder:text-slate-400 border border-slate-200 focus:border-emerald-500"
              }`}
            />
          </div>
        </section>

        {/* Filters */}
        <section className="flex gap-2 overflow-x-auto pb-1">
          {["All", "Cleanup", "Awareness"].map(
            (filter) => {
              const selected =
                activeFilter === filter;

              return (
                <button
                  key={filter}
                  onClick={() =>
                    setActiveFilter(filter)
                  }
                  className={`flex items-center gap-1.5 px-4 h-9 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                    selected
                      ? "bg-emerald-600 text-white"
                      : darkMode
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-white text-slate-600 hover:bg-slate-100 shadow-sm"
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {filter === "All"
                      ? "apps"
                      : filter === "Cleanup"
                      ? "cleaning_services"
                      : "campaign"}
                  </span>

                  {filter}
                </button>
              );
            }
          )}
        </section>

        {/* Activity Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2
              className={`text-lg font-bold ${
                darkMode
                  ? "text-white"
                  : "text-[#131b2e]"
              }`}
            >
              Upcoming Activities
            </h2>

            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                darkMode
                  ? "bg-slate-700 text-slate-200"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {filteredActivities.length}
            </span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <section className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`rounded-2xl p-5 animate-pulse ${
                  darkMode
                    ? "bg-slate-800"
                    : "bg-white"
                }`}
              >
                <div
                  className={`h-5 w-2/3 rounded ${
                    darkMode
                      ? "bg-slate-700"
                      : "bg-slate-200"
                  }`}
                />

                <div
                  className={`h-4 w-full rounded mt-3 ${
                    darkMode
                      ? "bg-slate-700"
                      : "bg-slate-200"
                  }`}
                />

                <div
                  className={`h-4 w-4/5 rounded mt-2 ${
                    darkMode
                      ? "bg-slate-700"
                      : "bg-slate-200"
                  }`}
                />
              </div>
            ))}
          </section>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className={`rounded-2xl p-8 text-center ${
              darkMode
                ? "bg-red-950/40 text-red-300 border border-red-900"
                : "bg-red-50 text-red-600 border border-red-100"
            }`}
          >
            <span className="material-symbols-outlined text-4xl">
              error
            </span>

            <p className="mt-2 font-semibold">
              {error}
            </p>

            <button
              onClick={async () => {
                setLoading(true);
                setError("");

                await Promise.all([
                  fetchActivities(),
                  fetchJoinedActivities(),
                ]);

                setLoading(false);
              }}
              className="mt-4 px-4 h-10 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Activity Cards */}
        {!loading && !error && (
          <section className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div
                className={`rounded-2xl p-8 text-center ${
                  darkMode
                    ? "bg-slate-800 text-slate-300"
                    : "bg-white text-slate-500"
                }`}
              >
                <span className="material-symbols-outlined text-4xl">
                  search_off
                </span>

                <p className="mt-2 font-semibold">
                  No activities found
                </p>

                <p className="text-sm mt-1">
                  Try a different search or category.
                </p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const joined =
                  joinedActivities.includes(
                    activity.id
                  );

                const participants = Number(
                  activity.participants || 0
                );

                const capacity = Number(
                  activity.capacity || 0
                );

                const percentage =
                  capacity > 0
                    ? (participants / capacity) * 100
                    : 0;

                const activityStatus =
                  activity.status || "Open";

                const isFull =
                  activityStatus === "Full" ||
                  participants >= capacity;

                const isUnavailable =
                  activityStatus ===
                    "Completed" ||
                  activityStatus ===
                    "Cancelled";

                const isProcessing =
                  joiningActivityId === activity.id;

                return (
                  <article
                    key={activity.id}
                    className={`rounded-2xl p-4 shadow-sm transition ${
                      darkMode
                        ? "bg-slate-800 border border-slate-700"
                        : "bg-white border border-slate-100"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          activity.category ===
                          "Cleanup"
                            ? darkMode
                              ? "bg-emerald-900/60 text-emerald-300"
                              : "bg-emerald-100 text-emerald-700"
                            : darkMode
                            ? "bg-teal-900/60 text-teal-300"
                            : "bg-teal-100 text-teal-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[23px]">
                          {activity.icon ||
                            "groups"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className={`font-bold leading-5 ${
                              darkMode
                                ? "text-white"
                                : "text-[#131b2e]"
                            }`}
                          >
                            {activity.title}
                          </h3>

                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold shrink-0 ${
                              activityStatus ===
                              "Completed"
                                ? darkMode
                                  ? "bg-slate-700 text-slate-300"
                                  : "bg-slate-200 text-slate-600"
                                : activityStatus ===
                                  "Cancelled"
                                ? darkMode
                                  ? "bg-red-900/60 text-red-300"
                                  : "bg-red-100 text-red-700"
                                : activityStatus ===
                                  "Full"
                                ? darkMode
                                  ? "bg-amber-900/60 text-amber-300"
                                  : "bg-amber-100 text-amber-700"
                                : darkMode
                                ? "bg-emerald-900/70 text-emerald-300"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {isFull &&
                            activityStatus ===
                              "Open"
                              ? "Full"
                              : activityStatus}
                          </span>
                        </div>

                        <p
                          className={`text-sm mt-1 leading-5 ${
                            darkMode
                              ? "text-slate-400"
                              : "text-slate-500"
                          }`}
                        >
                          {activity.description}
                        </p>
                      </div>
                    </div>

                    {/* Activity Information */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                          darkMode
                            ? "bg-slate-700"
                            : "bg-slate-50"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] text-emerald-500">
                          calendar_month
                        </span>

                        <span
                          className={`text-xs font-medium ${
                            darkMode
                              ? "text-slate-300"
                              : "text-slate-600"
                          }`}
                        >
                          {formatDate(
                            activity.activity_date
                          )}
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                          darkMode
                            ? "bg-slate-700"
                            : "bg-slate-50"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] text-emerald-500">
                          schedule
                        </span>

                        <span
                          className={`text-xs font-medium ${
                            darkMode
                              ? "text-slate-300"
                              : "text-slate-600"
                          }`}
                        >
                          {formatTimeRange(
                            activity.start_time,
                            activity.end_time
                          )}
                        </span>
                      </div>

                      <div
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 sm:col-span-2 ${
                          darkMode
                            ? "bg-slate-700"
                            : "bg-slate-50"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] text-emerald-500">
                          location_on
                        </span>

                        <span
                          className={`text-xs font-medium ${
                            darkMode
                              ? "text-slate-300"
                              : "text-slate-600"
                          }`}
                        >
                          {activity.location}
                        </span>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-semibold ${
                            darkMode
                              ? "text-slate-300"
                              : "text-slate-600"
                          }`}
                        >
                          Participants
                        </span>

                        <span
                          className={`text-xs font-bold ${
                            darkMode
                              ? "text-emerald-300"
                              : "text-emerald-700"
                          }`}
                        >
                          {participants}/{capacity}
                        </span>
                      </div>

                      <div
                        className={`h-2 rounded-full overflow-hidden ${
                          darkMode
                            ? "bg-slate-700"
                            : "bg-slate-200"
                        }`}
                      >
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() =>
                          setSelectedActivity(
                            activity
                          )
                        }
                        className={`h-11 rounded-lg flex items-center justify-center gap-1.5 text-sm font-semibold transition ${
                          darkMode
                            ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          visibility
                        </span>
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          toggleJoin(activity.id)
                        }
                        disabled={
                          isProcessing ||
                          (!joined &&
                            (isFull ||
                              isUnavailable))
                        }
                        className={`h-11 rounded-lg flex items-center justify-center gap-1.5 text-sm font-semibold transition ${
                          joined
                            ? darkMode
                              ? "bg-emerald-900 text-emerald-300"
                              : "bg-emerald-100 text-emerald-700"
                            : isFull ||
                              isUnavailable
                            ? darkMode
                              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isProcessing
                            ? "progress_activity"
                            : joined
                            ? "check_circle"
                            : isFull
                            ? "group"
                            : "volunteer_activism"}
                        </span>

                        {isProcessing
                          ? "Please wait..."
                          : joined
                          ? "Joined"
                          : isFull
                          ? "Full"
                          : isUnavailable
                          ? activityStatus
                          : "Join Activity"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}

        {/* Your Participation */}
        {!loading &&
          joinedActivities.length > 0 && (
            <section
              className={`rounded-2xl p-5 ${
                darkMode
                  ? "bg-emerald-950/60 border border-emerald-800"
                  : "bg-emerald-50 border border-emerald-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500 text-[28px]">
                  emoji_events
                </span>

                <div>
                  <h3
                    className={`font-bold ${
                      darkMode
                        ? "text-white"
                        : "text-[#131b2e]"
                    }`}
                  >
                    Your Community Participation
                  </h3>

                  <p
                    className={`text-sm mt-0.5 ${
                      darkMode
                        ? "text-slate-300"
                        : "text-slate-600"
                    }`}
                  >
                    You have joined{" "}
                    {joinedActivities.length}{" "}
                    {joinedActivities.length === 1
                      ? "activity"
                      : "activities"}
                    .
                  </p>
                </div>
              </div>
            </section>
          )}
      </main>

      {/* Details Modal */}
      {selectedActivity && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() =>
            setSelectedActivity(null)
          }
        >
          <div
            className={`w-full max-w-md rounded-2xl p-5 shadow-2xl ${
              darkMode
                ? "bg-slate-800 text-white"
                : "bg-white text-[#131b2e]"
            }`}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  {selectedActivity.category}
                </span>

                <h2 className="text-xl font-bold mt-1">
                  {selectedActivity.title}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedActivity(null)
                }
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <p
              className={`text-sm leading-6 mt-4 ${
                darkMode
                  ? "text-slate-300"
                  : "text-slate-600"
              }`}
            >
              {selectedActivity.description}
            </p>

            <div className="space-y-3 mt-5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">
                  calendar_month
                </span>

                <div>
                  <p className="text-xs text-slate-400">
                    Date
                  </p>

                  <p className="text-sm font-semibold">
                    {formatDate(
                      selectedActivity.activity_date
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">
                  schedule
                </span>

                <div>
                  <p className="text-xs text-slate-400">
                    Time
                  </p>

                  <p className="text-sm font-semibold">
                    {formatTimeRange(
                      selectedActivity.start_time,
                      selectedActivity.end_time
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">
                  location_on
                </span>

                <div>
                  <p className="text-xs text-slate-400">
                    Location
                  </p>

                  <p className="text-sm font-semibold">
                    {selectedActivity.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-500">
                  groups
                </span>

                <div>
                  <p className="text-xs text-slate-400">
                    Participants
                  </p>

                  <p className="text-sm font-semibold">
                    {Number(
                      selectedActivity.participants ||
                        0
                    )}{" "}
                    /{" "}
                    {Number(
                      selectedActivity.capacity ||
                        0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                await toggleJoin(
                  selectedActivity.id
                );

                /*
                 * Keep the modal open when leaving/joining
                 * so the user can see the updated details.
                 */
              }}
              disabled={
                joiningActivityId ===
                selectedActivity.id
              }
              className={`w-full h-11 mt-6 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                joinedActivities.includes(
                  selectedActivity.id
                )
                  ? darkMode
                    ? "bg-emerald-900 text-emerald-300"
                    : "bg-emerald-100 text-emerald-700"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <span className="material-symbols-outlined text-[19px]">
                {joiningActivityId ===
                selectedActivity.id
                  ? "progress_activity"
                  : joinedActivities.includes(
                      selectedActivity.id
                    )
                  ? "logout"
                  : "volunteer_activism"}
              </span>

              {joiningActivityId ===
              selectedActivity.id
                ? "Please wait..."
                : joinedActivities.includes(
                    selectedActivity.id
                  )
                ? "Leave Activity"
                : "Join Activity"}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[120] px-5 py-3 rounded-full shadow-xl text-sm font-semibold whitespace-nowrap ${
            darkMode
              ? "bg-slate-100 text-slate-900"
              : "bg-slate-900 text-white"
          }`}
        >
          {toast}
        </div>
      )}
    </div>
  );
}