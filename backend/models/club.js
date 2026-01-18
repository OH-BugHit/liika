const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")

const Clubs = sequelize.define("Clubs", {
  ClubID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  Name: { type: DataTypes.STRING(80), allowNull: false },
  Email: { type: DataTypes.STRING(40), allowNull: false },
})

module.exports = Clubs
