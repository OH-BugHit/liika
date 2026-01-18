const Users = require("../models/users")
const { Sequelize } = require("sequelize")
const { v4: uuidv4 } = require("uuid")

const randomString = (pituus) => {
  const merkit =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/[!"#¤%&/()=?+><_]/'
  return Array.from(
    { length: pituus },
    () => merkit[Math.floor(Math.random() * merkit.length)]
  ).join("")
}

const generateUserId = () => {
  return uuidv4() // Luo uuden uniikin tunnisteen
}

const createUserUnSigned = async (email) => {
  const UUID = generateUserId()
  const password = randomString(12)
  const user = await Users.create({
    Username: UUID,
    Password: password,
    Role: 2,
    Email: email,
    Location: Sequelize.fn("ST_GeomFromText", "POINT(29.7639 62.6000)"),
    LanguageID: "FI",
  })
  return user
}

module.exports = { createUserUnSigned, generateUserId }
