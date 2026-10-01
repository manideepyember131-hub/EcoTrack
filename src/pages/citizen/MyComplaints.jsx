import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function MyComplaints() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // FETCH LOGGED-IN USER'S COMPLAINTS
  // ======================================================

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          setError("Please login to view your complaints.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);

        if (!user.id) {
          setError("User information is missing.");
          setLoading(false);
          return;
        }

        console.log(
          "Fetching complaints for user:",
          user.id
        );

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/complaints/user/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch complaints"
          );
        }

        console.log(
          "Complaints received:",
          data.complaints
        );

        setComplaints(data.complaints || []);
      } catch (err) {
        console.error(
          "Fetch complaints error:",
          err
        );

        setError(
          err.message ||
            "Unable to load complaints"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // ======================================================
  // FILTER + SEARCH
  // ======================================================

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      let matchesFilter = true;

      if (filter === "active") {
        matchesFilter =
          complaint.status === "Active";
      }

      if (filter === "review") {
        matchesFilter =
          complaint.status === "Under Review";
      }

      if (filter === "action") {
        matchesFilter =
          complaint.status === "In Action";
      }

      if (filter === "resolved") {
        matchesFilter =
          complaint.status === "Resolved";
      }

      const query =
        search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        `${complaint.id || ""} ${
          complaint.title || ""
        } ${
          complaint.location || ""
        }`
          .toLowerCase()
          .includes(query);

      return (
        matchesFilter &&
        matchesSearch
      );
    });
  }, [complaints, filter, search]);

  // ======================================================
  // FILTER COUNTS
  // ======================================================

  const allCount = complaints.length;

  const activeCount = complaints.filter(
    (complaint) =>
      complaint.status === "Active"
  ).length;

  const reviewCount = complaints.filter(
    (complaint) =>
      complaint.status === "Under Review"
  ).length;

  const actionCount = complaints.filter(
    (complaint) =>
      complaint.status === "In Action"
  ).length;

  const resolvedCount = complaints.filter(
    (complaint) =>
      complaint.status === "Resolved"
  ).length;

  const filterButtons = [
    {
      id: "all",
      label: "All",
      count: allCount,
    },
    {
      id: "active",
      label: "Active",
      count: activeCount,
    },
    {
      id: "review",
      label: "Under Review",
      count: reviewCount,
    },
    {
      id: "action",
      label: "In Action",
      count: actionCount,
    },
    {
      id: "resolved",
      label: "Resolved",
      count: resolvedCount,
    },
  ];

  // ======================================================
  // DATE FORMAT
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8ff] dark:bg-[#0f1720] text-[#131b2e] dark:text-white flex items-center justify-center">
        <div className="text-center">

          <div className="w-12 h-12 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mx-auto" />

          <p className="mt-4 font-semibold">
            Loading your complaints...
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <div className="min-h-screen bg-[#faf8ff] dark:bg-[#0f1720] text-[#131b2e] dark:text-white pb-24">

      {/* Header */}

      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl shadow-sm">

        <div className="h-16 px-4 flex items-center justify-between gap-2">

          <div className="flex items-center gap-2 min-w-0">

            <div className="w-9 h-9 rounded-lg bg-green-700 text-white flex items-center justify-center">

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
                My Complaints
              </span>

            </div>

          </div>

          <div className="flex items-center gap-1">

            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() =>
                document.documentElement.classList.toggle(
                  "dark"
                )
              }
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
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

      {/* Main */}

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">

        {/* Page Heading */}

        <div className="flex items-center justify-between gap-3">

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <span className="w-2.5 h-2.5 rounded-full bg-green-700 animate-pulse" />

              <span className="text-xs uppercase tracking-wider text-green-700 dark:text-green-400 font-bold">
                Citizen Reports Portal
              </span>

            </div>

            <h1 className="text-xl font-bold mt-1 truncate">
              My Complaints &amp; Activity
            </h1>

          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 shadow-sm shrink-0">

            <span className="material-symbols-outlined text-[18px]">
              verified
            </span>

            <span className="text-xs font-semibold">
              {resolvedCount} Resolved
            </span>

          </div>

        </div>

        {/* Search */}

        <div className="relative">

          <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500">
            search
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search complaint ID or street location..."
            className="w-full h-12 pl-10 pr-10 rounded-xl bg-white dark:bg-[#1e293b] shadow-sm outline-none text-sm"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-gray-500"
            >

              <span className="material-symbols-outlined text-[18px]">
                close
              </span>

            </button>
          )}

        </div>

        {/* Error */}

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4">

            <div className="flex items-start gap-3">

              <span className="material-symbols-outlined text-red-600">
                error
              </span>

              <div>

                <p className="font-semibold text-red-700 dark:text-red-300">
                  Unable to load complaints
                </p>

                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* Filters */}

        <div className="flex gap-2 overflow-x-auto pb-1">

          {filterButtons.map((item) => (

            <button
              key={item.id}
              type="button"
              onClick={() =>
                setFilter(item.id)
              }
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                filter === item.id
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 dark:bg-[#1e293b] text-gray-600 dark:text-gray-200"
              }`}
            >

              <span>
                {item.label}
              </span>

              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === item.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {item.count}
              </span>

            </button>

          ))}

        </div>

        {/* Section Label */}

        <div className="flex items-center justify-between pt-1">

          <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-300">
            My Complaint Records
          </span>

          <span className="flex items-center gap-1 text-green-700 dark:text-green-400 text-xs font-semibold">

            <span className="material-symbols-outlined text-[16px]">
              sync
            </span>

            MySQL Data

          </span>

        </div>

        {/* Complaints */}

        <section className="space-y-3">

          {filteredComplaints.map(
            (complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                formatDate={formatDate}
              />
            )
          )}

          {filteredComplaints.length ===
            0 && (
            <div className="rounded-xl bg-white dark:bg-[#1e293b] p-8 text-center">

              <span className="material-symbols-outlined text-4xl text-gray-400">
                search_off
              </span>

              <p className="mt-2 font-semibold">
                No complaints found
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {complaints.length === 0
                  ? "You haven't submitted any complaints yet."
                  : "Try another search or filter."}
              </p>

            </div>
          )}

        </section>

        {/* Report New Incident */}

        <div className="pt-4">

          <Link
            to="/report-waste"
            className="w-full h-14 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
          >

            <span className="material-symbols-outlined">
              add_circle
            </span>

            Report New Incident

          </Link>

        </div>

      </main>

    </div>
  );
}

// ======================================================
// COMPLAINT CARD
// ======================================================

function ComplaintCard({
  complaint,
  formatDate,
}) {
  const isResolved =
    complaint.status === "Resolved";

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1e293b] p-4 shadow-sm space-y-3">

      {/* Header */}

      <div className="flex items-start justify-between gap-2">

        <div className="flex flex-wrap items-center gap-2">

          <span className="font-bold">
            #{complaint.id}
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isResolved
                ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200"
            }`}
          >
            {complaint.priority ||
              "Standard Priority"}
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isResolved
                ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                : "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300"
            }`}
          >
            {complaint.status}
          </span>

        </div>

        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatDate(
            complaint.createdAt ||
              complaint.created_at
          )}
        </span>

      </div>

      {/* Complaint details */}

      <div>

        <h3 className="text-base font-bold leading-snug">
          {complaint.title}
        </h3>

        {complaint.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {complaint.description}
          </p>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-1">

          <span className="material-symbols-outlined text-[16px] text-green-700">
            location_on
          </span>

          {complaint.location}

        </p>

      </div>

      {/* Worker */}

      {complaint.workerId && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl">

          <div className="flex items-center gap-2">

            <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center font-bold text-xs">
              W
            </div>

            <div>

              <span className="block text-xs font-bold">
                Worker #{complaint.workerId}
              </span>

              <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                Assigned worker
              </span>

            </div>

          </div>

          <span className="material-symbols-outlined text-gray-400">
            chevron_right
          </span>

        </div>
      )}

      {/* Resolved */}

      {isResolved && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">

          <div className="flex items-center gap-1.5">

            <span className="material-symbols-outlined text-green-700">
              verified_user
            </span>

            <span className="text-xs font-medium">
              Complaint resolved
            </span>

          </div>

          <span className="text-xs text-green-700 dark:text-green-400 font-bold">
            Closed
          </span>

        </div>
      )}

    </div>
  );
}

export default MyComplaints;