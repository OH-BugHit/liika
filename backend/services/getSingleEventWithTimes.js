const { sequelize } = require("../models")

const getSingleEventWithTimes = async (EventID) => {
  const query = `
    SELECT 
      e."EventID",
      e."Title",
      e."Description",
      e."Event_Location",
      e."ParticipantMin",
      e."ParticipantMax",
      e."Status",
      e."CategoryID",
      e."UserID",
      e."createdAt",
      e."updatedAt",
      t."TimeID",
      t."StartTime",
      t."EndTime",
      u."Username",
      c."Name" AS "ClubName",
      COUNT(j."UserID") AS "JoinedCount"
    FROM "Events" e
    LEFT JOIN "Times" t ON t."EventID" = e."EventID"
    LEFT JOIN "Joins" j ON j."TimeID" = t."TimeID"
    LEFT JOIN "Users" u ON e."UserID" = u."UserID"
    LEFT JOIN "Clubs" c ON e."ClubID" = c."ClubID"
    WHERE e."EventID" = :EventID
    GROUP BY 
      e."EventID",
      e."Title",
      e."Description",
      e."Event_Location",
      e."ParticipantMin",
      e."ParticipantMax",
      e."Status",
      e."CategoryID",
      e."UserID",
      e."createdAt",
      e."updatedAt",
      t."TimeID",
      t."StartTime",
      t."EndTime",
      u."Username",
      c."Name"
    ORDER BY t."StartTime" ASC;
  `

  try {
    const results = await sequelize.query(query, {
      replacements: { EventID },
      type: sequelize.QueryTypes.SELECT,
    })

    if (results.length === 0) {
      return null // Palauta null jos eventtiä ei löydy
    }

    // Muotoillaan eventin tiedot ja aikataulut
    const eventData = {
      EventID: results[0].EventID,
      Title: results[0].Title,
      Description: results[0].Description,
      Event_Location: results[0].Event_Location,
      ParticipantMin: results[0].ParticipantMin,
      ParticipantMax: results[0].ParticipantMax,
      Status: results[0].Status,
      CategoryID: results[0].CategoryID,
      UserID: results[0].UserID,
      createdAt: results[0].createdAt,
      updatedAt: results[0].updatedAt,
      Times: results.map((row) => ({
        TimeID: row.TimeID,
        StartTime: row.StartTime,
        EndTime: row.EndTime,
        JoinedCount: row.JoinedCount,
      })),
      Username: results[0].Username,
      ClubName: results[0].ClubName,
    }

    return eventData
  } catch (error) {
    console.error("Virhe tietokantakyselyssä:", error)
    throw new Error("Tietokantavirhe")
  }
}

module.exports = { getSingleEventWithTimes }
