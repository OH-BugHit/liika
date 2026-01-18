require("dotenv").config()

let PORT = process.env.PORT || 3003
let POSTGRESQL_URI =
  process.env.NODE_ENV === "dev"
    ? process.env.TEST_POSTGRESQL_URI
    : process.env.POSTGRESQL_URI

let SSL = process.env.NODE_ENV === "dev" ? false : true

module.exports = {
  POSTGRESQL_URI,
  PORT,
  SSL,
}
