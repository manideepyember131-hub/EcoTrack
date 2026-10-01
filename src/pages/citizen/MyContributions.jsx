import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

const MyContributions = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const [summary, setSummary] = useState({
    totalPoints: 0,
    totalReports: 0,
    totalCollections: 0,
    totalActivities: 0,
    totalTreeEvents: 0,
  });

  const [activities, setActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // CURRENT LOGGED-IN USER
  // ==================================================

  const getCurrentUserId = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);

      return user?.id || user?.userId || null;
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      return null;
    }
  };

  // ==================================================
  // FETCH MY CONTRIBUTIONS
  // ==================================================

  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getCurrentUserId();

      if (!userId) {
        throw new Error(
          "Unable to identify the logged-in user."
        );
      }

      console.log(
        "Fetching contributions for logged-in user:",
        userId
      );

      // Backend route:
      // /api/my-contributions/:userId
      const response = await fetch(
        `${API_BASE_URL}/api/my-contributions/${userId}`
      );

      // ------------------------------------------------
      // SAFELY READ RESPONSE
      // ------------------------------------------------

      const responseText = await response.text();

      console.log(
        "My Contributions API status:",
        response.status
      );

      console.log(
        "My Contributions raw API response:",
        responseText
      );

      let data = null;

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Unable to parse My Contributions API response:",
            parseError
          );

          throw new Error(
            `Server returned an invalid response. HTTP ${response.status}.`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Failed to fetch contributions. HTTP ${response.status}.`
        );
      }

      if (!data) {
        throw new Error(
          "The contributions API returned an empty response."
        );
      }

      if (data.success === false) {
        throw new Error(
          data.message ||
            "Failed to fetch contributions."
        );
      }

      console.log(
        "My Contributions API response:",
        data
      );

      // ----------------------------------------------
      // SUMMARY
      // ----------------------------------------------

      setSummary({
        totalPoints: Number(
          data.summary?.totalPoints || 0
        ),

        totalReports: Number(
          data.summary?.totalReports || 0
        ),

        totalCollections: Number(
          data.summary?.totalCollections || 0
        ),

        totalActivities: Number(
          data.summary?.totalActivities || 0
        ),

        totalTreeEvents: Number(
          data.summary?.totalTreeEvents || 0
        ),
      });

      // ----------------------------------------------
      // RECENT CONTRIBUTIONS
      // ----------------------------------------------

      setActivities(
        Array.isArray(data.recentContributions)
          ? data.recentContributions
          : []
      );

      // ----------------------------------------------
      // ACHIEVEMENTS
      // ----------------------------------------------

      setAchievements(
        Array.isArray(data.achievements)
          ? data.achievements
          : []
      );
    } catch (error) {
      console.error(
        "Error fetching My Contributions:",
        error
      );

      setError(
        error.message ||
          "Unable to load your contributions."
      );

      // Reset data when request fails
      setSummary({
        totalPoints: 0,
        totalReports: 0,
        totalCollections: 0,
        totalActivities: 0,
        totalTreeEvents: 0,
      });

      setActivities([]);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    fetchContributions();
  }, []);

  // ==================================================
  // STATISTICS
  // ==================================================

  const stats = [
    {
      icon: "eco",
      value: summary.totalPoints.toLocaleString(),
      label: "Eco Points",
      description: "Total points earned",
    },

    {
      icon: "report_problem",
      value: summary.totalReports.toLocaleString(),
      label: "Waste Reports",
      description: "Issues reported",
    },

    {
      icon: "local_shipping",
      value:
        summary.totalCollections.toLocaleString(),
      label: "Collections",
      description: "Collections completed",
    },

    {
      icon: "park",
      value:
        summary.totalTreeEvents.toLocaleString(),
      label: "Tree Activities",
      description:
        "Tree planting events joined",
    },
  ];

  // ==================================================
  // ACTIVITY ICON
  // ==================================================

  const getActivityIcon = (activityType) => {
    const type = String(
      activityType || ""
    ).toLowerCase();

    if (
      type.includes("report") ||
      type.includes("waste")
    ) {
      return "report_problem";
    }

    if (
      type.includes("tree") ||
      type.includes("plant")
    ) {
      return "park";
    }

    if (
      type.includes("collection") ||
      type.includes("collect")
    ) {
      return "local_shipping";
    }

    if (
      type.includes("community") ||
      type.includes("activity")
    ) {
      return "groups";
    }

    if (type.includes("recycl")) {
      return "recycling";
    }

    return "eco";
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatActivityDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen pb-24 bg-[#faf8ff] text-[#131b2e]">
        <div className="px-4 pt-6 pb-5 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#006948] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">
                  eco
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  My Contributions
                </h1>

                <p className="text-sm text-[#3d4a42]">
                  Track your positive impact on the
                  community
                </p>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <span className="material-symbols-outlined text-[#006948] text-[40px] animate-spin">
                progress_activity
              </span>

              <p className="mt-3 text-sm text-[#6d7a72]">
                Loading your contributions...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==================================================
  // MAIN UI
  // ==================================================

  return (
    <div className="min-h-screen pb-24 bg-[#faf8ff] text-[#131b2e]">

      {/* HEADER */}

      <div className="px-4 pt-6 pb-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-[#006948] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">
                eco
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#131b2e]">
                My Contributions
              </h1>

              <p className="text-sm text-[#3d4a42]">
                Track your positive impact on the
                community
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* MAIN */}

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-5">

        {/* ERROR */}

        {error && (
          <div className="rounded-2xl p-4 border bg-red-50 border-red-200 text-red-700">
            <div className="flex items-start gap-3">

              <span className="material-symbols-outlined">
                error
              </span>

              <div className="flex-1">

                <p className="font-semibold">
                  Unable to load contributions
                </p>

                <p className="text-sm mt-1">
                  {error}
                </p>

                <button
                  onClick={fetchContributions}
                  className="mt-3 px-4 py-2 rounded-lg bg-[#006948] text-white text-sm font-semibold"
                >
                  Try Again
                </button>

              </div>
            </div>
          </div>
        )}

        {/* ECO SCORE */}

        <section className="rounded-2xl bg-gradient-to-r from-[#006948] to-[#00855d] p-5 text-white shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-sm opacity-90">
                Your Eco Impact
              </p>

              <h2 className="text-4xl font-bold mt-1">
                {summary.totalPoints.toLocaleString()}
              </h2>

              <p className="text-sm mt-1 opacity-90">
                Eco Points
              </p>
            </div>

            <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[38px]">
                workspace_premium
              </span>
            </div>

          </div>

          <div className="mt-5">

            <div className="flex justify-between text-xs mb-2">
              <span>
                Next achievement
              </span>

              <span>
                1,500 points
              </span>
            </div>

            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${Math.min(
                    (summary.totalPoints / 1500) * 100,
                    100
                  )}%`,
                }}
              />
            </div>

            <p className="text-xs mt-2 opacity-90">
              {summary.totalPoints >= 1500
                ? "You've reached the next achievement milestone!"
                : `${(
                    1500 - summary.totalPoints
                  ).toLocaleString()} more points to reach the next achievement`}
            </p>

          </div>
        </section>

        {/* TABS */}

        <div className="flex gap-2 p-1 rounded-xl bg-[#eaeedf]">

          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === "overview"
                ? "bg-[#006948] text-white"
                : "text-[#3d4a42]"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() =>
              setActiveTab("achievements")
            }
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === "achievements"
                ? "bg-[#006948] text-white"
                : "text-[#3d4a42]"
            }`}
          >
            Achievements
          </button>

        </div>

        {/* OVERVIEW */}

        {activeTab === "overview" && (
          <>

            {/* STATISTICS */}

            <section>

              <h2 className="text-lg font-bold mb-3 text-[#131b2e]">
                Your Impact
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl p-4 shadow-sm bg-white"
                  >

                    <div className="flex items-center justify-between">

                      <span className="material-symbols-outlined text-[#006948]">
                        {stat.icon}
                      </span>

                      <span className="text-2xl font-bold text-[#131b2e]">
                        {stat.value}
                      </span>

                    </div>

                    <p className="text-sm font-semibold mt-3 text-[#131b2e]">
                      {stat.label}
                    </p>

                    <p className="text-xs mt-1 text-[#6d7a72]">
                      {stat.description}
                    </p>

                  </div>
                ))}

              </div>

            </section>

            {/* ENVIRONMENTAL IMPACT */}

            <section className="rounded-2xl p-5 bg-white shadow-sm">

              <div className="flex items-center gap-3 mb-4">

                <div className="w-10 h-10 rounded-xl bg-[#85f8c4] text-[#005137] flex items-center justify-center">
                  <span className="material-symbols-outlined">
                    nature_people
                  </span>
                </div>

                <div>

                  <h2 className="font-bold text-lg">
                    Environmental Impact
                  </h2>

                  <p className="text-sm text-[#6d7a72]">
                    Your contribution so far
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div className="rounded-xl p-4 bg-[#f2f3ff]">

                  <span className="material-symbols-outlined text-[#006948]">
                    delete_sweep
                  </span>

                  <p className="text-2xl font-bold mt-2">
                    —
                  </p>

                  <p className="text-sm opacity-70">
                    Waste diverted
                  </p>

                </div>

                <div className="rounded-xl p-4 bg-[#f2f3ff]">

                  <span className="material-symbols-outlined text-[#006948]">
                    co2
                  </span>

                  <p className="text-2xl font-bold mt-2">
                    —
                  </p>

                  <p className="text-sm opacity-70">
                    CO₂ impact reduced
                  </p>

                </div>

                <div className="rounded-xl p-4 bg-[#f2f3ff]">

                  <span className="material-symbols-outlined text-[#006948]">
                    water_drop
                  </span>

                  <p className="text-2xl font-bold mt-2">
                    —
                  </p>

                  <p className="text-sm opacity-70">
                    Resources conserved
                  </p>

                </div>

              </div>

            </section>

            {/* RECENT CONTRIBUTIONS */}

            <section className="rounded-2xl p-5 bg-white shadow-sm">

              <div className="flex items-center justify-between mb-4">

                <h2 className="text-lg font-bold">
                  Recent Contributions
                </h2>

                <span className="text-xs font-semibold text-[#006948]">
                  Activity
                </span>

              </div>

              {activities.length === 0 ? (

                <div className="py-8 text-center">

                  <span className="material-symbols-outlined text-[36px] text-[#006948]">
                    eco
                  </span>

                  <p className="font-semibold mt-2">
                    No contributions yet
                  </p>

                  <p className="text-sm mt-1 text-[#6d7a72]">
                    Your recent eco activities will
                    appear here.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {activities.map((activity) => (

                    <div
                      key={
                        activity.id ||
                        activity._id ||
                        `${activity.activityType}-${activity.createdAt}`
                      }
                      className="flex items-start gap-3"
                    >

                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#f2f3ff]">

                        <span className="material-symbols-outlined text-[#006948]">
                          {getActivityIcon(
                            activity.activityType
                          )}
                        </span>

                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex justify-between gap-2">

                          <p className="font-semibold text-sm">
                            {activity.description ||
                              activity.activityType}
                          </p>

                          <span className="text-xs text-[#006948] font-bold whitespace-nowrap">
                            {activity.points > 0
                              ? `+${activity.points} points`
                              : `${activity.points || 0} points`}
                          </span>

                        </div>

                        <p className="text-xs mt-1 text-[#6d7a72]">
                          {activity.activityType}
                        </p>

                        <p className="text-xs mt-1 text-[#8a958e]">
                          {formatActivityDate(
                            activity.createdAt
                          )}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          </>
        )}

        {/* ACHIEVEMENTS */}

        {activeTab === "achievements" && (

          <section>

            <h2 className="text-lg font-bold mb-3">
              Achievements
            </h2>

            {achievements.length === 0 ? (

              <div className="rounded-2xl p-8 text-center shadow-sm bg-white">

                <span className="material-symbols-outlined text-[40px] text-[#006948]">
                  workspace_premium
                </span>

                <p className="font-semibold mt-2">
                  No achievements available
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {achievements.map((achievement) => (

                  <div
                    key={achievement.title}
                    className={`rounded-2xl p-5 shadow-sm bg-white ${
                      !achievement.unlocked
                        ? "opacity-60"
                        : ""
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          achievement.unlocked
                            ? "bg-[#85f8c4] text-[#005137]"
                            : "bg-[#e2e7ff] text-[#6d7a72]"
                        }`}
                      >

                        <span className="material-symbols-outlined text-[26px]">
                          {achievement.icon}
                        </span>

                      </div>

                      <div className="flex-1">

                        <div className="flex justify-between gap-2">

                          <h3 className="font-bold">
                            {achievement.title}
                          </h3>

                          {achievement.unlocked && (
                            <span className="material-symbols-outlined text-[#006948] text-[20px]">
                              verified
                            </span>
                          )}

                        </div>

                        <p className="text-sm mt-1 text-[#6d7a72]">
                          {achievement.description}
                        </p>

                        <p className="text-xs mt-2 font-semibold text-[#006948]">
                          {achievement.unlocked
                            ? "Unlocked"
                            : "Locked"}
                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        )}

      </main>

    </div>
  );
};

export default MyContributions;