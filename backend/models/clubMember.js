const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")

const ClubMembers = sequelize.define("ClubMembers", {}, { timestamps: false })

module.exports = ClubMembers
