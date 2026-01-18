const { up: upCategories, down: downCategories } = require("./categories")
const { up: upClubs, down: downClubs } = require("./clubs")
const { up: upLanguages, down: downLanguages } = require("./languages")
const { sequelize } = require("../utils/database")
const { queryInterface } = require("../utils/database")

module.exports = resetDB = async () => {
  await downCategories(queryInterface, sequelize)
    .then(() => downClubs(queryInterface, sequelize))
    .then(() => downLanguages(queryInterface, sequelize))
    .then(() => upLanguages(queryInterface, sequelize))
    .then(() => upCategories(queryInterface, sequelize))
    .then(() => upClubs(queryInterface, sequelize))
}
