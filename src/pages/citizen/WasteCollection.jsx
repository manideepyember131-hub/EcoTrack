import { useEffect, useMemo, useState } from "react";

function WasteCollection() {
  // ======================================================
  // BACKEND URL
  // ======================================================

  const API_BASE_URL = "http://localhost:5000";

  // ======================================================
  // USER
  // ======================================================
  // Temporary user ID.
  // Later this should come from your login/authentication.

  const userId = 1;

  // ======================================================
  // STATE
  // ======================================================

  const [selectedDay, setSelectedDay] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [ward, setWard] = useState("Ward 4B");

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingReminder, setSavingReminder] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD COLLECTION DATA
  // ======================================================

  useEffect(() => {
    fetchCollectionData();
  }, []);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      setError("");

      // --------------------------------------------------
      // GET USER COLLECTION PREFERENCE
      // --------------------------------------------------

      const preferenceResponse = await fetch(
        `${API_BASE_URL}/api/collection/preferences/${userId}`
      );

      const preferenceData = await preferenceResponse.json();

      if (!preferenceResponse.ok || !preferenceData.success) {
        throw new Error(
          preferenceData.message ||
            "Failed to load collection preference."
        );
      }

      // Backend returns:
      // {
      //   success: true,
      //   preference: {...} OR null
      // }

      if (preferenceData.preference) {
        const preference = preferenceData.preference;

        if (preference.ward) {
          setWard(preference.ward);
        }

        setReminderEnabled(
          Boolean(preference.reminder_enabled)
        );
      }

      // --------------------------------------------------
      // GET ALL COLLECTION SCHEDULES
      // --------------------------------------------------

      const scheduleResponse = await fetch(
        `${API_BASE_URL}/api/collection/schedules`
      );

      const scheduleData = await scheduleResponse.json();

      if (!scheduleResponse.ok || !scheduleData.success) {
        throw new Error(
          scheduleData.message ||
            "Failed to load collection schedules."
        );
      }

      // Backend returns:
      // {
      //   success: true,
      //   schedules: [...]
      // }

      setSchedules(scheduleData.schedules || []);
    } catch (err) {
      console.error(
        "Waste collection fetch error:",
        err
      );

      setError(
        err.message ||
          "Failed to load waste collection information."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // GET SCHEDULES FOR SELECTED WARD
  // ======================================================

  const wardSchedules = useMemo(() => {
    return schedules.filter(
      (schedule) => schedule.ward === ward
    );
  }, [schedules, ward]);

  // ======================================================
  // CONVERT TIME
  // ======================================================

  const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = time
      .toString()
      .split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0
    );

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // ======================================================
  // GET DAY NAME
  // ======================================================

  const getDayName = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      weekday: "long",
    });
  };

  // ======================================================
  // CREATE WEEKLY CALENDAR FROM DATABASE
  // ======================================================

  const days = useMemo(() => {
    const uniqueDays = [];

    wardSchedules.forEach((schedule) => {
      if (!schedule.collection_date) return;

      const date = new Date(schedule.collection_date);

      const dayShort = date.toLocaleDateString(
        "en-US",
        {
          weekday: "short",
        }
      );

      const dateNumber = date.getDate();

      const month = date.toLocaleDateString(
        "en-US",
        {
          month: "short",
        }
      );

      const exists = uniqueDays.find(
        (item) =>
          item.fullDate === schedule.collection_date
      );

      if (!exists) {
        uniqueDays.push({
          day: dayShort,
          date: dateNumber,
          label: month,
          fullDate: schedule.collection_date,
        });
      }
    });

    return uniqueDays;
  }, [wardSchedules]);

  // ======================================================
  // SET INITIAL SELECTED DAY
  // ======================================================

  useEffect(() => {
    if (days.length > 0 && !selectedDay) {
      setSelectedDay(days[0].day);
    }
  }, [days, selectedDay]);

  // ======================================================
  // RESET SELECTED DAY WHEN WARD CHANGES
  // ======================================================

  useEffect(() => {
    if (
      selectedDay &&
      !days.some((day) => day.day === selectedDay)
    ) {
      setSelectedDay("");
    }
  }, [days, selectedDay]);

  // ======================================================
  // SELECTED DATE
  // ======================================================

  const selectedDate =
    days.find(
      (day) => day.day === selectedDay
    ) || null;

  // ======================================================
  // UPCOMING PICKUPS
  // ======================================================

  const pickups = useMemo(() => {
    return wardSchedules.map((schedule) => ({
      id: schedule.id,
      day: getDayName(schedule.collection_date),
      date: formatDate(schedule.collection_date),
      type: schedule.waste_type,
      time: `${formatTime(
        schedule.start_time
      )} – ${formatTime(schedule.end_time)}`,
      status: schedule.status,
    }));
  }, [wardSchedules]);

  // ======================================================
  // TODAY'S DISPATCH
  // ======================================================

  const todaysDispatch = useMemo(() => {
    const today = new Date();

    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    return (
      wardSchedules.find(
        (schedule) =>
          String(schedule.collection_date).slice(0, 10) ===
          todayString
      ) || null
    );
  }, [wardSchedules]);

  // ======================================================
  // CHANGE WARD
  // ======================================================

  const handleWardChange = async (event) => {
    const newWard = event.target.value;

    const previousWard = ward;

    setWard(newWard);
    setSelectedDay("");
    setError("");

    try {
      // Save the selected ward as the user's preference.
      // The backend already has all schedules, so we do
      // not need to call /schedules/:ward.

      const response = await fetch(
        `${API_BASE_URL}/api/collection/preferences`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: userId,
            ward: newWard,
            reminder_enabled: reminderEnabled,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to save the selected ward."
        );
      }
    } catch (err) {
      console.error(
        "Ward preference error:",
        err
      );

      // Roll back if saving failed.
      setWard(previousWard);

      setError(
        err.message ||
          "Failed to save the selected ward."
      );
    }
  };

  // ======================================================
  // TOGGLE REMINDER
  // ======================================================

  const toggleReminder = async () => {
    const newValue = !reminderEnabled;

    try {
      setSavingReminder(true);
      setError("");

      // Optimistic UI update
      setReminderEnabled(newValue);

      // Backend route:
      // POST /api/collection/preferences

      const response = await fetch(
        `${API_BASE_URL}/api/collection/preferences`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: userId,
            ward: ward,
            reminder_enabled: newValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update reminder preference."
        );
      }
    } catch (err) {
      console.error(
        "Reminder update error:",
        err
      );

      // Roll back UI if backend update fails.
      setReminderEnabled(!newValue);

      setError(
        err.message ||
          "Failed to update pickup reminder."
      );
    } finally {
      setSavingReminder(false);
    }
  };

  // ======================================================
  // WASTE TYPE COLORS
  // ======================================================

  const getWasteColor = (type) => {
    if (
      type?.toLowerCase().includes("dry")
    ) {
      return "green";
    }

    if (
      type?.toLowerCase().includes("wet")
    ) {
      return "orange";
    }

    return "purple";
  };

  // ======================================================
  // WASTE TYPE ICON
  // ======================================================

  const getWasteIcon = (type) => {
    if (
      type?.toLowerCase().includes("dry")
    ) {
      return "recycling";
    }

    if (
      type?.toLowerCase().includes("wet")
    ) {
      return "compost";
    }

    return "delete";
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-[#faf8ff] dark:bg-[#0f1720] text-[#131b2e] dark:text-white pb-20">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl shadow-sm">

        <div className="h-16 px-4 flex items-center justify-between gap-3">

          <div className="flex items-center gap-2 min-w-0">

            <div className="w-9 h-9 rounded-lg bg-green-700 text-white flex items-center justify-center shrink-0">

              <span className="material-symbols-outlined">
                eco
              </span>

            </div>

            <div className="flex flex-col min-w-0">

              <div className="flex items-center gap-2">

                <span className="font-bold truncate">
                  EcoTrack
                </span>

                <span className="bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold">
                  Civic Tech
                </span>

              </div>

              <span className="text-xs text-gray-500 dark:text-gray-300 truncate">
                Waste Collection
              </span>

            </div>

          </div>

          <div className="flex items-center gap-1">

            <button
              type="button"
              onClick={() =>
                document.documentElement.classList.toggle(
                  "dark"
                )
              }
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle dark mode"
            >
              <span className="material-symbols-outlined">
                dark_mode
              </span>
            </button>

            <button
              type="button"
              className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="material-symbols-outlined">
                notifications
              </span>

              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center">
                3
              </span>
            </button>

            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="material-symbols-outlined">
                account_circle
              </span>
            </button>

          </div>

        </div>

      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-5">

        {/* PAGE TITLE */}

        <section>

          <div className="flex items-center gap-2">

            <span className="w-2.5 h-2.5 rounded-full bg-green-700 animate-pulse" />

            <span className="text-xs uppercase tracking-wider text-green-700 dark:text-green-400 font-bold">
              Citizen Services
            </span>

          </div>

          <div className="flex items-center justify-between gap-3 mt-1">

            <div>

              <h1 className="text-xl font-bold">
                Waste Collection Schedule
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                Know when your waste will be collected.
              </p>

            </div>

            {/* WARD */}

            <div className="relative shrink-0">

              <select
                value={ward}
                onChange={handleWardChange}
                className="appearance-none bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold outline-none"
              >
                <option value="Ward 4B">
                  Ward 4B
                </option>

                <option value="Ward 3A">
                  Ward 3A
                </option>

                <option value="Ward 5C">
                  Ward 5C
                </option>

                <option value="Ward 2D">
                  Ward 2D
                </option>

              </select>

              <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-[18px]">
                expand_more
              </span>

            </div>

          </div>

        </section>

        {/* LOADING */}

        {loading && (
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300">
            Loading collection information...
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* ==================================================
            TODAY'S DISPATCH
        ================================================== */}

        <section className="rounded-2xl bg-white dark:bg-[#1e293b] shadow-md overflow-hidden">

          <div className="h-1.5 bg-gradient-to-r from-green-700 via-teal-600 to-green-400" />

          <div className="p-4">

            <div className="flex items-center justify-between gap-3">

              <div>

                <div className="flex items-center gap-2">

                  <span className="material-symbols-outlined text-green-700 dark:text-green-400">
                    local_shipping
                  </span>

                  <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-300">
                    Today's Dispatch
                  </span>

                </div>

                <h2 className="text-lg font-bold mt-1">
                  {todaysDispatch
                    ? todaysDispatch.waste_type
                    : "No collection scheduled"}
                </h2>

              </div>

              {todaysDispatch && (
                <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold">
                  {todaysDispatch.status}
                </span>
              )}

            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">

                <span className="material-symbols-outlined text-green-700 dark:text-green-400">
                  schedule
                </span>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Pickup Window
                </p>

                <p className="font-bold text-sm mt-0.5">

                  {todaysDispatch
                    ? `${formatTime(
                        todaysDispatch.start_time
                      )} – ${formatTime(
                        todaysDispatch.end_time
                      )}`
                    : "No schedule"}

                </p>

              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">

                <span className="material-symbols-outlined text-green-700 dark:text-green-400">
                  location_on
                </span>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Service Area
                </p>

                <p className="font-bold text-sm mt-0.5">
                  {ward}
                </p>

              </div>

            </div>

            {/* REMINDER */}

            <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">

              <div className="flex items-center gap-2">

                <span className="material-symbols-outlined text-green-700 dark:text-green-400">
                  notifications_active
                </span>

                <div>

                  <p className="text-sm font-semibold">
                    Pickup Reminder
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    Get notified before collection.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={toggleReminder}
                disabled={savingReminder}
                aria-label="Toggle pickup reminder"
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex items-center ${
                  reminderEnabled
                    ? "bg-green-700"
                    : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500"
                } ${
                  savingReminder
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >

                <span
                  className={`absolute left-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    reminderEnabled
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />

              </button>

            </div>

          </div>

        </section>

        {/* ==================================================
            WEEKLY SCHEDULE
        ================================================== */}

        <section>

          <div className="flex items-center justify-between mb-3">

            <div>

              <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-300">
                Weekly Schedule
              </span>

              <h2 className="font-bold text-lg mt-0.5">
                Collection Schedule
              </h2>

            </div>

            <button
              type="button"
              onClick={fetchCollectionData}
              className="w-9 h-9 rounded-full bg-white dark:bg-[#1e293b] shadow-sm flex items-center justify-center"
              title="Refresh schedule"
            >

              <span className="material-symbols-outlined">
                refresh
              </span>

            </button>

          </div>

          {/* CALENDAR DAYS */}

          {days.length > 0 ? (
            <div className="grid grid-cols-7 gap-1.5">

              {days.map((item) => {

                const isSelected =
                  selectedDay === item.day;

                return (
                  <button
                    key={item.fullDate}
                    type="button"
                    onClick={() =>
                      setSelectedDay(item.day)
                    }
                    className={`rounded-xl py-2.5 flex flex-col items-center transition-all ${
                      isSelected
                        ? "bg-green-700 text-white shadow-md scale-[1.03]"
                        : "bg-white dark:bg-[#1e293b] hover:bg-green-50 dark:hover:bg-gray-800"
                    }`}
                  >

                    <span className="text-[10px] uppercase font-bold opacity-80">
                      {item.day}
                    </span>

                    <span className="text-base font-bold mt-0.5">
                      {item.date}
                    </span>

                    <span className="text-[9px] mt-0.5 opacity-70">
                      {item.label}
                    </span>

                  </button>
                );

              })}

            </div>
          ) : (
            <div className="rounded-xl bg-white dark:bg-[#1e293b] p-4 text-sm text-gray-500 dark:text-gray-400">
              No collection schedule is available for{" "}
              {ward}.
            </div>
          )}

          {/* SELECTED DAY */}

          {selectedDate && (
            <div className="mt-3 rounded-xl bg-white dark:bg-[#1e293b] shadow-sm p-3 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="material-symbols-outlined text-green-700 dark:text-green-400">
                  event_available
                </span>

                <div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Selected day
                  </p>

                  <p className="font-bold text-sm">
                    {selectedDate.day},{" "}
                    {selectedDate.label}{" "}
                    {selectedDate.date}
                  </p>

                </div>

              </div>

              <span className="text-xs font-bold text-green-700 dark:text-green-400">
                Collection Day
              </span>

            </div>
          )}

        </section>

        {/* ==================================================
            UPCOMING PICKUPS
        ================================================== */}

        <section>

          <div className="flex items-center justify-between mb-3">

            <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-300">
              Upcoming Pickups
            </span>

            <span className="text-xs text-gray-400">
              From database
            </span>

          </div>

          <div className="space-y-3">

            {pickups.length > 0 ? (
              pickups.map((pickup) => {

                const color =
                  getWasteColor(pickup.type);

                return (
                  <div
                    key={pickup.id}
                    className="rounded-2xl bg-white dark:bg-[#1e293b] shadow-sm p-4"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                            color === "green"
                              ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                              : color === "orange"
                              ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                              : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                          }`}
                        >

                          <span className="material-symbols-outlined">
                            {getWasteIcon(
                              pickup.type
                            )}
                          </span>

                        </div>

                        <div>

                          <p className="font-bold text-sm">
                            {pickup.type}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {pickup.day},{" "}
                            {pickup.date}
                          </p>

                        </div>

                      </div>

                      <span className="material-symbols-outlined text-gray-400">
                        chevron_right
                      </span>

                    </div>

                    <div className="flex items-center justify-between mt-3">

                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">

                        <span className="material-symbols-outlined text-[16px]">
                          schedule
                        </span>

                        {pickup.time}

                      </div>

                      <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                        {pickup.status}
                      </span>

                    </div>

                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-white dark:bg-[#1e293b] shadow-sm p-4 text-sm text-gray-500 dark:text-gray-400">
                No upcoming pickups found for{" "}
                {ward}.
              </div>
            )}

          </div>

        </section>

        {/* ==================================================
            WASTE SORTING GUIDELINES
        ================================================== */}

        <section className="space-y-3">

          <div>

            <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-300">
              Waste Sorting Guidelines
            </span>

            <h2 className="font-bold text-lg mt-0.5">
              Sort it right, keep it clean
            </h2>

          </div>

          {/* DRY */}

          <div className="rounded-2xl bg-white dark:bg-[#1e293b] shadow-sm overflow-hidden">

            <details>

              <summary className="cursor-pointer list-none flex items-center justify-between p-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex items-center justify-center">

                    <span className="material-symbols-outlined">
                      recycling
                    </span>

                  </div>

                  <div>

                    <p className="font-bold text-sm">
                      Dry / Recyclable Waste
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Paper, plastic, metal and glass
                    </p>

                  </div>

                </div>

                <span className="material-symbols-outlined text-gray-400">
                  expand_more
                </span>

              </summary>

              <div className="px-4 pb-4">

                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">

                  <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">
                    Examples:
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {[
                      "Paper",
                      "Cardboard",
                      "Plastic bottles",
                      "Metal cans",
                      "Glass bottles",
                    ].map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs"
                      >
                        {item}
                      </span>
                    ))}

                  </div>

                </div>

              </div>

            </details>

          </div>

          {/* WET */}

          <div className="rounded-2xl bg-white dark:bg-[#1e293b] shadow-sm overflow-hidden">

            <details>

              <summary className="cursor-pointer list-none flex items-center justify-between p-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 flex items-center justify-center">

                    <span className="material-symbols-outlined">
                      compost
                    </span>

                  </div>

                  <div>

                    <p className="font-bold text-sm">
                      Wet / Organic Waste
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Food and biodegradable waste
                    </p>

                  </div>

                </div>

                <span className="material-symbols-outlined text-gray-400">
                  expand_more
                </span>

              </summary>

              <div className="px-4 pb-4">

                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">

                  <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">
                    Examples:
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {[
                      "Food scraps",
                      "Vegetable peels",
                      "Fruit waste",
                      "Tea leaves",
                      "Garden waste",
                    ].map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs"
                      >
                        {item}
                      </span>
                    ))}

                  </div>

                </div>

              </div>

            </details>

          </div>

          {/* SPECIAL */}

          <div className="rounded-2xl bg-white dark:bg-[#1e293b] shadow-sm overflow-hidden">

            <details>

              <summary className="cursor-pointer list-none flex items-center justify-between p-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center">

                    <span className="material-symbols-outlined">
                      delete
                    </span>

                  </div>

                  <div>

                    <p className="font-bold text-sm">
                      Special Waste
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Hazardous and non-routine waste
                    </p>

                  </div>

                </div>

                <span className="material-symbols-outlined text-gray-400">
                  expand_more
                </span>

              </summary>

              <div className="px-4 pb-4">

                <div className="border-t border-gray-100 dark:border-gray-700 pt-3">

                  <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">
                    Examples:
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {[
                      "Batteries",
                      "Paint cans",
                      "E-waste",
                      "Chemicals",
                      "Medical waste",
                    ].map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs"
                      >
                        {item}
                      </span>
                    ))}

                  </div>

                </div>

              </div>

            </details>

          </div>

        </section>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <section>

          <div className="mb-3">

            <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-300">
              Quick Actions
            </span>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() =>
                alert(
                  "Item slot management will be connected later."
                )
              }
              className="rounded-2xl bg-white dark:bg-[#1e293b] shadow-sm p-4 text-left hover:shadow-md transition"
            >

              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex items-center justify-center">

                <span className="material-symbols-outlined">
                  inventory_2
                </span>

              </div>

              <p className="font-bold text-sm mt-3">
                Manage Item Slot
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Manage your collection requirements
              </p>

            </button>

            <button
              type="button"
              onClick={() =>
                alert(
                  "Depot map will be connected later."
                )
              }
              className="rounded-2xl bg-white dark:bg-[#1e293b] shadow-sm p-4 text-left hover:shadow-md transition"
            >

              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center">

                <span className="material-symbols-outlined">
                  map
                </span>

              </div>

              <p className="font-bold text-sm mt-3">
                View Depot Map
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Find nearby collection facilities
              </p>

            </button>

          </div>

        </section>

        {/* ==================================================
            CIVIC IMPACT
        ================================================== */}

        <section className="rounded-2xl bg-green-700 text-white p-5 shadow-md">

          <div className="flex items-start justify-between gap-3">

            <div>

              <div className="flex items-center gap-2">

                <span className="material-symbols-outlined">
                  eco
                </span>

                <span className="text-xs uppercase tracking-wider font-bold opacity-80">
                  Civic Impact
                </span>

              </div>

              <h2 className="text-xl font-bold mt-2">
                Every pickup makes a difference.
              </h2>

              <p className="text-sm opacity-90 mt-1">
                Following your collection schedule
                helps keep {ward} cleaner and
                reduces waste going to landfills.
              </p>

            </div>

            <span className="material-symbols-outlined text-4xl opacity-30">
              park
            </span>

          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">

            <div className="rounded-xl bg-white/10 p-3">

              <p className="text-lg font-bold">
                {wardSchedules.length > 0
                  ? "Active"
                  : "—"}
              </p>

              <p className="text-[10px] opacity-80">
                Schedule
              </p>

            </div>

            <div className="rounded-xl bg-white/10 p-3">

              <p className="text-lg font-bold">
                {wardSchedules.filter(
                  (item) =>
                    item.waste_type ===
                    "Dry / Recyclable"
                ).length}
              </p>

              <p className="text-[10px] opacity-80">
                Dry Pickups
              </p>

            </div>

            <div className="rounded-xl bg-white/10 p-3">

              <p className="text-lg font-bold">
                {wardSchedules.length}
              </p>

              <p className="text-[10px] opacity-80">
                Total Pickups
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default WasteCollection;