import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

const API_URL =
  `${import.meta.env.VITE_API_URL}/api/recycling-centers/nearby`;

const DEFAULT_CENTER = [
  17.385044,
  78.486671,
];

/*
|--------------------------------------------------------------------------
| WASTE TYPES
|--------------------------------------------------------------------------
*/

const WASTE_TYPES = [
  "Plastic",
  "Paper",
  "Cardboard",
  "Glass",
  "Metal",
  "E-Waste",
  "Batteries",
  "Wet Waste",
  "Organic",
  "Hazardous",
];

/*
|--------------------------------------------------------------------------
| WASTE TYPE NORMALIZER
|--------------------------------------------------------------------------
*/

const normalizeWasteTypes = (wasteTypes) => {
  if (Array.isArray(wasteTypes)) {
    return wasteTypes
      .map((type) => String(type).trim())
      .filter(Boolean);
  }

  if (
    wasteTypes === null ||
    wasteTypes === undefined
  ) {
    return [];
  }

  if (typeof wasteTypes === "string") {
    const trimmed = wasteTypes.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed
          .map((type) => String(type).trim())
          .filter(Boolean);
      }
    } catch (error) {
      // Treat as comma-separated text.
    }

    return trimmed
      .split(",")
      .map((type) => type.trim())
      .filter(Boolean);
  }

  return [];
};

/*
|--------------------------------------------------------------------------
| MAP CONTROLLER
|--------------------------------------------------------------------------
*/

function MapController({
  userLocation,
  facilities,
  selectedFacility,
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedFacility) {
      const lat = Number(
        selectedFacility.latitude
      );

      const lng = Number(
        selectedFacility.longitude
      );

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        map.flyTo(
          [lat, lng],
          16,
          {
            duration: 0.8,
          }
        );
      }

      return;
    }

    if (userLocation) {
      map.flyTo(
        [
          userLocation.latitude,
          userLocation.longitude,
        ],
        14,
        {
          duration: 0.8,
        }
      );

      return;
    }

    if (facilities.length > 0) {
      const first = facilities[0];

      const lat = Number(first.latitude);
      const lng = Number(first.longitude);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        map.flyTo(
          [lat, lng],
          14,
          {
            duration: 0.8,
          }
        );
      }
    }
  }, [
    map,
    userLocation,
    facilities,
    selectedFacility,
  ]);

  return null;
}

/*
|--------------------------------------------------------------------------
| MAP SIZE FIX
|--------------------------------------------------------------------------
*/

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

/*
|--------------------------------------------------------------------------
| FIT FACILITIES
|--------------------------------------------------------------------------
*/

function FitFacilities({
  facilities,
  userLocation,
}) {
  const map = useMap();

  useEffect(() => {
    const points = [];

    if (userLocation) {
      const userLat = Number(
        userLocation.latitude
      );

      const userLng = Number(
        userLocation.longitude
      );

      if (
        Number.isFinite(userLat) &&
        Number.isFinite(userLng)
      ) {
        points.push([
          userLat,
          userLng,
        ]);
      }
    }

    facilities.forEach((facility) => {
      const lat = Number(
        facility.latitude
      );

      const lng = Number(
        facility.longitude
      );

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lng)
      ) {
        points.push([
          lat,
          lng,
        ]);
      }
    });

    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(
        points[0],
        14
      );

      return;
    }

    map.fitBounds(points, {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [
    map,
    facilities,
    userLocation,
  ]);

  return null;
}

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

function RecyclingCenters() {
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [wasteType, setWasteType] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [facilities, setFacilities] =
    useState([]);

  const [userLocation, setUserLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState("");

  const [selectedFacility, setSelectedFacility] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | TOAST
  |--------------------------------------------------------------------------
  */

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /*
  |--------------------------------------------------------------------------
  | GET USER LOCATION
  |--------------------------------------------------------------------------
  */

  const getUserLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const location = {
          latitude,
          longitude,
        };

        setUserLocation(location);

        setLocationLoading(false);

        showToast(
          "Your location has been detected."
        );

        if (wasteType) {
          fetchNearbyCenters(
            wasteType,
            latitude,
            longitude
          );
        }
      },

      (geoError) => {
        console.error(
          "Geolocation error:",
          geoError
        );

        setLocationLoading(false);

        if (geoError.code === 1) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (geoError.code === 2) {
          setError(
            "Your location could not be determined."
          );
        } else {
          setError(
            "Unable to get your location."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH NEARBY CENTERS
  |--------------------------------------------------------------------------
  */

  const fetchNearbyCenters = async (
    selectedWasteType,
    latitude,
    longitude
  ) => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "Searching recycling centers:",
        {
          wasteType: selectedWasteType,
          latitude,
          longitude,
        }
      );

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },

          body: JSON.stringify({
            wasteType:
              selectedWasteType,

            latitude,
            longitude,
          }),
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        !contentType.includes(
          "application/json"
        )
      ) {
        const responseText =
          await response.text();

        console.error(
          "Backend returned non-JSON:",
          responseText
        );

        throw new Error(
          `Backend returned ${response.status} instead of JSON. Check the recycling-centers route.`
        );
      }

      const result =
        await response.json();

      console.log(
        "Recycling center API response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to find recycling centers."
        );
      }

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to find recycling centers."
        );
      }

      const centers =
        Array.isArray(result.data)
          ? result.data
          : [];

      setFacilities(centers);

      setSelectedFacility(null);

      if (centers.length === 0) {
        showToast(
          `No ${selectedWasteType} centers found nearby.`
        );
      } else {
        showToast(
          `${centers.length} recycling center${
            centers.length === 1
              ? ""
              : "s"
          } found.`
        );
      }
    } catch (err) {
      console.error(
        "Recycling center API error:",
        err
      );

      setFacilities([]);

      setSelectedFacility(null);

      setError(
        err.message ||
          "Unable to find recycling centers."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | WASTE TYPE CHANGE
  |--------------------------------------------------------------------------
  */

  const handleWasteTypeChange = (
    event
  ) => {
    const selectedType =
      event.target.value;

    setWasteType(selectedType);

    setFacilities([]);

    setSelectedFacility(null);

    setError("");

    if (!selectedType) {
      return;
    }

    if (userLocation) {
      fetchNearbyCenters(
        selectedType,
        userLocation.latitude,
        userLocation.longitude
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FIND CENTERS BUTTON
  |--------------------------------------------------------------------------
  */

  const handleFindCenters = () => {
    if (!wasteType) {
      setError(
        "Please select a waste type."
      );

      return;
    }

    if (!userLocation) {
      setError(
        "Please click 'Use My Location' first."
      );

      return;
    }

    fetchNearbyCenters(
      wasteType,
      userLocation.latitude,
      userLocation.longitude
    );
  };

  /*
  |--------------------------------------------------------------------------
  | QUICK WASTE FILTER
  |--------------------------------------------------------------------------
  */

  const handleQuickWasteType = (
    type
  ) => {
    setWasteType(type);

    setError("");

    setFacilities([]);

    setSelectedFacility(null);

    if (!userLocation) {
      showToast(
        "Use My Location to find nearby centers."
      );

      return;
    }

    fetchNearbyCenters(
      type,
      userLocation.latitude,
      userLocation.longitude
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SEARCH FILTER
  |--------------------------------------------------------------------------
  */

  const filteredFacilities =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return facilities;
      }

      return facilities.filter(
        (facility) => {
          const wasteTypesText =
            normalizeWasteTypes(
              facility.waste_types
            )
              .join(" ")
              .toLowerCase();

          return (
            facility.name
              ?.toLowerCase()
              .includes(query) ||

            facility.address
              ?.toLowerCase()
              .includes(query) ||

            facility.city
              ?.toLowerCase()
              .includes(query) ||

            facility.state
              ?.toLowerCase()
              .includes(query) ||

            facility.pincode
              ?.toLowerCase()
              .includes(query) ||

            wasteTypesText.includes(query)
          );
        }
      );
    }, [
      facilities,
      search,
    ]);

  /*
  |--------------------------------------------------------------------------
  | DIRECTIONS
  |--------------------------------------------------------------------------
  */

  const getDirections = (
    facility
  ) => {
    const latitude =
      Number(facility.latitude);

    const longitude =
      Number(facility.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      showToast(
        "Location coordinates are unavailable."
      );

      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${latitude},${longitude}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CALL CENTER
  |--------------------------------------------------------------------------
  */

  const callCenter = (phone) => {
    if (!phone) {
      showToast(
        "Phone number is unavailable."
      );

      return;
    }

    window.location.href =
      `tel:${phone}`;
  };

  /*
  |--------------------------------------------------------------------------
  | MAP CENTER
  |--------------------------------------------------------------------------
  */

  const mapCenter =
    userLocation
      ? [
          userLocation.latitude,
          userLocation.longitude,
        ]
      : DEFAULT_CENTER;

  /*
  |--------------------------------------------------------------------------
  | JSX
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="
        min-h-screen
        p-4 md:p-6
        bg-[#faf8ff]
        text-[#131b2e]
        dark:bg-[#0b1120]
        dark:text-white
        transition-colors
        duration-300
      "
    >
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ==========================================================
            SEARCH + WASTE TYPE
        =========================================================== */}

        <section
          className="
            bg-white
            dark:bg-slate-900
            rounded-2xl
            p-4
            shadow-sm
            dark:shadow-black/30
            border
            border-slate-100
            dark:border-slate-800
          "
        >

          {/* SEARCH */}

          <div className="relative">

            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search center, category or pincode..."
              className="
                w-full
                h-12
                pl-11
                pr-10
                rounded-xl
                border
                outline-none
                focus:ring-2
                focus:ring-emerald-500
                bg-white
                dark:bg-slate-950
                border-slate-200
                dark:border-slate-700
                text-slate-900
                dark:text-white
                placeholder:text-slate-500
                dark:placeholder:text-slate-400
              "
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <span className="material-symbols-outlined text-slate-400">
                  close
                </span>
              </button>
            )}

          </div>

          {/* CONTROLS */}

          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">

            {/* WASTE TYPE */}

            <div>

              <label className="block text-sm font-bold mb-2">
                Waste Type
              </label>

              <div className="relative">

                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                  recycling
                </span>

                <select
                  value={wasteType}
                  onChange={
                    handleWasteTypeChange
                  }
                  className="
                    w-full
                    h-12
                    pl-11
                    pr-10
                    rounded-xl
                    border
                    appearance-none
                    outline-none
                    focus:ring-2
                    focus:ring-emerald-500
                    bg-white
                    dark:bg-slate-950
                    border-slate-200
                    dark:border-slate-700
                    text-slate-900
                    dark:text-white
                  "
                >

                  <option value="">
                    Select waste type
                  </option>

                  {WASTE_TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}

                </select>

                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  expand_more
                </span>

              </div>

            </div>

            {/* LOCATION */}

            <div className="md:self-end">

              <button
                type="button"
                onClick={
                  getUserLocation
                }
                disabled={
                  locationLoading
                }
                className="
                  w-full
                  md:w-auto
                  h-12
                  px-5
                  rounded-xl
                  bg-slate-100
                  hover:bg-slate-200
                  dark:bg-slate-800
                  dark:hover:bg-slate-700
                  text-slate-800
                  dark:text-slate-100
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:opacity-60
                  transition
                "
              >

                <span className="material-symbols-outlined">
                  my_location
                </span>

                {locationLoading
                  ? "Getting Location..."
                  : "Use My Location"}

              </button>

            </div>

            {/* FIND */}

            <div className="md:self-end">

              <button
                type="button"
                onClick={
                  handleFindCenters
                }
                disabled={
                  loading ||
                  !wasteType ||
                  !userLocation
                }
                className="
                  w-full
                  md:w-auto
                  h-12
                  px-6
                  rounded-xl
                  bg-emerald-700
                  hover:bg-emerald-800
                  text-white
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  transition
                "
              >

                <span className="material-symbols-outlined">
                  search
                </span>

                {loading
                  ? "Finding..."
                  : "Find Centers"}

              </button>

            </div>

          </div>

          {/* LOCATION STATUS */}

          {userLocation && (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 font-semibold">

              <span className="material-symbols-outlined text-lg">
                location_on
              </span>

              Your location has been detected.

            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              className="
                mt-3
                p-3
                rounded-xl
                bg-red-50
                dark:bg-red-950/40
                border
                border-red-200
                dark:border-red-900
                text-red-600
                dark:text-red-300
                text-sm
                font-medium
              "
            >
              {error}
            </div>
          )}

        </section>

        {/* ==========================================================
            QUICK FILTERS
        =========================================================== */}

        <section className="flex gap-2 overflow-x-auto pb-1">

          <button
            type="button"
            onClick={() => {
              setWasteType("");
              setFacilities([]);
              setSelectedFacility(null);
              setError("");
            }}
            className={`
              flex
              items-center
              gap-1.5
              h-10
              px-4
              rounded-full
              shrink-0
              font-semibold
              transition
              ${
                wasteType === ""
                  ? "bg-emerald-700 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 shadow-sm dark:shadow-black/20"
              }
            `}
          >

            <span className="material-symbols-outlined text-[18px]">
              apps
            </span>

            All Facilities

          </button>

          {[
            ["E-Waste", "devices"],
            ["Glass", "wine_bar"],
            ["Plastic", "recycling"],
            ["Compost", "compost"],
            ["Batteries", "battery_charging_full"],
            ["Hazardous", "warning"],
          ].map(
            ([type, icon]) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  handleQuickWasteType(
                    type
                  )
                }
                className={`
                  flex
                  items-center
                  gap-1.5
                  h-10
                  px-4
                  rounded-full
                  shrink-0
                  font-semibold
                  transition
                  ${
                    wasteType === type
                      ? "bg-emerald-700 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 shadow-sm dark:shadow-black/20"
                  }
                `}
              >

                <span className="material-symbols-outlined text-[18px]">
                  {icon}
                </span>

                {type}

              </button>
            )
          )}

        </section>

        {/* ==========================================================
            MAP
        =========================================================== */}

        <section
          className="
            bg-white
            dark:bg-slate-900
            rounded-2xl
            overflow-hidden
            shadow-sm
            dark:shadow-black/30
            border
            border-slate-200
            dark:border-slate-700
          "
        >

          {/* MAP HEADER */}

          <div className="p-4 flex items-center justify-between gap-3">

            <div>

              <h2 className="text-xl font-bold">
                Nearby Recycling Centers
              </h2>

              <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
                {wasteType
                  ? `Showing centers for ${wasteType}`
                  : "Select a waste type to find suitable centers."}
              </p>

            </div>

            <span
              className="
                px-3
                py-1.5
                rounded-full
                text-xs
                font-bold
                bg-slate-100
                dark:bg-slate-800
                text-slate-600
                dark:text-slate-200
              "
            >
              {filteredFacilities.length} found
            </span>

          </div>

          {/* ========================================================
              LEAFLET MAP
          ========================================================= */}

          <div
            className="relative w-full"
            style={{
              height: "500px",
              minHeight: "500px",
            }}
          >

            <MapContainer
              center={mapCenter}
              zoom={12}
              scrollWheelZoom={true}
              zoomControl={true}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "500px",
              }}
            >

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapResizeHandler />

              <MapController
                userLocation={
                  userLocation
                }
                facilities={
                  filteredFacilities
                }
                selectedFacility={
                  selectedFacility
                }
              />

              <FitFacilities
                facilities={
                  filteredFacilities
                }
                userLocation={
                  userLocation
                }
              />

              {/* USER LOCATION */}

              {userLocation && (
                <CircleMarker
                  center={[
                    userLocation.latitude,
                    userLocation.longitude,
                  ]}
                  radius={10}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 3,
                    fillColor:
                      "#2563eb",
                    fillOpacity: 1,
                  }}
                >

                  <Popup>

                    <div className="text-sm">

                      <strong>
                        Your Location
                      </strong>

                      <br />

                      Latitude:{" "}
                      {userLocation.latitude.toFixed(
                        6
                      )}

                      <br />

                      Longitude:{" "}
                      {userLocation.longitude.toFixed(
                        6
                      )}

                    </div>

                  </Popup>

                </CircleMarker>
              )}

              {/* RECYCLING CENTER MARKERS */}

              {filteredFacilities.map(
                (
                  facility,
                  index
                ) => {

                  const latitude =
                    Number(
                      facility.latitude
                    );

                  const longitude =
                    Number(
                      facility.longitude
                    );

                  if (
                    !Number.isFinite(
                      latitude
                    ) ||
                    !Number.isFinite(
                      longitude
                    )
                  ) {
                    return null;
                  }

                  const isSelected =
                    selectedFacility?.id ===
                    facility.id;

                  const acceptedWasteTypes =
                    normalizeWasteTypes(
                      facility.waste_types
                    );

                  return (
                    <CircleMarker
                      key={
                        facility.id
                      }
                      center={[
                        latitude,
                        longitude,
                      ]}
                      radius={
                        isSelected
                          ? 13
                          : 9
                      }
                      eventHandlers={{
                        click: () => {
                          setSelectedFacility(
                            facility
                          );
                        },
                      }}
                      pathOptions={{
                        color:
                          "#ffffff",
                        weight: 3,
                        fillColor:
                          isSelected
                            ? "#f59e0b"
                            : "#059669",
                        fillOpacity: 1,
                      }}
                    >

                      <Popup>

                        <div className="min-w-[230px]">

                          <h3 className="font-bold text-base">
                            {index + 1}.{" "}
                            {
                              facility.name
                            }
                          </h3>

                          <p className="text-sm mt-1">
                            {
                              facility.address
                            }
                          </p>

                          {facility.city && (
                            <p className="text-sm">
                              {
                                facility.city
                              }
                            </p>
                          )}

                          {facility.distance_km !==
                            undefined && (
                            <p className="text-sm font-semibold text-emerald-600 mt-2">
                              {Number(
                                facility.distance_km
                              ).toFixed(
                                2
                              )}{" "}
                              km away
                            </p>
                          )}

                          {acceptedWasteTypes.length >
                            0 && (
                            <p className="text-xs mt-2">
                              <strong>
                                Accepts:
                              </strong>{" "}
                              {acceptedWasteTypes.join(
                                ", "
                              )}
                            </p>
                          )}

                          {facility.opening_hours && (
                            <p className="text-xs mt-2">
                              <strong>
                                Hours:
                              </strong>{" "}
                              {
                                facility.opening_hours
                              }
                            </p>
                          )}

                          {facility.phone && (
                            <p className="text-xs mt-2">
                              <strong>
                                Phone:
                              </strong>{" "}
                              {
                                facility.phone
                              }
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              getDirections(
                                facility
                              )
                            }
                            className="mt-3 w-full px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold"
                          >
                            Get Directions
                          </button>

                        </div>

                      </Popup>

                    </CircleMarker>
                  );
                }
              )}

            </MapContainer>

            {/* RECENTER */}

            <button
              type="button"
              onClick={() => {

                if (!userLocation) {
                  getUserLocation();
                  return;
                }

                setSelectedFacility(
                  null
                );

              }}
              className="
                absolute
                top-3
                right-3
                z-[1000]
                w-11
                h-11
                rounded-xl
                bg-white
                dark:bg-slate-800
                text-slate-700
                dark:text-white
                shadow-lg
                flex
                items-center
                justify-center
                hover:bg-slate-100
                dark:hover:bg-slate-700
                transition
              "
              title="Use my location"
            >

              <span className="material-symbols-outlined">
                my_location
              </span>

            </button>

            {/* MAP COUNT */}

            <div
              className="
                absolute
                bottom-4
                left-4
                z-[1000]
                bg-white/95
                dark:bg-slate-900/95
                px-4
                py-2.5
                rounded-xl
                shadow-lg
              "
            >

              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">

                {filteredFacilities.length}{" "}

                recycling center
                {filteredFacilities.length !==
                1
                  ? "s"
                  : ""}

              </span>

            </div>

          </div>

        </section>

        {/* ==========================================================
            FACILITY LIST
        =========================================================== */}

        <section>

          <div className="flex items-center justify-between mb-3">

            <div className="flex items-center gap-2">

              <h2 className="text-xl font-bold">
                Recycling Centers
              </h2>

              <span
                className="
                  px-2
                  py-1
                  rounded-full
                  text-xs
                  font-semibold
                  bg-slate-100
                  dark:bg-slate-800
                  text-slate-600
                  dark:text-slate-200
                "
              >
                {
                  filteredFacilities.length
                }{" "}
                found
              </span>

            </div>

          </div>

          {/* NO RESULTS */}

          {filteredFacilities.length ===
          0 ? (

            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                p-8
                text-center
                shadow-sm
                dark:shadow-black/30
                border
                border-slate-100
                dark:border-slate-800
              "
            >

              <span className="material-symbols-outlined text-5xl text-slate-400">
                recycling
              </span>

              <p className="mt-3 font-bold">

                {loading
                  ? "Finding nearby recycling centers..."
                  : wasteType
                  ? `No ${wasteType} recycling centers found nearby.`
                  : "Select a waste type to find nearby centers."}

              </p>

              <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">

                {loading
                  ? "Please wait..."
                  : userLocation
                  ? "Try another waste type or search."
                  : "Use My Location to search around you."}

              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {filteredFacilities.map(
                (
                  facility,
                  index
                ) => {

                  const acceptedWasteTypes =
                    normalizeWasteTypes(
                      facility.waste_types
                    );

                  return (
                    <article
                      key={
                        facility.id
                      }
                      id={`facility-${facility.id}`}
                      className={`
                        bg-white
                        dark:bg-slate-900
                        rounded-2xl
                        p-4
                        shadow-sm
                        dark:shadow-black/30
                        border
                        transition
                        ${
                          selectedFacility?.id ===
                          facility.id
                            ? "border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900/50"
                            : "border-slate-100 dark:border-slate-800"
                        }
                      `}
                    >

                      {/* HEADER */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-start gap-3">

                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-700 text-white text-sm font-bold shrink-0">
                            {index + 1}
                          </span>

                          <div>

                            <h3 className="font-bold">
                              {
                                facility.name
                              }
                            </h3>

                            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
                              {
                                facility.address
                              }
                            </p>

                            {facility.city && (
                              <p className="text-sm text-slate-600 dark:text-slate-300">
                                {
                                  facility.city
                                }
                              </p>
                            )}

                          </div>

                        </div>

                        <span className="material-symbols-outlined text-emerald-600">
                          recycling
                        </span>

                      </div>

                      {/* DISTANCE */}

                      {facility.distance_km !==
                        undefined && (
                        <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-emerald-600">

                          <span className="material-symbols-outlined text-base">
                            near_me
                          </span>

                          {Number(
                            facility.distance_km
                          ).toFixed(
                            2
                          )}{" "}
                          km away

                        </div>
                      )}

                      {/* ACCEPTED WASTE */}

                      {acceptedWasteTypes.length >
                        0 && (
                        <div className="mt-4">

                          <p className="text-xs font-semibold mb-2 text-slate-600 dark:text-slate-300">
                            Accepted Waste
                          </p>

                          <div className="flex flex-wrap gap-1.5">

                            {acceptedWasteTypes.map(
                              (
                                type,
                                typeIndex
                              ) => (
                                <span
                                  key={`${type}-${typeIndex}`}
                                  className="
                                    px-2.5
                                    py-1
                                    rounded-full
                                    text-xs
                                    bg-slate-100
                                    dark:bg-slate-800
                                    text-slate-700
                                    dark:text-slate-200
                                  "
                                >
                                  {type}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                      {/* DETAILS */}

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">

                        {facility.opening_hours && (
                          <div
                            className="
                              p-3
                              rounded-xl
                              bg-slate-50
                              dark:bg-slate-800
                            "
                          >

                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              Opening Hours
                            </p>

                            <p className="text-sm font-semibold mt-1">
                              {
                                facility.opening_hours
                              }
                            </p>

                          </div>
                        )}

                        {facility.phone && (
                          <div
                            className="
                              p-3
                              rounded-xl
                              bg-slate-50
                              dark:bg-slate-800
                            "
                          >

                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              Phone
                            </p>

                            <p className="text-sm font-semibold mt-1">
                              {
                                facility.phone
                              }
                            </p>

                          </div>
                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">

                        {/* SHOW MAP */}

                        <button
                          type="button"
                          onClick={() => {

                            setSelectedFacility(
                              facility
                            );

                            document
                              .getElementById(
                                `facility-${facility.id}`
                              )
                              ?.scrollIntoView(
                                {
                                  behavior:
                                    "smooth",
                                  block:
                                    "center",
                                }
                              );

                          }}
                          className="
                            h-11
                            rounded-lg
                            bg-emerald-700
                            hover:bg-emerald-800
                            text-white
                            font-semibold
                            flex
                            items-center
                            justify-center
                            gap-1.5
                            transition
                          "
                        >

                          <span className="material-symbols-outlined text-lg">
                            location_on
                          </span>

                          Show on Map

                        </button>

                        {/* DIRECTIONS */}

                        <button
                          type="button"
                          onClick={() =>
                            getDirections(
                              facility
                            )
                          }
                          className="
                            h-11
                            rounded-lg
                            bg-slate-100
                            dark:bg-slate-800
                            text-slate-800
                            dark:text-white
                            hover:bg-slate-200
                            dark:hover:bg-slate-700
                            font-semibold
                            flex
                            items-center
                            justify-center
                            gap-1.5
                            transition
                          "
                        >

                          <span className="material-symbols-outlined text-lg">
                            near_me
                          </span>

                          Directions

                        </button>

                        {/* CALL */}

                        <button
                          type="button"
                          onClick={() =>
                            callCenter(
                              facility.phone
                            )
                          }
                          disabled={
                            !facility.phone
                          }
                          className="
                            h-11
                            rounded-lg
                            bg-slate-100
                            dark:bg-slate-800
                            text-slate-800
                            dark:text-white
                            hover:bg-slate-200
                            dark:hover:bg-slate-700
                            font-semibold
                            flex
                            items-center
                            justify-center
                            gap-1.5
                            disabled:opacity-40
                            transition
                          "
                        >

                          <span className="material-symbols-outlined text-lg">
                            phone
                          </span>

                          Call Center

                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>

      {/* ============================================================
          TOAST
      ============================================================= */}

      {toast && (
        <div
          className="
            fixed
            bottom-24
            left-1/2
            -translate-x-1/2
            bg-slate-900
            dark:bg-slate-700
            text-white
            px-5
            py-3
            rounded-full
            shadow-xl
            z-[2000]
            text-sm
          "
        >
          {toast}
        </div>
      )}

    </div>
  );
}

export default RecyclingCenters;