const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")
const Users = require("./users")
const Events = require("./Events")
const Times = require("./times")

const Joins = sequelize.define(
  "Joins",
  {
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Users,
        key: "UserID",
      },
    },
    EventID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Events,
        key: "EventID",
      },
      onDelete: "CASCADE",
    },
    TimeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Times,
        key: "TimeID",
      },
      onDelete: "CASCADE",
    },
  },
  { timestamps: false }
)

module.exports = Joins
