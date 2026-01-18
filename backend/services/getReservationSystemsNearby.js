const { Op, fn, col, where } = require("sequelize")
const { Events } = require("../models/Events")
const { sequelize } = require("../models")

// Tapahtumien hakukyselyn luonti
const getReservationSystemsNearby = async (
  latitude,
  longitude,
  radius,
) => {
  try {
    const query = `
  SELECT
    rs."SystemID",
    rs."Establishment_Location",
    rs."Description",
    rs."Title",
    rs."ClubID",
    rs."Rental",
    rs."PopUpText",
    c."Name" AS "ClubName",
    -- Kokoamme kaikkien kenttien kategoriat taulukoksi
    COALESCE(
      ARRAY_AGG(DISTINCT fc."CategoryID") FILTER (WHERE fc."CategoryID" IS NOT NULL),
      '{}' -- Jos ei löydy yhtään kategoriaa, palautetaan tyhjä taulukko
    ) AS "FieldCategoryIDs"
  FROM "ReservationSystems" rs
  LEFT JOIN "Clubs" c
    ON rs."ClubID" = c."ClubID"
  LEFT JOIN "Fields" f
    ON f."SystemID" = rs."SystemID"
  LEFT JOIN "FieldCategories" fc
    ON fc."FieldID" = f."FieldID"
  WHERE ST_DWithin(
    rs."Establishment_Location",
    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
    :radius
  )
  GROUP BY
    rs."SystemID",
    rs."Establishment_Location",
    rs."Description",
    rs."Title",
    rs."ClubID",
    rs."Rental",
    rs."PopUpText",
    c."Name"
`

    const systems = await sequelize.query(query, {
      replacements: { latitude, longitude, radius },
      type: sequelize.QueryTypes.SELECT,
    })

    return systems
  } catch (error) {
    console.error("❌ Virhe haettaessa tapahtumia:", error)
    return []
  }
}


module.exports = { getReservationSystemsNearby, }
