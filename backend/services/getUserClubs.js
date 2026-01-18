const { sequelize } = require("../utils/database") // Varmista, että sequelize on tuotu oikein

const getUserClubs = async (userId) => {
  try {
    // Raaka SQL-kysely
    const results = await sequelize.query(
      `
      SELECT c."ClubID", c."Name"
      FROM "Clubs" c
      JOIN "ClubMembers" cm ON cm."ClubID" = c."ClubID"
      WHERE cm."UserID" = :userId;
    `,
      {
        replacements: { userId }, // Käytetään userId parametrina
        type: sequelize.QueryTypes.SELECT,
      }
    )

    return results // Palautetaan klubit
  } catch (error) {
    console.error("Virhe haettaessa käyttäjän klubit:", error)
    throw error
  }
}

module.exports = { getUserClubs }
