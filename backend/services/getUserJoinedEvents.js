const { sequelize } = require("../models")

const getUserJoinedEvents = async (UserID) => {
  try {
    const joinedEvents = await sequelize.query(
      `
      SELECT e.*, t."TimeID", t."StartTime", t."EndTime", COUNT(j."UserID") AS "JoinedCount"
      FROM "Joins" j
      JOIN "Times" t ON j."TimeID" = t."TimeID"
      JOIN "Events" e ON t."EventID" = e."EventID"
      WHERE j."UserID" = :UserID
      AND t."EndTime" > NOW()
      GROUP BY e."EventID", t."TimeID"
      ORDER BY t."StartTime" ASC;
      `,
      {
        replacements: { UserID },
        type: sequelize.QueryTypes.SELECT,
      }
    )

    return joinedEvents
  } catch (error) {
    console.error("Virhe haettaessa käyttäjän liittymiä tapahtumia: " + error)
    throw new Error("Internal server error")
  }
}

const getUserJoinedEventsPast = async (UserID) => {
  try {
    const joinedEvents = await sequelize.query(
      `
      SELECT e.*, t."TimeID", t."StartTime", t."EndTime", COUNT(j."UserID") AS "JoinedCount"
      FROM "Joins" j
      JOIN "Times" t ON j."TimeID" = t."TimeID"
      JOIN "Events" e ON t."EventID" = e."EventID"
      WHERE j."UserID" = :UserID
      AND t."StartTime" < NOW()
      GROUP BY e."EventID", t."TimeID"
      ORDER BY t."StartTime" ASC;
      `,
      {
        replacements: { UserID },
        type: sequelize.QueryTypes.SELECT,
      }
    )

    return joinedEvents
  } catch (error) {
    console.error("Virhe haettaessa käyttäjän liittymiä tapahtumia: " + error)
    throw new Error("Internal server error")
  }
}

const getUserCreatedEvents = async (UserID) => {
  try {
    const joinedEvents = await sequelize.query(
      `
      SELECT e.*, t."TimeID", t."StartTime", t."EndTime", COUNT(j."UserID") AS "JoinedCount"
      FROM "Events" e
      LEFT JOIN "Times" t ON e."EventID" = t."EventID"
      LEFT JOIN "Joins" j ON t."TimeID" = j."TimeID"
      WHERE e."UserID" = :UserID
      AND t."EndTime" > NOW()
      GROUP BY e."EventID", t."TimeID"
      ORDER BY t."StartTime" ASC;
      `,
      {
        replacements: { UserID },
        type: sequelize.QueryTypes.SELECT,
      }
    )

    return joinedEvents
  } catch (error) {
    console.error("Virhe haettaessa käyttäjän liittymiä tapahtumia: " + error)
    throw new Error("Internal server error")
  }
}

const getUserCreatedEventsPast = async (UserID) => {
  try {
    const joinedEvents = await sequelize.query(
      `
      SELECT e.*, t."TimeID", t."StartTime", t."EndTime", COUNT(j."UserID") AS "JoinedCount"
      FROM "Events" e
      LEFT JOIN "Times" t ON e."EventID" = t."EventID"
      LEFT JOIN "Joins" j ON t."TimeID" = j."TimeID"
      WHERE e."UserID" = :UserID
      AND t."StartTime" < NOW()
      GROUP BY e."EventID", t."TimeID"
      ORDER BY t."StartTime" ASC;
      `,
      {
        replacements: { UserID },
        type: sequelize.QueryTypes.SELECT,
      }
    )

    return joinedEvents
  } catch (error) {
    console.error("Virhe haettaessa käyttäjän liittymiä tapahtumia: " + error)
    throw new Error("Internal server error")
  }
}

const getClubCreatedEvents = async (userClubs) => {
  try {
    if (!userClubs || userClubs.length === 0) {
      return []
    }
    const clubIds = userClubs.map((club) => club.ClubID)

    const joinedEvents = await sequelize.query(
      `
      SELECT e.*, t."TimeID", t."StartTime", t."EndTime", COUNT(j."UserID") AS "JoinedCount"
      FROM "Events" e
      LEFT JOIN "Times" t ON e."EventID" = t."EventID"
      LEFT JOIN "Joins" j ON t."TimeID" = j."TimeID"
      WHERE e."ClubID" IN (:clubIds)
      AND t."EndTime" > NOW()
      GROUP BY e."EventID", t."TimeID"
      ORDER BY t."StartTime" ASC;
      `,
      {
        replacements: { clubIds },
        type: sequelize.QueryTypes.SELECT,
      }
    )

    return joinedEvents
  } catch (error) {
    console.error("Virhe haettaessa käyttäjän liittymiä tapahtumia: " + error)
    throw new Error("Internal server error")
  }
}

const getClubCreatedEventsPast = async (userClubs) => {
  try {
    if (!userClubs || userClubs.length === 0) {
      return []
    }
    const clubIds = userClubs.map((club) => club.ClubID)

    const joinedEvents = await sequelize.query(
      `
      SELECT e.*, t."TimeID", t."StartTime", t."EndTime", COUNT(j."UserID") AS "JoinedCount"
      FROM "Events" e
      LEFT JOIN "Times" t ON e."EventID" = t."EventID"
      LEFT JOIN "Joins" j ON t."TimeID" = j."TimeID"
      WHERE e."ClubID" IN (:clubIds)
      AND t."StartTime" < NOW()
      GROUP BY e."EventID", t."TimeID"
      ORDER BY t."StartTime" ASC;
      `,
      {
        replacements: { clubIds },
        type: sequelize.QueryTypes.SELECT,
      }
    )

    return joinedEvents
  } catch (error) {
    console.error("Virhe haettaessa käyttäjän liittymiä tapahtumia: " + error)
    throw new Error("Internal server error")
  }
}

module.exports = {
  getUserJoinedEvents,
  getUserJoinedEventsPast,
  getUserCreatedEvents,
  getUserCreatedEventsPast,
  getClubCreatedEvents,
  getClubCreatedEventsPast,
}
