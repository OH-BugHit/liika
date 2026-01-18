const Languages = require("../models").Languages
module.exports = {
  up: (queryInterface, sequelize) => {
    return queryInterface.bulkInsert("Languages", [
      {
        LanguageID: "FI",
        Language: "Finnish",
      },
      {
        LanguageID: "EN",
        Language: "English",
      },
    ])
  },

  down: (queryInterface, sequelize) => {
    return queryInterface.bulkDelete("Languages", null, {})
  },
}
