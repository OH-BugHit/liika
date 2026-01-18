const { Sequelize } = require("sequelize")
const { POSTGRESQL_URI, SSL } = require("./config")

var sequelize

if (SSL) {
  sequelize = new Sequelize(POSTGRESQL_URI, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true, // Pakotetaan SSL-yhteys
        rejectUnauthorized: false,
      },
    },
  })
} else {
  sequelize = new Sequelize(POSTGRESQL_URI, {
    dialect: "postgres",
    logging: false,
  })
}

const queryInterface = sequelize.getQueryInterface()

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log(`PosgreSQL-tietokantayhteys luotu!`)

    try {
      /*      
            await sequelize.query(`
        
      `)
      */
    } catch (e) {
      console.warn("tietokantayhteyden luominen epäonnistui")
      console.warn(e)
    }

    // Luo PostGIS-laajennus, jos sitä ei ole

    //await sequelize.query('CREATE EXTENSION IF NOT EXISTS "postgis";')

    console.log("✅ connectDB suoritettu!")
  } catch (error) {
    console.error(`PostgreSQL-yhteys epäonnistui`, error)
  }
}

const initializeDB = async (alustetaan) => {
  try {
    await connectDB().then(() => {
      if (alustetaan) {
        sequelize.sync({ alter: true, force: true }).then(() => resetDB())
      }
    })
  } catch (error) {
    console.warn("Yhdistäminen päonnistui")
    console.warn(error)
  }
}

module.exports = { sequelize, connectDB, queryInterface, initializeDB }
