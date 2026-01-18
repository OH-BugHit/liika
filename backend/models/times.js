const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")

const Times = sequelize.define(
  "Times",
  {
    TimeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    StartTime: { type: DataTypes.DATE, allowNull: false },
    EndTime: { type: DataTypes.DATE, allowNull: false },
    EventID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: false }
)

module.exports = Times
