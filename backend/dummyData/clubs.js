const Clubs = require("../models/club")
module.exports = {
  up: async (queryInterface, sequelize) => {
    return queryInterface.bulkInsert("Clubs", [
      {
        ClubID: 1,
        Name: "Joensuun Pallopojat",
        Email: "joepalpojat@gmail.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ClubID: 2,
        Name: "Joensuun Jalkapalloseura",
        Email: "joejalkpseur@hotmail.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ClubID: 3,
        Name: "Helsingin Jääkiekkoseura",
        Email: "heljaaseur@gmail.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ClubID: 4,
        Name: "Helsingin Jalkapalloseura",
        Email: "heljalkpseur@hotmail.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ClubID: 5,
        Name: "Helsingin Sulkapalloseura",
        Email: "helsulpalseur@gmail.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },
  down: async (queryInterface, sequelize) => {
    return queryInterface.bulkDelete("Clubs", null, {})
  },
}
