const { sequelize } = require("../utils/database")

const getReservationSystemList = async (clubs) => {
    try {
        if (!clubs || clubs.length === 0) {
            return []
        }
        const clubIds = clubs.map((club) => club.ClubID)

        const rsList = await sequelize.query(
            `
      SELECT rs.*, c."Name"
      FROM "ReservationSystems" rs
      LEFT JOIN "Clubs" c ON rs."ClubID" = c."ClubID"
      WHERE c."ClubID" IN (:clubIds)
      GROUP BY c."Name", rs."SystemID"
      ORDER BY c."Name" DESC
      `,
            {
                replacements: { clubIds },
                type: sequelize.QueryTypes.SELECT,
            }
        )

        return rsList
    } catch (error) {
        console.error("Virhe haettaessa käyttäjän liittymiä tapahtumia: " + error)
        throw new Error("Internal server error")
    }
}

module.exports = { getReservationSystemList }