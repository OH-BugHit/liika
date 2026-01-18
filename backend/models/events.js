const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")

const Events = sequelize.define("Events", {
  EventID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  Event_Location: { type: DataTypes.GEOMETRY("POINT", 4326), allowNull: false },
  Status: { type: DataTypes.STRING(32), allowNull: false },
  Description: { type: DataTypes.STRING(1700), allowNull: true },
  ParticipantMax: { type: DataTypes.INTEGER, allowNull: true },
  Title: { type: DataTypes.STRING(25), allowNull: false },
  ParticipantMin: { type: DataTypes.INTEGER, allowNull: true },
  ClubID: { type: DataTypes.INTEGER, allowNull: true },
})

module.exports = Events
