const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")

const Fields = sequelize.define("Fields", {
    FieldID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    Name: { type: DataTypes.STRING(60), allowNull: false },
    Description: { type: DataTypes.STRING(1700), allowNull: true },
    Liika: { type: DataTypes.BOOLEAN, allowNull: false, default: true },
    URL: { type: DataTypes.TEXT, allowNull: true },
    Opening_Hours: { type: DataTypes.JSONB, allowNull: true }
})


module.exports = Fields
