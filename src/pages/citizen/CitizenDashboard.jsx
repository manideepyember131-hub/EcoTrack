import { useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

export default function CitizenDashboard() {
  const navigate = useNavigate();

  // ======================================================
  // STATE
  // ======================================================

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [wasteReports, setWasteReports] = useState([]);

  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);

  const [dashboardError, setDashboardError] = useState("");

  // ======================================================
  // CURRENT LOGGED-IN USER
  // ======================================================

  const [currentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      return null;
    }
  });

  // ======================================================
  // CURRENT USER ID
  // ======================================================

  const userId = currentUser?.id;

  // ======================================================
  // CURRENT USER NAME
  // ======================================================

  const userName = currentUser?.name || "Citizen";

  // ======================================================
  // CURRENT USER ROLE
  // ======================================================

  const userRole = currentUser?.role?.toLowerCase();

  // ======================================================
  // AUTHENTICATION / ROLE CHECK
  // ======================================================

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (userRole === "worker") {
      navigate("/worker-dashboard", { replace: true });
    }
  }, [currentUser, userRole, navigate]);

  // ======================================================
  // NAVIGATION LINKS
  // ======================================================

  const citizenLinks = [
    ["dashboard", "Dashboard", "dashboard"],
    ["report-waste", "Report Waste", "report_problem"],
    ["my-complaints", "My Complaints", "assignment"],
    ["waste-collection", "Waste Collection", "local_shipping"],
    ["recycling-centers", "Recycling Centers", "recycling"],
    ["community-activities", "Community Activities", "diversity_3"],
    ["tree-planting", "Tree Planting Events", "park"],
    ["my-contributions", "My Contributions", "eco"],
    ["notifications", "Notifications", "notifications"],
    ["profile", "Profile", "account_circle"],
  ];

  // ======================================================
  // FETCH DASHBOARD DATA
  // ======================================================

  useEffect(() => {
    if (!userId || userRole !== "citizen") {
      setLoadingComplaints(false);
      setLoadingReports(false);
      return;
    }

    const fetchDashboardData = async () => {
      setDashboardError("");

      // --------------------------------------------------
      // FETCH USER COMPLAINTS
      // --------------------------------------------------

      try {
        setLoadingComplaints(true);

        console.log(
          "Fetching complaints for logged-in user:",
          userId
        );

        const complaintResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/complaints/user/${userId}`
        );

        const complaintData = await complaintResponse.json();

        if (!complaintResponse.ok || !complaintData.success) {
          throw new Error(
            complaintData.message ||
              "Failed to fetch complaints."
          );
        }

        console.log(
          "Dashboard complaints received for user:",
          userId,
          complaintData.complaints
        );

        setComplaints(
          Array.isArray(complaintData.complaints)
            ? complaintData.complaints
            : []
        );
      } catch (error) {
        console.error(
          "Dashboard complaint fetch error:",
          error
        );

        setComplaints([]);

        setDashboardError(
          "Unable to load complaint information."
        );
      } finally {
        setLoadingComplaints(false);
      }

      // --------------------------------------------------
      // FETCH USER WASTE REPORTS
      // --------------------------------------------------

      try {
        setLoadingReports(true);

        console.log(
          "Fetching waste reports for logged-in user:",
          userId
        );

        const reportResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/waste-reports/user/${userId}`
        );

        const reportData = await reportResponse.json();

        if (!reportResponse.ok || !reportData.success) {
          throw new Error(
            reportData.message ||
              "Failed to fetch waste reports."
          );
        }

        console.log(
          "Dashboard waste reports received for user:",
          userId,
          reportData.reports
        );

        setWasteReports(
          Array.isArray(reportData.reports)
            ? reportData.reports
            : []
        );
      } catch (error) {
        console.error(
          "Dashboard waste report fetch error:",
          error
        );

        setWasteReports([]);

        setDashboardError(
          "Unable to load waste report information."
        );
      } finally {
        setLoadingReports(false);
      }
    };

    fetchDashboardData();
  }, [userId, userRole]);

  // ======================================================
  // WASTE REPORT STATISTICS
  // ======================================================

  const reportStatistics = useMemo(() => {
    const pending = wasteReports.filter(
      (report) =>
        String(report.status).toLowerCase() === "pending"
    ).length;

    const inProgress = wasteReports.filter((report) => {
      const status = String(report.status).toLowerCase();

      return (
        status === "assigned" ||
        status === "in progress"
      );
    }).length;

    const resolved = wasteReports.filter(
      (report) =>
        String(report.status).toLowerCase() === "resolved"
    ).length;

    return {
      pending,
      inProgress,
      resolved,
      total: wasteReports.length,
    };
  }, [wasteReports]);

  // ======================================================
  // ACTIVE / LATEST COMPLAINT
  // ======================================================

  const activeComplaint = useMemo(() => {
    if (!complaints.length) {
      return null;
    }

    const activeStatuses = [
      "Active",
      "Under Review",
      "In Action",
    ];

    const active = complaints.find((complaint) =>
      activeStatuses.includes(complaint.status)
    );

    return active || complaints[0];
  }, [complaints]);

  // ======================================================
  // ACTIVE COMPLAINT COUNT
  // ======================================================

  const activeComplaintCount = useMemo(() => {
    return complaints.filter((complaint) =>
      ["Active", "Under Review", "In Action"].includes(
        complaint.status
      )
    ).length;
  }, [complaints]);

  // ======================================================
  // COMPLAINT STATUS TIMELINE
  // ======================================================

  const getComplaintTimeline = (status) => {
    const statuses = [
      "Active",
      "Under Review",
      "In Action",
      "Resolved",
    ];

    let currentIndex = statuses.indexOf(status);

    if (currentIndex === -1) {
      currentIndex = 0;
    }

    return [
      ["check", "Reported", true],

      [
        currentIndex >= 1
          ? "check"
          : "radio_button_unchecked",
        "Reviewed",
        currentIndex >= 1,
      ],

      [
        currentIndex >= 2
          ? "check"
          : "radio_button_unchecked",
        "Assigned",
        currentIndex >= 2,
      ],

      [
        currentIndex >= 2
          ? "autorenew"
          : "radio_button_unchecked",
        "In Action",
        currentIndex >= 2,
      ],

      [
        currentIndex >= 3
          ? "done_all"
          : "radio_button_unchecked",
        "Resolved",
        currentIndex >= 3,
      ],
    ];
  };

  // ======================================================
  // STATUS DISPLAY
  // ======================================================

  const getComplaintPriority = (complaint) => {
    if (!complaint) {
      return "Normal Priority";
    }

    const text = `${complaint.title || ""} ${
      complaint.description || ""
    }`.toLowerCase();

    if (
      text.includes("illegal") ||
      text.includes("hazardous") ||
      text.includes("overflow")
    ) {
      return "High Priority";
    }

    return "Normal Priority";
  };

  // ======================================================
  // DRAWER
  // ======================================================

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  // ======================================================
  // NAVIGATION HANDLER
  // ======================================================

  const navigateCitizen = (label) => {
    closeDrawer();

    const routes = {
      Dashboard: "/citizen",
      "Report Waste": "/report-waste",
      "My Complaints": "/my-complaints",
      "Waste Collection": "/waste-collection",
      "Recycling Centers": "/recycling-centers",
      "Community Activities": "/community-activities",
      "Tree Planting Events": "/tree-planting",
      "My Contributions": "/my-contributions",
      Notifications: "/notifications",
      Profile: "/profile",
    };

    if (routes[label]) {
      navigate(routes[label]);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <div className="min-h-screen font-body-md bg-[#faf8ff] text-[#131b2e]">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl shadow-sm border-b bg-white/90 text-[#131b2e] border-[#eaedff]">
          <div className="h-16 px-4 md:px-8 flex items-center justify-between gap-2">

            {/* LOGO */}

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined">
                  eco
                </span>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold truncate text-[#131b2e]">
                    EcoTrack
                  </span>

                  <span className="hidden sm:inline-block bg-secondary-container text-on-secondary-container text-xs px-2 py-1 rounded-full uppercase tracking-wider">
                    Civic Tech
                  </span>
                </div>

                <span className="text-xs text-on-surface-variant">
                  Citizen Dashboard
                </span>
              </div>
            </div>

            {/* HEADER CONTROLS */}

            <div className="flex items-center gap-1">

              {/* NOTIFICATIONS */}

              <button
                onClick={() =>
                  navigate("/notifications")
                }
                className="relative w-11 h-11 flex items-center justify-center rounded-full transition-colors text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">
                  notifications
                </span>

                <span className="absolute top-2 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs rounded-full font-bold">
                  3
                </span>
              </button>

              {/* PROFILE */}

              <button
                onClick={() => navigate("/profile")}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-colors text-on-surface-variant hover:bg-surface-container-high"
                aria-label="Profile"
              >
                <span className="material-symbols-outlined">
                  account_circle
                </span>
              </button>

              {/* THREE DOT */}

              <button
                onClick={() => setDrawerOpen(true)}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-colors text-on-surface-variant hover:bg-surface-container-high"
                aria-label="Open navigation menu"
              >
                <span className="material-symbols-outlined">
                  more_vert
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* ==================================================
            MAIN
        ================================================== */}

        <main className="pt-20 pb-28">
          <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6">

            {/* ==================================================
                WELCOME
            ================================================== */}

            <section>
              <div className="flex items-center justify-between gap-3">
                <div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">
                        eco
                      </span>
                    </span>

                    <span className="text-xs font-bold uppercase tracking-wide text-primary">
                      Citizen Portal
                    </span>
                  </div>

                  {/* WELCOME TEXT */}

                  <h1 className="text-2xl md:text-3xl font-bold text-[#131b2e]">
                    Welcome back, {userName}
                  </h1>

                  <p className="text-sm mt-1 text-[#3d4a42]">
                    Green Citizen Level 4

                    <span className="mx-2">
                      •
                    </span>

                    <span className="font-bold text-primary">
                      {reportStatistics.total * 10 +
                        complaints.length * 5}{" "}
                      Impact Pts
                    </span>
                  </p>
                </div>

                <div className="hidden sm:flex w-20 h-20 rounded-xl flex-col items-center justify-center bg-surface-container-high">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    military_tech
                  </span>

                  <span className="text-xs font-bold text-primary">
                    Civic Impact
                  </span>
                </div>
              </div>
            </section>

            {/* ==================================================
                QUICK ACTIONS
            ================================================== */}

            <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                {/* REPORT WASTE */}

                <button
                  onClick={() =>
                    navigate("/report-waste")
                  }
                  className="text-left p-4 rounded-xl shadow-sm hover:shadow-md transition-all bg-error-container text-on-error-container"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-white/80 text-error">
                    <span className="material-symbols-outlined">
                      report_problem
                    </span>
                  </div>

                  <h3 className="font-bold">
                    Report Waste
                  </h3>

                  <p className="text-xs mt-1">
                    Log roadside or bin alerts
                  </p>
                </button>

                {/* FIND CENTERS */}

                <button
                  onClick={() =>
                    navigate("/recycling-centers")
                  }
                  className="text-left p-4 rounded-xl shadow-sm hover:shadow-md transition-all bg-secondary-container text-on-secondary-container"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-white/80 text-secondary">
                    <span className="material-symbols-outlined">
                      explore
                    </span>
                  </div>

                  <h3 className="font-bold">
                    Find Centers
                  </h3>

                  <p className="text-xs mt-1">
                    Drop-offs & e-waste depots
                  </p>
                </button>

                {/* JOIN CLEANUP */}

                <button
                  onClick={() =>
                    navigate(
                      "/community-activities"
                    )
                  }
                  className="text-left p-4 rounded-xl shadow-sm hover:shadow-md transition-all bg-primary-fixed text-on-primary-fixed"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-white/80 text-primary">
                    <span className="material-symbols-outlined">
                      volunteer_activism
                    </span>
                  </div>

                  <h3 className="font-bold">
                    Join Cleanup
                  </h3>

                  <p className="text-xs mt-1">
                    Join neighborhood drives
                  </p>
                </button>

                {/* PLANT TREE */}

                <button
                  onClick={() =>
                    navigate("/tree-planting")
                  }
                  className="text-left p-4 rounded-xl shadow-sm hover:shadow-md transition-all bg-surface-container-highest"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-white/80 text-tertiary">
                    <span className="material-symbols-outlined">
                      park
                    </span>
                  </div>

                  <h3 className="font-bold">
                    Plant a Tree
                  </h3>

                  <p className="text-xs mt-1">
                    Register for tree planting
                  </p>
                </button>
              </div>
            </section>

            {/* ==================================================
                LIVE COMPLAINT
            ================================================== */}

            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>

                  <h2 className="text-lg font-bold text-[#131b2e]">
                    Live Complaint Tracking
                  </h2>
                </div>

                <span className="text-xs font-bold text-primary">
                  {activeComplaintCount} Active
                </span>
              </div>

              {/* LOADING */}

              {loadingComplaints ? (
                <div className="p-6 rounded-xl shadow-md text-center bg-white text-gray-600">
                  <span className="material-symbols-outlined animate-spin text-primary text-3xl">
                    progress_activity
                  </span>

                  <p className="text-sm mt-2">
                    Loading your complaints...
                  </p>
                </div>
              ) : !activeComplaint ? (

                /* NO COMPLAINT */

                <div className="p-6 rounded-xl shadow-md text-center bg-white text-gray-600">
                  <span className="material-symbols-outlined text-primary text-4xl">
                    assignment
                  </span>

                  <p className="font-bold mt-2">
                    No complaints found
                  </p>

                  <p className="text-sm mt-1">
                    Your active complaints will appear here.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/report-waste")
                    }
                    className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold"
                  >
                    Report Waste
                  </button>
                </div>
              ) : (
                <>
                  {/* COMPLAINT CARD */}

                  <div className="p-4 rounded-xl shadow-md space-y-4 bg-white">

                    {/* COMPLAINT HEADER */}

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs px-2 py-1 rounded-md font-semibold bg-surface-container-high">
                          Ticket #
                          {activeComplaint.id ||
                            activeComplaint._id}
                        </span>

                        <h3 className="font-bold text-lg mt-2">
                          {activeComplaint.title}
                        </h3>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          getComplaintPriority(
                            activeComplaint
                          ) === "High Priority"
                            ? "bg-error-container text-on-error-container"
                            : "bg-primary-fixed text-on-primary-fixed"
                        }`}
                      >
                        {getComplaintPriority(
                          activeComplaint
                        )}
                      </span>
                    </div>

                    {/* COMPLAINT INFORMATION */}

                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-surface-container-low">
                        <span className="material-symbols-outlined text-sm text-secondary">
                          recycling
                        </span>

                        Waste Complaint
                      </span>

                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-surface-container-low">
                        <span className="material-symbols-outlined text-sm text-primary">
                          location_on
                        </span>

                        {activeComplaint.location}
                      </span>

                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-xs font-semibold">
                        <span className="material-symbols-outlined text-sm">
                          flag
                        </span>

                        {activeComplaint.status}
                      </span>
                    </div>

                    {/* DESCRIPTION */}

                    {activeComplaint.description && (
                      <div className="p-3 rounded-lg bg-surface-container-low">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 text-on-surface-variant">
                          Description
                        </p>

                        <p className="text-sm">
                          {activeComplaint.description}
                        </p>
                      </div>
                    )}

                    {/* MAP PLACEHOLDER */}

                    <div className="w-full h-32 rounded-lg relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                      <span className="material-symbols-outlined text-primary text-4xl">
                        location_on
                      </span>

                      <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-xs">
                        Complaint Location
                      </span>
                    </div>

                    {/* TIMELINE */}

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-4 text-on-surface-variant">
                        Resolution Progress
                      </p>

                      <div className="relative flex items-start justify-between">

                        <div className="absolute left-4 right-4 top-3 h-1 bg-surface-container-highest"></div>

                        {(() => {
                          const timeline =
                            getComplaintTimeline(
                              activeComplaint.status
                            );

                          const activeSteps =
                            timeline.filter(
                              (item) => item[2]
                            ).length;

                          const progressWidth =
                            Math.max(
                              0,
                              ((activeSteps - 1) / 4) *
                                100
                            );

                          return (
                            <>
                              <div
                                className="absolute left-4 top-3 h-1 bg-primary"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    progressWidth
                                  )}%`,
                                }}
                              ></div>

                              {timeline.map(
                                (
                                  [
                                    icon,
                                    label,
                                    active,
                                  ],
                                  index
                                ) => (
                                  <div
                                    key={index}
                                    className="relative z-10 flex flex-col items-center w-1/5"
                                  >
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                        active
                                          ? "bg-primary text-on-primary"
                                          : "bg-surface-container-high text-outline"
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        {icon}
                                      </span>
                                    </div>

                                    <span
                                      className={`text-[10px] text-center mt-2 ${
                                        active
                                          ? "font-semibold text-on-surface"
                                          : "text-outline"
                                      }`}
                                    >
                                      {label}
                                    </span>
                                  </div>
                                )
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* ASSIGNED WORKER */}

                    <div className="p-3 rounded-lg flex items-center justify-between gap-3 bg-surface-container-low">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                          MW
                        </div>

                        <div>
                          <p className="font-bold text-sm">
                            {activeComplaint.assignedWorker
                              ? `Worker #${activeComplaint.assignedWorker}`
                              : "Worker not assigned"}
                          </p>

                          <p className="text-xs text-on-surface-variant">
                            {activeComplaint.assignedWorker
                              ? "Municipal worker assigned"
                              : "Waiting for municipal assignment"}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs px-2 py-1 rounded-full font-semibold bg-surface-container-high">
                        {activeComplaint.status}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* ==================================================
                  REPORT METRICS
              ================================================== */}

              <div className="grid grid-cols-3 gap-2 mt-3">

                {/* PENDING */}

                <div className="p-3 rounded-lg text-center bg-surface-container-low">
                  <span className="block text-xl font-bold">
                    {loadingReports
                      ? "..."
                      : reportStatistics.pending}
                  </span>

                  <span className="text-xs text-outline">
                    Pending
                  </span>
                </div>

                {/* IN PROGRESS */}

                <div className="p-3 rounded-lg text-center bg-secondary-container/40">
                  <span className="block text-xl font-bold text-secondary">
                    {loadingReports
                      ? "..."
                      : reportStatistics.inProgress}
                  </span>

                  <span className="text-xs text-secondary font-semibold">
                    In Progress
                  </span>
                </div>

                {/* RESOLVED */}

                <div className="p-3 rounded-lg text-center bg-surface-container-low">
                  <span className="block text-xl font-bold text-primary">
                    {loadingReports
                      ? "..."
                      : reportStatistics.resolved}
                  </span>

                  <span className="text-xs text-outline">
                    Resolved
                  </span>
                </div>
              </div>
            </section>

            {/* ==================================================
                ECO IMPACT
            ================================================== */}

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-[#131b2e]">
                  Your Civic Eco-Impact
                </h2>

                <span className="text-xs font-bold text-primary">
                  Updated Now
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">

                {/* CLEANUP */}

                <div className="p-3 rounded-xl shadow-sm text-center bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    diversity_3
                  </span>

                  <p className="text-xl font-bold mt-1">
                    0
                  </p>

                  <p className="text-xs text-on-surface-variant">
                    Cleanup Drives
                  </p>
                </div>

                {/* TREES */}

                <div className="p-3 rounded-xl shadow-sm text-center bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-tertiary text-3xl">
                    nature_people
                  </span>

                  <p className="text-xl font-bold mt-1">
                    0
                  </p>

                  <p className="text-xs text-on-surface-variant">
                    Trees Planted
                  </p>
                </div>

                {/* WASTE REPORTS */}

                <div className="p-3 rounded-xl shadow-sm text-center bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-secondary text-3xl">
                    assignment_turned_in
                  </span>

                  <p className="text-xl font-bold mt-1">
                    {loadingReports
                      ? "..."
                      : reportStatistics.total}
                  </p>

                  <p className="text-xs text-on-surface-variant">
                    Waste Reports
                  </p>
                </div>
              </div>

              <p className="text-xs mt-2 text-on-surface-variant">
                Cleanup Drives and Trees Planted will become
                dynamic after those modules are connected to
                the backend.
              </p>
            </section>

            {/* ==================================================
                RECENT UPDATES
            ================================================== */}

            <section className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-[#131b2e]">
                  Recent Updates
                </h2>

                <button
                  onClick={() =>
                    navigate("/notifications")
                  }
                  className="text-xs font-bold text-primary"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">

                {/* COMPLAINT UPDATE */}

                {activeComplaint && (
                  <div className="p-3 rounded-xl shadow-sm flex gap-3 bg-surface-container-lowest">
                    <div className="w-9 h-9 rounded-lg bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">
                        assignment
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-sm">
                        Your complaint is{" "}
                        {activeComplaint.status}
                      </p>

                      <p className="text-xs mt-1 text-on-surface-variant">
                        {activeComplaint.title}
                      </p>

                      <span className="text-xs mt-1 block text-outline">
                        Latest complaint update
                      </span>
                    </div>
                  </div>
                )}

                {/* WASTE REPORT UPDATE */}

                {wasteReports.length > 0 && (
                  <div className="p-3 rounded-xl shadow-sm flex gap-3 bg-surface-container-lowest">
                    <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">
                        delete_sweep
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-sm">
                        Your waste reports are being tracked
                      </p>

                      <p className="text-xs mt-1 text-on-surface-variant">
                        You have submitted{" "}
                        {wasteReports.length} waste{" "}
                        {wasteReports.length === 1
                          ? "report"
                          : "reports"}.
                      </p>

                      <span className="text-xs mt-1 block text-outline">
                        Data loaded from your account
                      </span>
                    </div>
                  </div>
                )}

                {/* EMPTY STATE */}

                {!activeComplaint &&
                  wasteReports.length === 0 && (
                    <div className="p-4 rounded-xl shadow-sm text-center bg-surface-container-lowest">
                      <span className="material-symbols-outlined text-primary text-3xl">
                        notifications_none
                      </span>

                      <p className="font-bold mt-2">
                        No recent updates
                      </p>

                      <p className="text-xs mt-1 text-on-surface-variant">
                        Your latest activity will appear
                        here.
                      </p>
                    </div>
                  )}
              </div>
            </section>

            {/* ==================================================
                DASHBOARD ERROR
            ================================================== */}

            {dashboardError && (
              <div className="p-3 rounded-lg text-sm bg-yellow-100 text-yellow-900">
                {dashboardError}
              </div>
            )}
          </div>
        </main>

        {/* ==================================================
            CITIZEN NAVIGATION DRAWER
        ================================================== */}

        {drawerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={closeDrawer}
            ></div>

            <aside className="fixed top-0 right-0 w-[85vw] max-w-sm h-full z-[70] shadow-2xl overflow-y-auto bg-white text-[#131b2e]">

              <div className="h-16 px-4 flex items-center justify-between sticky top-0 bg-[#f2f3ff] text-[#131b2e]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">
                      eco
                    </span>
                  </div>

                  <span className="font-bold text-primary">
                    EcoTrack
                  </span>
                </div>

                <button
                  onClick={closeDrawer}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined">
                    close
                  </span>
                </button>
              </div>

              <div className="p-4 space-y-6">

                {/* CITIZEN PORTAL */}

                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-bold px-3 mb-2">
                    Citizen Portal
                  </p>

                  <nav className="space-y-1">
                    {citizenLinks.map(
                      ([id, label, icon]) => (
                        <button
                          key={id}
                          onClick={() =>
                            navigateCitizen(label)
                          }
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors text-[#131b2e] hover:bg-surface-container"
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
                  </nav>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* ==================================================
            BOTTOM NAVIGATION
        ================================================== */}

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg bg-white border-[#eaedff]">

          <div className="max-w-7xl mx-auto h-20 px-2 sm:px-4 flex items-center justify-around">

            {/* HOME */}

            <Link
              to="/"
              className="flex-1 max-w-[120px] h-full flex flex-col items-center justify-center gap-1 transition text-[#4b554f] hover:text-[#006948]"
            >
              <span className="material-symbols-outlined text-[25px]">
                home
              </span>

              <span className="text-[11px] sm:text-xs font-medium">
                Home
              </span>
            </Link>

            {/* CITIZEN DASHBOARD */}

            <Link
              to="/citizen"
              className="flex-1 max-w-[120px] h-full flex flex-col items-center justify-center gap-1 transition text-primary"
            >
              <span className="material-symbols-outlined text-[25px]">
                dashboard
              </span>

              <span className="text-[11px] sm:text-xs font-semibold text-center leading-tight">
                Citizen Dashboard
              </span>
            </Link>

            {/* COMMUNITY */}

            <Link
              to="/community-activities"
              className="flex-1 max-w-[120px] h-full flex flex-col items-center justify-center gap-1 transition text-[#4b554f] hover:text-[#006948]"
            >
              <span className="material-symbols-outlined text-[25px]">
                groups
              </span>

              <span className="text-[11px] sm:text-xs font-medium">
                Community
              </span>
            </Link>

            {/* MY COMPLAINTS */}

            <Link
              to="/my-complaints"
              className="flex-1 max-w-[120px] h-full flex flex-col items-center justify-center gap-1 transition text-[#4b554f] hover:text-[#006948]"
            >
              <span className="material-symbols-outlined text-[25px]">
                assignment
              </span>

              <span className="text-[11px] sm:text-xs font-medium text-center">
                My Complaints
              </span>
            </Link>

            {/* PROFILE */}

            <Link
              to="/profile"
              className="flex-1 max-w-[120px] h-full flex flex-col items-center justify-center gap-1 transition text-[#4b554f] hover:text-[#006948]"
            >
              <span className="material-symbols-outlined text-[25px]">
                account_circle
              </span>

              <span className="text-[11px] sm:text-xs font-medium">
                Profile
              </span>
            </Link>

          </div>
        </nav>
      </div>
    </div>
  );
}