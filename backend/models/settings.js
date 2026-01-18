const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")

const Settings = sequelize.define("Settings", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.TEXT, allowNull: false },
    value: { type: DataTypes.TEXT, allowNull: false },
},
    { timestamps: false })

module.exports = Settings
