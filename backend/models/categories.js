const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")

const Categories = sequelize.define(
  "Categories",
  {
    CategoryID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Category: { type: DataTypes.STRING(32), allowNull: false },
  },
  { timestamps: false }
)

module.exports = Categories
