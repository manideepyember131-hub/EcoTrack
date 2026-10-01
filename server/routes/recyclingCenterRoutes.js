import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| WASTE TYPE KEYWORDS
|--------------------------------------------------------------------------
| The database stores waste_types as JSON text, for example:
|
| ["E-Waste", "Electronics", "Batteries", "Plastic"]
|
*/

const wasteTypeKeywords = {
  "E-Waste": [
    "e-waste",
    "e waste",
    "electronics",
    "electronic",
  ],

  "Electronics": [
    "electronics",
    "electronic",
    "e-waste",
    "e waste",
  ],

  "Batteries": [
    "batteries",
    "battery",
  ],

  "Plastic": [
    "plastic",
    "plastics",
  ],

  "Glass": [
    "glass",
  ],

  "Paper": [
    "paper",
    "papers",
  ],

  "Cardboard": [
    "cardboard",
    "paper",
  ],

  "Metal": [
    "metal",
    "metals",
  ],

  "Compost": [
    "compost",
    "organic",
    "wet waste",
  ],

  "Organic": [
    "organic",
    "compost",
    "wet waste",
  ],

  "Wet Waste": [
    "wet waste",
    "organic",
    "compost",
  ],

  "Hazardous": [
    "hazardous",
    "chemical",
    "chemicals",
    "paint",
    "oil",
  ],
};


/*
|--------------------------------------------------------------------------
| HELPER: GET KEYWORDS FOR WASTE TYPE
|--------------------------------------------------------------------------
*/

const getWasteKeywords = (wasteType) => {
  if (!wasteType || typeof wasteType !== "string") {
    return [];
  }

  const cleanWasteType = wasteType.trim();

  if (wasteTypeKeywords[cleanWasteType]) {
    return wasteTypeKeywords[cleanWasteType];
  }

  return [cleanWasteType.toLowerCase()];
};


/*
|--------------------------------------------------------------------------
| HELPER: PARSE WASTE TYPES
|--------------------------------------------------------------------------
*/

function parseWasteTypes(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [String(parsed)];
  } catch {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}


/*
|--------------------------------------------------------------------------
| GET ALL RECYCLING CENTERS
|--------------------------------------------------------------------------
| GET /api/recycling-centers
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        address,
        city,
        state,
        pincode,
        latitude,
        longitude,
        phone,
        website,
        waste_types,
        opening_hours,
        source_name,
        source_url,
        verification_status,
        is_active,
        status,
        created_at,
        updated_at
      FROM recycling_centers
      WHERE
        (is_active = 1 OR is_active IS NULL)
        AND (status = 'Active' OR status IS NULL)
      ORDER BY name ASC
    `);

    const centers = rows.map((row) => ({
      ...row,

      waste_types: parseWasteTypes(row.waste_types),

      latitude:
        row.latitude !== null
          ? Number(row.latitude)
          : null,

      longitude:
        row.longitude !== null
          ? Number(row.longitude)
          : null,
    }));

    return res.status(200).json({
      success: true,
      data: centers,
    });

  } catch (error) {
    console.error(
      "Error fetching recycling centers:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recycling centers.",
    });
  }
});


/*
|--------------------------------------------------------------------------
| GET NEARBY RECYCLING CENTERS
|--------------------------------------------------------------------------
|
| GET /api/recycling-centers/nearby
|
| Example:
|
| /api/recycling-centers/nearby?wasteType=Plastic&latitude=17.384&longitude=78.450
|
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This route must come BEFORE /:id.
| Otherwise Express can interpret "nearby" as an ID.
|--------------------------------------------------------------------------
*/

router.get("/nearby", async (req, res) => {
  try {
    const {
      wasteType,
      latitude,
      longitude,
    } = req.query;

    console.log("\n========================================");
    console.log("GET NEARBY RECYCLING CENTER REQUEST");
    console.log("========================================");

    console.log("WASTE TYPE:", wasteType);
    console.log("LATITUDE:", latitude);
    console.log("LONGITUDE:", longitude);

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!wasteType) {
      return res.status(400).json({
        success: false,
        message: "Waste type is required.",
      });
    }

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid latitude and longitude are required.",
      });
    }

    const keywords = getWasteKeywords(wasteType);

    console.log("KEYWORDS:", keywords);

    const wasteConditions = keywords
      .map(
        () =>
          `LOWER(CAST(rc.waste_types AS CHAR)) LIKE ?`
      )
      .join(" OR ");

    const wasteParams = keywords.map(
      (keyword) =>
        `%${keyword.toLowerCase()}%`
    );

    const sql = `
      SELECT
        rc.id,
        rc.name,
        rc.address,
        rc.city,
        rc.state,
        rc.pincode,
        rc.latitude,
        rc.longitude,
        rc.phone,
        rc.website,
        rc.waste_types,
        rc.opening_hours,
        rc.source_name,
        rc.source_url,
        rc.verification_status,
        rc.is_active,
        rc.status,

        (
          6371 * ACOS(
            LEAST(
              1,
              GREATEST(
                -1,

                COS(RADIANS(?))
                *
                COS(RADIANS(rc.latitude))
                *
                COS(
                  RADIANS(rc.longitude)
                  - RADIANS(?)
                )

                +

                SIN(RADIANS(?))
                *
                SIN(RADIANS(rc.latitude))
              )
            )
          )
        ) AS distance_km

      FROM recycling_centers rc

      WHERE
        rc.latitude IS NOT NULL
        AND rc.longitude IS NOT NULL

        AND (
          rc.is_active = 1
          OR rc.is_active IS NULL
        )

        AND (
          rc.status = 'Active'
          OR rc.status IS NULL
        )

        AND (
          ${wasteConditions}
        )

      ORDER BY distance_km ASC

      LIMIT 50
    `;

    const queryParams = [
      lat,
      lng,
      lat,
      ...wasteParams,
    ];

    console.log("QUERY PARAMS:", queryParams);

    console.log("========================================");
    console.log("EXECUTING GET NEARBY QUERY");
    console.log("========================================");

    const [rows] = await pool.query(
      sql,
      queryParams
    );

    console.log("========================================");
    console.log("ROWS FROM MYSQL:");
    console.log("========================================");

    console.log(rows);

    console.log(
      "NUMBER OF ROWS:",
      rows.length
    );

    const centers = rows.map((row) => ({
      ...row,

      latitude:
        row.latitude !== null
          ? Number(row.latitude)
          : null,

      longitude:
        row.longitude !== null
          ? Number(row.longitude)
          : null,

      waste_types:
        parseWasteTypes(row.waste_types),

      distance_km:
        row.distance_km !== null
          ? Number(
              Number(row.distance_km).toFixed(2)
            )
          : null,
    }));

    console.log(
      `FOUND ${centers.length} RECYCLING CENTERS`
    );

    return res.status(200).json({
      success: true,
      data: centers,
    });

  } catch (error) {
    console.error(
      "GET nearby recycling centers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to find nearby recycling centers.",
      error: error.message,
    });
  }
});


/*
|--------------------------------------------------------------------------
| POST NEARBY RECYCLING CENTERS
|--------------------------------------------------------------------------
|
| POST /api/recycling-centers/nearby
|
| Request:
|
| {
|   "wasteType": "Plastic",
|   "latitude": 17.3842,
|   "longitude": 78.4500
| }
|
|--------------------------------------------------------------------------
*/

router.post("/nearby", async (req, res) => {
  try {
    const {
      wasteType,
      latitude,
      longitude,
    } = req.body;

    console.log("\n========================================");
    console.log("POST NEARBY RECYCLING CENTER REQUEST");
    console.log("========================================");

    console.log("WASTE TYPE:", wasteType);
    console.log("LATITUDE:", latitude);
    console.log("LONGITUDE:", longitude);

    /*
    |--------------------------------------------------------------------------
    | VALIDATE WASTE TYPE
    |--------------------------------------------------------------------------
    */

    if (
      !wasteType ||
      typeof wasteType !== "string" ||
      !wasteType.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Waste type is required.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | VALIDATE LOCATION
    |--------------------------------------------------------------------------
    */

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid latitude and longitude are required.",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude.",
      });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude.",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | GET SEARCH KEYWORDS
    |--------------------------------------------------------------------------
    */

    const keywords = getWasteKeywords(wasteType);

    console.log(
      "WASTE TYPE:",
      wasteType
    );

    console.log(
      "KEYWORDS:",
      keywords
    );


    /*
    |--------------------------------------------------------------------------
    | BUILD WASTE TYPE CONDITIONS
    |--------------------------------------------------------------------------
    */

    const wasteConditions = keywords
      .map(
        () =>
          `LOWER(CAST(rc.waste_types AS CHAR)) LIKE ?`
      )
      .join(" OR ");

    const wasteParams = keywords.map(
      (keyword) =>
        `%${keyword.toLowerCase()}%`
    );

    console.log(
      "WASTE SQL CONDITIONS:",
      wasteConditions
    );

    console.log(
      "WASTE SQL PARAMETERS:",
      wasteParams
    );


    /*
    |--------------------------------------------------------------------------
    | SQL QUERY
    |--------------------------------------------------------------------------
    */

    const sql = `
      SELECT
        rc.id,
        rc.name,
        rc.address,
        rc.city,
        rc.state,
        rc.pincode,
        rc.latitude,
        rc.longitude,
        rc.phone,
        rc.website,
        rc.waste_types,
        rc.opening_hours,
        rc.source_name,
        rc.source_url,
        rc.verification_status,
        rc.is_active,
        rc.status,

        (
          6371 * ACOS(
            LEAST(
              1,
              GREATEST(
                -1,

                COS(RADIANS(?))
                *
                COS(RADIANS(rc.latitude))
                *
                COS(
                  RADIANS(rc.longitude)
                  - RADIANS(?)
                )

                +

                SIN(RADIANS(?))
                *
                SIN(RADIANS(rc.latitude))
              )
            )
          )
        ) AS distance_km

      FROM recycling_centers rc

      WHERE
        rc.latitude IS NOT NULL
        AND rc.longitude IS NOT NULL

        AND (
          rc.is_active = 1
          OR rc.is_active IS NULL
        )

        AND (
          rc.status = 'Active'
          OR rc.status IS NULL
        )

        AND (
          ${wasteConditions}
        )

      ORDER BY distance_km ASC

      LIMIT 50
    `;


    /*
    |--------------------------------------------------------------------------
    | QUERY PARAMETERS
    |--------------------------------------------------------------------------
    */

    const queryParams = [
      lat,
      lng,
      lat,
      ...wasteParams,
    ];

    console.log(
      "QUERY PARAMS:",
      queryParams
    );


    /*
    |--------------------------------------------------------------------------
    | EXECUTE QUERY
    |--------------------------------------------------------------------------
    */

    console.log("========================================");
    console.log("EXECUTING MYSQL QUERY");
    console.log("========================================");

    const [rows] = await pool.query(
      sql,
      queryParams
    );


    /*
    |--------------------------------------------------------------------------
    | DEBUG MYSQL RESULT
    |--------------------------------------------------------------------------
    */

    console.log("========================================");
    console.log("ROWS FROM MYSQL:");
    console.log("========================================");

    console.log(rows);

    console.log(
      "NUMBER OF ROWS:",
      rows.length
    );


    /*
    |--------------------------------------------------------------------------
    | FORMAT RESULTS
    |--------------------------------------------------------------------------
    */

    const centers = rows.map((row) => ({
      id: row.id,

      name: row.name,

      address: row.address,

      city: row.city,

      state: row.state,

      pincode: row.pincode,

      latitude:
        row.latitude !== null
          ? Number(row.latitude)
          : null,

      longitude:
        row.longitude !== null
          ? Number(row.longitude)
          : null,

      phone: row.phone,

      website: row.website,

      waste_types:
        parseWasteTypes(row.waste_types),

      opening_hours:
        row.opening_hours,

      source_name:
        row.source_name,

      source_url:
        row.source_url,

      verification_status:
        row.verification_status,

      is_active:
        row.is_active,

      status:
        row.status,

      distance_km:
        row.distance_km !== null
          ? Number(
              Number(row.distance_km).toFixed(2)
            )
          : null,
    }));


    /*
    |--------------------------------------------------------------------------
    | FINAL DEBUG
    |--------------------------------------------------------------------------
    */

    console.log("========================================");
    console.log(
      `FOUND ${centers.length} RECYCLING CENTERS FOR ${wasteType}`
    );
    console.log("========================================");

    console.log(
      "CENTERS SENT TO FRONTEND:",
      centers
    );


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message:
        centers.length > 0
          ? `${centers.length} recycling center(s) found.`
          : `No recycling centers found for ${wasteType}.`,

      data: centers,
    });

  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "NEARBY RECYCLING CENTERS ERROR:"
    );

    console.error(error);

    console.error(
      "========================================"
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to find nearby recycling centers.",

      error: error.message,
    });
  }
});


/*
|--------------------------------------------------------------------------
| GET SINGLE RECYCLING CENTER
|--------------------------------------------------------------------------
| GET /api/recycling-centers/:id
|--------------------------------------------------------------------------
*/

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        address,
        city,
        state,
        pincode,
        latitude,
        longitude,
        phone,
        website,
        waste_types,
        opening_hours,
        source_name,
        source_url,
        verification_status,
        is_active,
        status,
        created_at,
        updated_at
      FROM recycling_centers
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Recycling center not found.",
      });
    }

    const center = {
      ...rows[0],

      waste_types:
        parseWasteTypes(
          rows[0].waste_types
        ),

      latitude:
        rows[0].latitude !== null
          ? Number(rows[0].latitude)
          : null,

      longitude:
        rows[0].longitude !== null
          ? Number(rows[0].longitude)
          : null,
    };

    return res.status(200).json({
      success: true,
      data: center,
    });

  } catch (error) {
    console.error(
      "Error fetching recycling center:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch recycling center.",
    });
  }
});


export default router;