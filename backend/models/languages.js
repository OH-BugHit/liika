const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")

const Languages = sequelize.define(
  "Languages",
  {
    LanguageID: {
      type: DataTypes.STRING(3),
      primaryKey: true,
    },
    Language: { type: DataTypes.STRING(15), allowNull: false },
  },
  { timestamps: false }
)

module.exports = Languages
