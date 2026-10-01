import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Temporary user ID until authentication is connected
const userId = 1;

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (timeValue) => {
  if (!timeValue) return "";

  const [hours, minutes] = timeValue
    .split(":")
    .map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return "";

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export default function TreePlanting() {
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [toast, setToast] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [registeringEventId, setRegisteringEventId] =
    useState(null);

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  // Fetch all tree planting events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/tree-planting`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch tree planting events"
        );
      }

      setEvents(data.events || []);
    } catch (error) {
      console.error(
        "Error fetching tree planting events:",
        error
      );

      setError(
        "Unable to load tree planting events."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch events registered by current user
  const fetchRegisteredEvents = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/tree-planting/registered/${userId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch registered events"
        );
      }

      setRegisteredEventIds(
        data.eventIds || []
      );
    } catch (error) {
      console.error(
        "Error fetching registered tree planting events:",
        error
      );
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, []);

  // Register current user for an event
  const registerForEvent = async (eventId) => {
    try {
      setRegisteringEventId(eventId);

      const response = await fetch(
        `${API_BASE_URL}/api/tree-planting/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            event_id: eventId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        showToast(
          data.message ||
            "Failed to register for the event."
        );

        return;
      }

      showToast(
        "Successfully registered for the tree planting event."
      );

      await fetchEvents();
      await fetchRegisteredEvents();

      setSelectedEvent(null);
    } catch (error) {
      console.error(
        "Error registering for tree planting event:",
        error
      );

      showToast(
        "Unable to register for the event."
      );
    } finally {
      setRegisteringEventId(null);
    }
  };

  const filteredEvents = events.filter((event) => {
    const value = search.toLowerCase();

    return (
      event.title
        ?.toLowerCase()
        .includes(value) ||
      event.location
        ?.toLowerCase()
        .includes(value) ||
      formatDate(event.event_date)
        .toLowerCase()
        .includes(value) ||
      event.description
        ?.toLowerCase()
        .includes(value)
    );
  });

  const registeredEvents = events.filter((event) =>
    registeredEventIds.includes(Number(event.id))
  );

  const totalTrees = events.reduce(
    (sum, event) =>
      sum + Number(event.trees_planned || 0),
    0
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-24">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  park
                </span>

                <h1 className="text-xl font-bold">
                  Tree Planting Events
                </h1>
              </div>

              <p className="text-sm text-on-surface-variant mt-1">
                Grow greener communities together.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <section className="rounded-2xl bg-primary text-on-primary p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined">
                  eco
                </span>

                <span className="font-semibold">
                  Community Green Initiative
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold">
                Plant a tree. Grow a better future.
              </h2>

              <p className="mt-2 text-sm md:text-base opacity-90">
                Register for community tree-planting
                activities and contribute directly to a
                cleaner and greener city.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/15 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">
                  {totalTrees}
                </div>

                <div className="text-xs opacity-90">
                  Trees planned
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search tree planting events..."
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              progress_activity
            </span>

            <p className="text-sm text-on-surface-variant mt-3">
              Loading tree planting events...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-error/10 border border-error/20 p-5 text-center">
            <span className="material-symbols-outlined text-error text-4xl">
              error
            </span>

            <h3 className="font-bold mt-2">
              Unable to load events
            </h3>

            <p className="text-sm text-on-surface-variant mt-1">
              {error}
            </p>

            <button
              onClick={() => {
                fetchEvents();
                fetchRegisteredEvents();
              }}
              className="mt-4 h-10 px-4 rounded-lg bg-primary text-on-primary font-semibold text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* My Registered Events */}
        {!loading &&
          !error &&
          registeredEvents.length > 0 && (
            <section className="rounded-2xl bg-primary/10 border border-primary/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">
                  event_available
                </span>

                <h2 className="font-bold">
                  My Registered Events
                </h2>
              </div>

              <div className="space-y-3">
                {registeredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-surface-container-lowest rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <h3 className="font-semibold">
                        {event.title}
                      </h3>

                      <p className="text-sm text-on-surface-variant mt-1">
                        {formatDate(event.event_date)} •{" "}
                        {formatTimeRange(
                          event.start_time,
                          event.end_time
                        )}
                      </p>

                      <p className="text-sm text-on-surface-variant">
                        {event.location}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1 text-primary font-semibold text-sm">
                      <span className="material-symbols-outlined text-[18px]">
                        check_circle
                      </span>

                      Registered
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* Events */}
        {!loading && !error && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  Upcoming Events
                </h2>

                <p className="text-sm text-on-surface-variant mt-1">
                  Choose an event and join your community.
                </p>
              </div>

              <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-semibold">
                {filteredEvents.length} events
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredEvents.map((event) => {
                const registered = Number(
                  event.registered || 0
                );

                const capacity = Number(
                  event.capacity || 0
                );

                const spotsLeft =
                  capacity - registered;

                const isRegistered =
                  registeredEventIds.includes(
                    Number(event.id)
                  );

                const isFull =
                  spotsLeft <= 0 ||
                  event.status === "Full";

                const isUnavailable =
                  event.status === "Completed" ||
                  event.status === "Cancelled";

                const isRegistering =
                  registeringEventId ===
                  Number(event.id);

                return (
                  <article
                    key={event.id}
                    className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden"
                  >
                    <div className="bg-primary/10 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[26px]">
                            {event.icon || "park"}
                          </span>
                        </div>

                        <span className="bg-primary/15 text-primary px-3 py-1 rounded-full text-xs font-bold">
                          {isUnavailable
                            ? event.status
                            : spotsLeft > 0
                            ? `${spotsLeft} spots left`
                            : "Full"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mt-4">
                        {event.title}
                      </h3>

                      <p className="text-sm text-on-surface-variant mt-2">
                        {event.description}
                      </p>
                    </div>

                    <div className="p-5 space-y-3">
                      {/* Date */}
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">
                          calendar_month
                        </span>

                        <div>
                          <p className="text-xs text-on-surface-variant">
                            Date
                          </p>

                          <p className="text-sm font-semibold">
                            {formatDate(
                              event.event_date
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">
                          schedule
                        </span>

                        <div>
                          <p className="text-xs text-on-surface-variant">
                            Time
                          </p>

                          <p className="text-sm font-semibold">
                            {formatTimeRange(
                              event.start_time,
                              event.end_time
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">
                          location_on
                        </span>

                        <div>
                          <p className="text-xs text-on-surface-variant">
                            Location
                          </p>

                          <p className="text-sm font-semibold">
                            {event.location}
                          </p>
                        </div>
                      </div>

                      {/* Trees */}
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">
                          forest
                        </span>

                        <div>
                          <p className="text-xs text-on-surface-variant">
                            Trees planned
                          </p>

                          <p className="text-sm font-semibold">
                            {Number(
                              event.trees_planned || 0
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Registration progress */}
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-on-surface-variant">
                            Registrations
                          </span>

                          <span className="font-semibold">
                            {registered}/{capacity}
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                capacity > 0
                                  ? (registered /
                                      capacity) *
                                      100
                                  : 0,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() =>
                            setSelectedEvent(event)
                          }
                          className="h-11 rounded-lg bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            info
                          </span>

                          Details
                        </button>

                        <button
                          disabled={
                            isRegistered ||
                            isFull ||
                            isUnavailable ||
                            isRegistering
                          }
                          onClick={() =>
                            registerForEvent(
                              Number(event.id)
                            )
                          }
                          className={`h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors ${
                            isRegistered
                              ? "bg-primary/15 text-primary cursor-default"
                              : isFull ||
                                isUnavailable
                              ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
                              : "bg-primary text-on-primary hover:bg-primary-container"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isRegistered
                              ? "check_circle"
                              : isFull ||
                                isUnavailable
                              ? "block"
                              : isRegistering
                              ? "progress_activity"
                              : "how_to_reg"}
                          </span>

                          {isRegistered
                            ? "Registered"
                            : isFull
                            ? "Full"
                            : isUnavailable
                            ? event.status
                            : isRegistering
                            ? "Registering..."
                            : "Register"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* No results */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant">
                  search_off
                </span>

                <h3 className="font-bold mt-3">
                  No events found
                </h3>

                <p className="text-sm text-on-surface-variant mt-1">
                  Try searching for another event or
                  location.
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <span className="material-symbols-outlined">
                    park
                  </span>

                  <span className="text-sm font-semibold">
                    Tree Planting Event
                  </span>
                </div>

                <h2 className="text-xl font-bold">
                  {selectedEvent.title}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedEvent(null)
                }
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <p className="text-sm text-on-surface-variant mt-4">
              {selectedEvent.description}
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">
                  calendar_month
                </span>

                <span className="text-sm">
                  {formatDate(
                    selectedEvent.event_date
                  )}
                </span>
              </div>

              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">
                  schedule
                </span>

                <span className="text-sm">
                  {formatTimeRange(
                    selectedEvent.start_time,
                    selectedEvent.end_time
                  )}
                </span>
              </div>

              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">
                  location_on
                </span>

                <span className="text-sm">
                  {selectedEvent.location}
                </span>
              </div>

              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">
                  forest
                </span>

                <span className="text-sm">
                  {Number(
                    selectedEvent.trees_planned || 0
                  )}{" "}
                  trees planned
                </span>
              </div>

              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary">
                  groups
                </span>

                <span className="text-sm">
                  {Number(
                    selectedEvent.registered || 0
                  )}
                  /
                  {Number(
                    selectedEvent.capacity || 0
                  )}{" "}
                  registrations
                </span>
              </div>
            </div>

            <button
              disabled={
                registeredEventIds.includes(
                  Number(selectedEvent.id)
                ) ||
                Number(selectedEvent.registered || 0) >=
                  Number(selectedEvent.capacity || 0) ||
                selectedEvent.status ===
                  "Completed" ||
                selectedEvent.status ===
                  "Cancelled" ||
                registeringEventId ===
                  Number(selectedEvent.id)
              }
              onClick={() =>
                registerForEvent(
                  Number(selectedEvent.id)
                )
              }
              className={`w-full h-11 mt-6 rounded-lg font-semibold ${
                registeredEventIds.includes(
                  Number(selectedEvent.id)
                )
                  ? "bg-primary/15 text-primary"
                  : "bg-primary text-on-primary hover:bg-primary-container"
              }`}
            >
              {registeredEventIds.includes(
                Number(selectedEvent.id)
              )
                ? "Already Registered"
                : registeringEventId ===
                  Number(selectedEvent.id)
                ? "Registering..."
                : Number(
                    selectedEvent.registered || 0
                  ) >=
                  Number(
                    selectedEvent.capacity || 0
                  )
                ? "Event Full"
                : selectedEvent.status ===
                    "Completed" ||
                  selectedEvent.status ===
                    "Cancelled"
                ? selectedEvent.status
                : "Register for Event"}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-full shadow-xl text-sm font-semibold">
          {toast}
        </div>
      )}
    </div>
  );
}