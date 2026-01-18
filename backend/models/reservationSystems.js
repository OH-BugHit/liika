const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")

const ReservationSystems = sequelize.define("ReservationSystems", {
    SystemID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    Establishment_Location: { type: DataTypes.GEOMETRY("POINT", 4326), allowNull: false },
    Description: { type: DataTypes.STRING(1700), allowNull: true },
    Title: { type: DataTypes.STRING(60), allowNull: false },
    Rental: { type: DataTypes.BOOLEAN, allowNull: false, default: false },
    PopUpText: { type: DataTypes.STRING(200), allowNull: false },
})

module.exports = ReservationSystems
