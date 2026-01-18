// models/fieldCategories.js
const { DataTypes } = require("sequelize")
const { sequelize } = require("../utils/database")

const FieldCategories = sequelize.define(
    "FieldCategories",
    {
        FieldID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: { model: "Fields", key: "FieldID" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        CategoryID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: { model: "Categories", key: "CategoryID" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
    },
    { timestamps: false }
)

module.exports = FieldCategories
