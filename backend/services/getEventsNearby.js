const { Op, fn, col, where } = require("sequelize")
const { Events } = require("../models/Events")
const { sequelize } = require("../models")

// Tapahtumien hakukyselyn luonti
const getEventsNearby = async (
  latitude,
  longitude,
  radius,
  startTime,
  endTime,
  startDate,
  endDate
) => {
  try {
    const query = `
      WITH NextOrOngoingTime AS (
          SELECT DISTINCT ON (t."EventID") 
                 t."TimeID", 
                 t."EventID", 
                 t."StartTime", 
                 t."EndTime"
          FROM "Times" t
          WHERE (t."StartTime" <= NOW() AND t."EndTime" >= NOW())
             OR t."StartTime" > NOW()
          ORDER BY t."EventID",
                   (t."StartTime" <= NOW() AND t."EndTime" >= NOW()) DESC,  
                   t."StartTime" ASC
      )
      SELECT 
        e."EventID",
        e."Event_Location",
        e."Status",
        e."Description",
        e."ParticipantMax",
        e."ParticipantMin",
        e."Title",
        e."createdAt",
        e."updatedAt",
        e."UserID",
        e."CategoryID",
        t."TimeID",
        t."StartTime",
        t."EndTime",
        u."Username",
        c."Name" AS "ClubName",
        COUNT(j."UserID") AS "JoinedCount"
      FROM "Events" e
      LEFT JOIN NextOrOngoingTime t ON t."EventID" = e."EventID"
      LEFT JOIN "Joins" j ON j."TimeID" = t."TimeID"
      LEFT JOIN "Users" u ON e."UserID" = u."UserID"
      LEFT JOIN "Clubs" c ON e."ClubID" = c."ClubID"
      WHERE ST_DWithin(
              e."Event_Location",
              ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
              :radius
            )
      -- Päivämäärän ja kellonajan suodatus minuuttitarkkuudella
      AND DATE(t."StartTime") BETWEEN :startDate AND :endDate
      AND TO_CHAR(t."StartTime", 'HH24:MI') BETWEEN :startTime AND :endTime
      GROUP BY 
        e."EventID",
        e."Event_Location",
        e."Status",
        e."Description",
        e."ParticipantMax",
        e."ParticipantMin",
        e."Title",
        e."createdAt",
        e."updatedAt",
        e."UserID",
        e."CategoryID",
        t."TimeID",
        t."StartTime",
        t."EndTime",
        u."Username",
        c."Name"
      ORDER BY t."StartTime" ASC;
    `

    const events = await sequelize.query(query, {
      replacements: {
        latitude,
        longitude,
        radius,
        startTime,
        endTime,
        startDate,
        endDate,
      },
      type: sequelize.QueryTypes.SELECT,
    })

    return events
  } catch (error) {
    console.error("❌ Virhe haettaessa tapahtumia:", error)
    return []
  }
}

// Tapahtumien hakukyselyn luonti
const getEventsNearbyQuick = async (
  latitude,
  longitude,
  radius,
  startTimeDate,
  endTimeDate
) => {
  try {
    const query = `
      WITH NextOrOngoingTime AS (
          SELECT DISTINCT ON (t."EventID") 
                 t."TimeID", 
                 t."EventID", 
                 t."StartTime", 
                 t."EndTime"
          FROM "Times" t
          WHERE (t."StartTime" <= NOW() AND t."EndTime" >= NOW())
             OR t."StartTime" > NOW()
          ORDER BY t."EventID",
                   (t."StartTime" <= NOW() AND t."EndTime" >= NOW()) DESC,  
                   t."StartTime" ASC
      )
      SELECT 
        e."EventID",
        e."Event_Location",
        e."Status",
        e."Description",
        e."ParticipantMax",
        e."ParticipantMin",
        e."Title",
        e."createdAt",
        e."updatedAt",
        e."UserID",
        e."CategoryID",
        t."TimeID",
        t."StartTime",
        t."EndTime",
        u."Username",
        c."Name" AS "ClubName",
        COUNT(j."UserID") AS "JoinedCount"
      FROM "Events" e
      LEFT JOIN NextOrOngoingTime t ON t."EventID" = e."EventID"
      LEFT JOIN "Joins" j ON j."TimeID" = t."TimeID"
      LEFT JOIN "Users" u ON e."UserID" = u."UserID"
      LEFT JOIN "Clubs" c ON e."ClubID" = c."ClubID"
      WHERE ST_DWithin(
              e."Event_Location",
              ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
              :radius
            )
      -- Tarkistetaan onko aikavälillä
      AND (
          DATE(t."StartTime") BETWEEN :startTimeDate AND :endTimeDate
          OR DATE(t."EndTime") BETWEEN :startTimeDate AND :endTimeDate
      )
      GROUP BY 
        e."EventID",
        e."Event_Location",
        e."Status",
        e."Description",
        e."ParticipantMax",
        e."ParticipantMin",
        e."Title",
        e."createdAt",
        e."updatedAt",
        e."UserID",
        e."CategoryID",
        t."TimeID",
        t."StartTime",
        t."EndTime",
        u."Username",
        c."Name"
      ORDER BY t."StartTime" ASC;
    `

    const events = await sequelize.query(query, {
      replacements: {
        latitude,
        longitude,
        radius,
        startTimeDate,
        endTimeDate,
      },
      type: sequelize.QueryTypes.SELECT,
    })

    return events
  } catch (error) {
    console.error("❌ Virhe haettaessa tapahtumia:", error)
    return []
  }
}

module.exports = { getEventsNearby, getEventsNearbyQuick }
/*

// Esimerkki: Hae tapahtumat 5 km säteellä koordinaateista (60.1699, 24.9384) (Helsinki)
getEventsNearby(60.1699, 24.9384, 5000).then((events) =>
  console.log(events)
)
*/
