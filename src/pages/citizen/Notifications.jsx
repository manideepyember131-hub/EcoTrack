import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

// Temporary user ID.
// Later this should come from the authenticated user.
const userId = 1;

function Notifications() {
  const [notifications, setNotifications] =
    useState([]);

  const [filter, setFilter] = useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Fetch Notifications
  // --------------------------------------------------
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${userId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch notifications"
        );
      }

      setNotifications(
        data.notifications || []
      );
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error
      );

      setError(
        error.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --------------------------------------------------
  // Format Notification Time
  // --------------------------------------------------
  const formatNotificationTime = (
    createdAt
  ) => {
    if (!createdAt) {
      return "";
    }

    const createdDate = new Date(createdAt);

    if (Number.isNaN(createdDate.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      createdDate.getTime();

    const seconds = Math.floor(
      difference / 1000
    );

    const minutes = Math.floor(
      seconds / 60
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} minute${
        minutes !== 1 ? "s" : ""
      } ago`;
    }

    if (hours < 24) {
      return `${hours} hour${
        hours !== 1 ? "s" : ""
      } ago`;
    }

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return createdDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // --------------------------------------------------
  // Mark One Notification As Read
  // --------------------------------------------------
  const markAsRead = async (id) => {
    const notification =
      notifications.find(
        (item) => item.id === id
      );

    if (!notification || !notification.unread) {
      return;
    }

    // Update UI immediately
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              unread: false,
            }
          : item
      )
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to mark notification as read"
        );
      }
    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error
      );

      // Restore unread state if API fails
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                unread: true,
              }
            : item
        )
      );
    }
  };

  // --------------------------------------------------
  // Mark All Notifications As Read
  // --------------------------------------------------
  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    // Update UI immediately
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/user/${userId}/read-all`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to mark all notifications as read"
        );
      }
    } catch (error) {
      console.error(
        "Error marking all notifications as read:",
        error
      );

      // Reload from database if API fails
      fetchNotifications();
    }
  };

  // --------------------------------------------------
  // Delete Notification
  // --------------------------------------------------
  const deleteNotification = async (id) => {
    // Keep a copy in case the API fails
    const previousNotifications =
      notifications;

    // Update UI immediately
    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification.id !== id
      )
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete notification"
        );
      }
    } catch (error) {
      console.error(
        "Error deleting notification:",
        error
      );

      // Restore notification if API fails
      setNotifications(
        previousNotifications
      );
    }
  };

  // --------------------------------------------------
  // Filter Notifications
  // --------------------------------------------------
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter(
          (notification) =>
            notification.unread
        )
      : notifications;

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.unread
    ).length;

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-24">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#faf8ff]/90 backdrop-blur-xl border-b border-[#e2e7ff]">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold">
              Notifications
            </h1>

            <p className="text-sm text-[#3d4a42] mt-1">
              Stay updated with your EcoTrack
              activities
            </p>
          </div>
        </header>

        <main className="px-4 pt-10">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#eaedff]">

            <span className="material-symbols-outlined text-[#006948] text-[40px] animate-spin">
              progress_activity
            </span>

            <p className="mt-3 text-sm text-[#3d4a42]">
              Loading notifications...
            </p>

          </div>
        </main>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] pb-24">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#faf8ff]/90 backdrop-blur-xl border-b border-[#e2e7ff]">
        <div className="px-4 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-xl font-bold">
              Notifications
            </h1>

            <p className="text-sm text-[#3d4a42] mt-1">
              Stay updated with your EcoTrack
              activities
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-semibold text-[#006948] hover:underline"
            >
              Mark all read
            </button>
          )}

        </div>
      </header>

      {/* Error */}
      {error && (
        <section className="px-4 pt-5">
          <div className="bg-red-50 rounded-2xl p-4 border border-red-200 text-red-700">

            <div className="flex items-start gap-3">

              <span className="material-symbols-outlined">
                error
              </span>

              <div className="flex-1">

                <p className="font-semibold">
                  Unable to load notifications
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>

                <button
                  onClick={fetchNotifications}
                  className="mt-3 px-4 py-2 rounded-lg bg-[#006948] text-white text-sm font-semibold"
                >
                  Try Again
                </button>

              </div>

            </div>

          </div>
        </section>
      )}

      {/* Notification Summary */}
      <section className="px-4 pt-5">

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-[#99efe5] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#006a63]">
                notifications
              </span>
            </div>

            <div>
              <p className="font-bold text-base">
                {unreadCount} unread notification
                {unreadCount !== 1
                  ? "s"
                  : ""}
              </p>

              <p className="text-sm text-[#3d4a42]">
                {unreadCount === 0
                  ? "You're all caught up with your latest activities."
                  : "You have new EcoTrack updates waiting for you."}
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* Filters */}
      <section className="px-4 pt-5">

        <div className="flex gap-2">

          <button
            onClick={() =>
              setFilter("all")
            }
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === "all"
                ? "bg-[#006948] text-white"
                : "bg-white text-[#3d4a42] border border-[#e2e7ff]"
            }`}
          >
            All
          </button>

          <button
            onClick={() =>
              setFilter("unread")
            }
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === "unread"
                ? "bg-[#006948] text-white"
                : "bg-white text-[#3d4a42] border border-[#e2e7ff]"
            }`}
          >
            Unread
          </button>

        </div>

      </section>

      {/* Notifications List */}
      <main className="px-4 pt-5">

        {filteredNotifications.length ===
        0 ? (

          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#eaedff]">

            <div className="w-14 h-14 mx-auto rounded-full bg-[#eafdf5] flex items-center justify-center">

              <span className="material-symbols-outlined text-[#006948] text-3xl">
                done_all
              </span>

            </div>

            <h2 className="mt-4 font-bold text-lg">
              You're all caught up!
            </h2>

            <p className="mt-1 text-sm text-[#3d4a42]">
              {filter === "unread"
                ? "There are no unread notifications."
                : "There are no notifications yet."}
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {filteredNotifications.map(
              (notification) => (

                <article
                  key={notification.id}
                  onClick={() =>
                    markAsRead(
                      notification.id
                    )
                  }
                  className={`relative bg-white rounded-2xl p-4 shadow-sm border transition cursor-pointer ${
                    notification.unread
                      ? "border-[#85f8c4]"
                      : "border-[#eaedff]"
                  }`}
                >

                  {/* Unread indicator */}
                  {notification.unread && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#006948]" />
                  )}

                  <div className="flex gap-3">

                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        notification.unread
                          ? "bg-[#eafdf5]"
                          : "bg-[#f2f3ff]"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined ${
                          notification.unread
                            ? "text-[#006948]"
                            : "text-[#6d7a72]"
                        }`}
                      >
                        {notification.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">

                      <div className="flex items-start justify-between gap-2">

                        <h3
                          className={`text-sm ${
                            notification.unread
                              ? "font-bold"
                              : "font-semibold"
                          }`}
                        >
                          {notification.title}
                        </h3>

                      </div>

                      <p className="text-sm text-[#3d4a42] mt-1 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-3">

                        <span className="text-xs text-[#6d7a72]">
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            deleteNotification(
                              notification.id
                            );
                          }}
                          className="text-[#6d7a72] hover:text-red-600 transition"
                          title="Delete notification"
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            delete
                          </span>
                        </button>

                      </div>

                    </div>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default Notifications;