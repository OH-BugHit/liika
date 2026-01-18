const { sequelize } = require("../utils/database")
const Users = require("./users")
const Categories = require("./categories")
const Times = require("./times")
const Events = require("./Events")
const Clubs = require("./club")
const ClubMembers = require("./clubMember")
const Joins = require("./joins")
const Languages = require("./languages")
const Fields = require('./fields')
const ReservationSystems = require('./reservationSystems')
const Slots = require('./slots')
const FieldCategories = require('./fieldCategories')
const Settings = require(`./settings`)

// Määrittelemällä relaatiot ja viemällä kaikki mallit kerralla, tietokanta rakentuu oikein
Users.hasMany(Events, { foreignKey: "UserID" })
Events.belongsTo(Users, { foreignKey: "UserID" })

Categories.hasMany(Events, { foreignKey: "CategoryID" })

// Yhteys käyttäjiin ja kategorioihin
Events.belongsTo(Categories, { foreignKey: "CategoryID" })

Events.hasMany(Times, { foreignKey: "EventID" })
Times.belongsTo(Events, { foreignKey: "EventID" })

// Moni-moneen yhteys käyttäjien ja kerhojen välillä
Users.belongsToMany(Clubs, { through: ClubMembers, foreignKey: "UserID" })
Clubs.belongsToMany(Users, { through: ClubMembers, foreignKey: "ClubID" })
// Lisätään TimeID yhteys Joins-tauluun
Users.belongsToMany(Events, {
  through: { model: Joins, unique: false },
  foreignKey: "UserID",
})

Events.belongsToMany(Users, {
  through: { model: Joins, unique: false },
  foreignKey: "EventID",
})
// Joins- ja Times-taulut yhdistetään TimeID-viittauksella
Joins.belongsTo(Times, { foreignKey: "TimeID" })
Times.hasMany(Joins, { foreignKey: "TimeID" })

Users.belongsTo(Languages, { foreignKey: "LanguageID" })

ReservationSystems.belongsTo(Clubs, { foreignKey: "ClubID" })
ReservationSystems.hasMany(Fields, { foreignKey: "SystemID" })
// Yhteys käyttäjiin ja kategorioihin
Fields.belongsTo(ReservationSystems, { foreignKey: "SystemID" })
Fields.hasMany(Slots, { foreignKey: "FieldID" })
Slots.belongsTo(Fields, { foreignKey: "FieldID" })

// --- many-to-many assosiaatiot Fields <-> Categories ---
Fields.belongsToMany(Categories, {
  through: FieldCategories,
  foreignKey: "FieldID",
  otherKey: "CategoryID",
})
Categories.belongsToMany(Fields, {
  through: FieldCategories,
  foreignKey: "CategoryID",
  otherKey: "FieldID",
})

Fields.hasMany(FieldCategories, { foreignKey: 'FieldID' })

Fields.belongsTo(FieldCategories, {
  foreignKey: "FieldID",
})

// Viedään kaikki mallit kerralla
module.exports = {
  sequelize,
  Users,
  Categories,
  Times,
  Events,
  Clubs,
  ClubMembers,
  Joins,
  Languages,
  Fields,
  ReservationSystems,
  Slots,
  FieldCategories,
  Settings
}
