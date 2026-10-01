import { useState } from "react";

function ReportWaste() {
  const [category, setCategory] = useState("Dry");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [problemType, setProblemType] = useState("overflowing");

  // GPS coordinates
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reportId, setReportId] = useState("");

  const categories = [
    ["Wet", "🍏 Wet / Organic"],
    ["Dry", "📦 Dry Waste"],
    ["Recyclable", "♻️ Recyclable"],
    ["Hazardous", "⚠️ Hazardous"],
    ["E-Waste", "💻 E-Waste"],
    ["Construction", "🧱 Construction"],
    ["Mixed", "🔀 Mixed"],
  ];

  // ======================================================
  // GET LOGGED-IN USER
  // ======================================================

  const getLoggedInUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error(
        "Failed to read logged-in user:",
        error
      );
      return null;
    }
  };

  // ======================================================
  // GPS LOCATION
  // ======================================================

  const useCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "GPS location is not supported by this browser."
      );
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log("GPS latitude:", lat);
        console.log("GPS longitude:", lng);

        setLatitude(lat);
        setLongitude(lng);

        setLocation(
          `GPS Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`
        );

        setGpsLoading(false);
      },

      (gpsError) => {
        console.error("GPS error:", gpsError);

        setGpsLoading(false);

        switch (gpsError.code) {
          case gpsError.PERMISSION_DENIED:
            setError(
              "Location permission was denied. Please allow location access and try again."
            );
            break;

          case gpsError.POSITION_UNAVAILABLE:
            setError(
              "Your current location could not be determined."
            );
            break;

          case gpsError.TIMEOUT:
            setError(
              "Getting your location timed out. Please try again."
            );
            break;

          default:
            setError(
              "Unable to get your current location."
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ======================================================
  // SUBMIT WASTE REPORT
  // ======================================================

  const submitWasteReport = async (e) => {
    e.preventDefault();

    setError("");

    // ------------------------------------------
    // Validate location text
    // ------------------------------------------

    if (!location.trim()) {
      setError(
        "Please use GPS Location to identify the incident location."
      );
      return;
    }

    // ------------------------------------------
    // Validate GPS coordinates
    // ------------------------------------------

    if (
      latitude === null ||
      longitude === null
    ) {
      setError(
        "Please use GPS Location before submitting the report."
      );
      return;
    }

    // ------------------------------------------
    // Validate description
    // ------------------------------------------

    if (!description.trim()) {
      setError(
        "Please describe the waste issue."
      );
      return;
    }

    // ------------------------------------------
    // Get logged-in user
    // ------------------------------------------

    const loggedInUser = getLoggedInUser();

    console.log(
      "Logged-in user:",
      loggedInUser
    );

    if (
      !loggedInUser ||
      !loggedInUser.id
    ) {
      setError(
        "Unable to identify the logged-in user. Please log in again."
      );
      return;
    }

    const reportedBy =
      loggedInUser.id;

    console.log(
      "Reporting waste for user ID:",
      reportedBy
    );

    // ------------------------------------------
    // Start submission
    // ------------------------------------------

    setSubmitting(true);
    setSubmitted(false);

    try {
      // ------------------------------------------
      // Prepare request
      // ------------------------------------------

      const requestBody = {
        title: `${problemType} - ${category} Waste`,
        description:
          description.trim(),
        wasteType: category,
        location:
          location.trim(),

        latitude:
          latitude,

        longitude:
          longitude,

        reportedBy:
          reportedBy,
      };

      console.log(
        "Sending waste report:",
        requestBody
      );

      // ------------------------------------------
      // Send request to backend
      // ------------------------------------------

      const response =
        await fetch(
          `${import.meta.env.VITE_API_URL}/api/waste-reports`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                requestBody
              ),
          }
        );

      const data =
        await response.json();

      console.log(
        "Waste report response:",
        data
      );

      // ------------------------------------------
      // Handle backend error
      // ------------------------------------------

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to submit waste report."
        );
      }

      // ------------------------------------------
      // Save report ID
      // ------------------------------------------

      if (data.reportId) {
        setReportId(
          data.reportId
        );
      }

      if (data.data?.id) {
        setReportId(
          data.data.id
        );
      }

      // ------------------------------------------
      // Successful submission
      // ------------------------------------------

      setSubmitted(true);

      // Clear form fields
      setLocation("");
      setDescription("");
      setProblemType(
        "overflowing"
      );
      setCategory("Dry");

      // Clear GPS coordinates
      setLatitude(null);
      setLongitude(null);

    } catch (error) {
      console.error(
        "Waste report submission error:",
        error
      );

      setError(
        error.message ||
          "Unable to submit waste report."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // SUCCESS SCREEN
  // ======================================================

  if (submitted) {
    return (
      <div
        className="
          min-h-screen
          bg-[#faf8ff]
          dark:bg-[#0b1120]
          text-[#131b2e]
          dark:text-white
          flex
          items-center
          justify-center
          px-4
          transition-colors
          duration-300
        "
      >

        <div
          className="
            w-full
            max-w-md
            bg-white
            dark:bg-slate-900
            rounded-2xl
            shadow-md
            dark:shadow-black/30
            border
            border-[#eaedff]
            dark:border-slate-800
            p-6
            text-center
          "
        >

          <div className="flex justify-center mb-4">

            <div
              className="
                w-16
                h-16
                rounded-full
                bg-[#85f8c4]
                dark:bg-emerald-900/60
                text-[#006948]
                dark:text-emerald-300
                flex
                items-center
                justify-center
              "
            >
              <span className="material-symbols-outlined text-4xl">
                check_circle
              </span>
            </div>

          </div>

          <h1 className="text-2xl font-bold">
            Report Submitted
          </h1>

          <p
            className="
              text-sm
              text-[#6d7a72]
              dark:text-slate-300
              mt-2
            "
          >
            Your waste report has been
            submitted successfully.
          </p>

          {reportId && (
            <div
              className="
                mt-4
                p-3
                rounded-xl
                bg-[#f2f3ff]
                dark:bg-slate-800
              "
            >

              <p
                className="
                  text-xs
                  text-[#6d7a72]
                  dark:text-slate-400
                "
              >
                Report ID
              </p>

              <p className="font-bold mt-1">
                #{reportId}
              </p>

            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setReportId("");
            }}
            className="
              w-full
              mt-5
              h-11
              rounded-xl
              bg-[#006948]
              hover:bg-[#00553b]
              text-white
              font-semibold
              transition
            "
          >
            Report Another Waste
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // MAIN PAGE
  // ======================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#faf8ff]
        dark:bg-[#0b1120]
        text-[#131b2e]
        dark:text-white
        pb-10
        transition-colors
        duration-300
      "
    >

      {/* HEADER */}

      <header
        className="
          bg-white
          dark:bg-slate-900
          border-b
          border-[#eaedff]
          dark:border-slate-800
        "
      >

        <div className="max-w-3xl mx-auto px-5 py-5">

          <h1
            className="
              text-2xl
              font-bold
              text-[#006948]
              dark:text-emerald-400
            "
          >
            Report Waste
          </h1>

          <p
            className="
              text-sm
              text-[#6d7a72]
              dark:text-slate-300
              mt-1
            "
          >
            Report a waste issue in your area
          </p>

        </div>

      </header>

      {/* MAIN */}

      <main
        className="
          max-w-3xl
          mx-auto
          px-5
          py-6
        "
      >

        <form
          onSubmit={
            submitWasteReport
          }
          className="space-y-5"
        >

          {/* ERROR */}

          {error && (
            <div
              className="
                p-4
                rounded-xl
                bg-red-100
                dark:bg-red-950/40
                text-red-700
                dark:text-red-300
                text-sm
                border
                border-red-200
                dark:border-red-900
              "
            >

              <div className="flex items-start gap-2">

                <span className="material-symbols-outlined text-[20px]">
                  error
                </span>

                <p>{error}</p>

              </div>

            </div>
          )}

          {/* WASTE TYPE */}

          <section
            className="
              bg-white
              dark:bg-slate-900
              rounded-2xl
              shadow-sm
              dark:shadow-black/30
              border
              border-[#eaedff]
              dark:border-slate-800
              p-5
            "
          >

            <h2 className="font-bold text-lg mb-4">
              Waste Type
            </h2>

            <div className="space-y-2">

              <label
                htmlFor="category"
                className="block text-sm font-bold"
              >
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-lg
                  bg-gray-100
                  dark:bg-slate-800
                  text-slate-900
                  dark:text-white
                  border
                  border-transparent
                  dark:border-slate-700
                  outline-none
                  focus:ring-2
                  focus:ring-green-600
                "
              >

                {categories.map(
                  ([value, label]) => (
                    <option
                      key={value}
                      value={value}
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {label}
                    </option>
                  )
                )}

              </select>

            </div>

          </section>

          {/* PROBLEM TYPE */}

          <section
            className="
              bg-white
              dark:bg-slate-900
              rounded-2xl
              shadow-sm
              dark:shadow-black/30
              border
              border-[#eaedff]
              dark:border-slate-800
              p-5
            "
          >

            <h2 className="font-bold text-lg mb-4">
              Waste Problem
            </h2>

            <div className="space-y-2">

              <label
                htmlFor="problem-type"
                className="block text-sm font-bold"
              >
                Problem Type
              </label>

              <select
                id="problem-type"
                value={problemType}
                onChange={(e) =>
                  setProblemType(
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-lg
                  bg-gray-100
                  dark:bg-slate-800
                  text-slate-900
                  dark:text-white
                  border
                  border-transparent
                  dark:border-slate-700
                  outline-none
                  focus:ring-2
                  focus:ring-green-600
                "
              >

                <option
                  value="overflowing"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  Overflowing municipal garbage bin
                </option>

                <option
                  value="missed"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  Missed neighborhood collection schedule
                </option>

                <option
                  value="dumping"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  Illegal open waste dumping
                </option>

                <option
                  value="roadside"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  Roadside / sidewalk scattered waste
                </option>

                <option
                  value="public_area"
                  className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  Public park or recreation area debris
                </option>

              </select>

            </div>

          </section>

          {/* LOCATION */}

          <section
            className="
              bg-white
              dark:bg-slate-900
              rounded-2xl
              shadow-sm
              dark:shadow-black/30
              border
              border-[#eaedff]
              dark:border-slate-800
              p-5
            "
          >

            <div className="flex items-center justify-between gap-2">

              <label
                htmlFor="manual-location"
                className="text-sm font-bold"
              >
                Incident Location
              </label>

              <button
                type="button"
                onClick={
                  useCurrentLocation
                }
                disabled={
                  gpsLoading
                }
                className="
                  flex
                  items-center
                  gap-1
                  text-green-700
                  dark:text-green-400
                  text-sm
                  font-bold
                  hover:underline
                  disabled:opacity-60
                "
              >

                <span className="material-symbols-outlined text-base">
                  my_location
                </span>

                {gpsLoading
                  ? "Getting Location..."
                  : "Use GPS Location"}

              </button>

            </div>

            <div className="mt-3">

              <input
                id="manual-location"
                type="text"
                value={location}
                readOnly
                placeholder="Click 'Use GPS Location'"
                className="
                  w-full
                  h-12
                  px-4
                  rounded-lg
                  bg-gray-100
                  dark:bg-slate-800
                  text-slate-900
                  dark:text-white
                  placeholder:text-slate-500
                  dark:placeholder:text-slate-400
                  border
                  border-transparent
                  dark:border-slate-700
                  outline-none
                "
              />

            </div>

            {/* GPS STATUS */}

            {latitude !== null &&
              longitude !== null && (
                <div
                  className="
                    mt-3
                    p-3
                    rounded-xl
                    bg-[#eafdf5]
                    dark:bg-emerald-950/40
                    text-[#006948]
                    dark:text-emerald-300
                    border
                    border-transparent
                    dark:border-emerald-900
                  "
                >

                  <div className="flex items-center gap-2">

                    <span className="material-symbols-outlined text-[20px]">
                      location_on
                    </span>

                    <p className="text-sm font-semibold">
                      GPS location captured
                    </p>

                  </div>

                  <p className="text-xs mt-1">
                    Latitude:{" "}
                    {latitude.toFixed(7)}
                  </p>

                  <p className="text-xs">
                    Longitude:{" "}
                    {longitude.toFixed(7)}
                  </p>

                </div>
              )}

          </section>

          {/* DESCRIPTION */}

          <section
            className="
              bg-white
              dark:bg-slate-900
              rounded-2xl
              shadow-sm
              dark:shadow-black/30
              border
              border-[#eaedff]
              dark:border-slate-800
              p-5
            "
          >

            <label
              htmlFor="description"
              className="block text-sm font-bold mb-2"
            >
              Describe the Waste Issue
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={5}
              placeholder="Describe what you observed..."
              className="
                w-full
                px-4
                py-3
                rounded-lg
                bg-gray-100
                dark:bg-slate-800
                text-slate-900
                dark:text-white
                placeholder:text-slate-500
                dark:placeholder:text-slate-400
                border
                border-transparent
                dark:border-slate-700
                outline-none
                resize-none
                focus:ring-2
                focus:ring-green-600
              "
            />

          </section>

          {/* GPS WARNING */}

          {(latitude === null ||
            longitude === null) && (
            <div
              className="
                p-4
                rounded-xl
                bg-[#fff4d6]
                dark:bg-amber-950/40
                text-[#8a6200]
                dark:text-amber-300
                border
                border-transparent
                dark:border-amber-900
              "
            >

              <div className="flex items-start gap-2">

                <span className="material-symbols-outlined">
                  location_on
                </span>

                <div>

                  <p className="font-semibold text-sm">
                    GPS location required
                  </p>

                  <p className="text-xs mt-1">
                    Please click "Use GPS Location"
                    before submitting your report.
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              submitting ||
              gpsLoading ||
              latitude === null ||
              longitude === null
            }
            className="
              w-full
              h-12
              rounded-xl
              bg-[#006948]
              hover:bg-[#00553b]
              dark:bg-emerald-700
              dark:hover:bg-emerald-600
              text-white
              font-bold
              transition
              disabled:opacity-60
              disabled:cursor-not-allowed
              flex
              items-center
              justify-center
              gap-2
            "
          >

            <span className="material-symbols-outlined">
              {submitting
                ? "progress_activity"
                : "send"}
            </span>

            {submitting
              ? "Submitting Report..."
              : "Submit Waste Report"}

          </button>

        </form>

      </main>

    </div>
  );
}

export default ReportWaste;