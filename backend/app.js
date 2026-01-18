const express = require("express")
const app = express()
const cors = require("cors")
const morgan = require("morgan")
const middleware = require("./utils/middleware")
const { initializeDB } = require("./utils/database")
const resetDB = require("./dummyData/index.js")
const { resetTranslateTokens } = require("./services/resetTranslateTokens.js")
const {
  sequelize,
  Users,
  Categories,
  Times,
  Events,
  Club,
  ClubMember,
  Joins,
  Languages,
  Settings
} = require("./models/index")

const fs = require("fs")
const registerRouter = require("./controllers/register")
const loginRouter = require("./controllers/login")
const eventRouter = require("./controllers/events")
const reservationRouter = require('./controllers/reservation.js')
const translationRouter = require('./controllers/traslation.js')
const email = require("./services/email")
const userRouter = require("./controllers/user")
const logStream = fs.createWriteStream("./logs/access.log", { flags: "a" })
const path = require("path")

// Tietokantayhteys ja alustus
initializeDB(false) // Aseta muuttujaan false, mikäli et halua, että tietokanta nollaantuu

// Käynnistetään middlewaret
app.use(cors()) //cros-origin homma
app.use(express.json()) // JSON-body parseri

// Mukautetut tokenit Morganille
morgan.token("ip", (req) => req.ip) // IP-osoite
morgan.token("timestamp", () => new Date().toISOString()) // Aikaleima ISO-muodossa
morgan.token("body", (req) => JSON.stringify(req.body)) // Pyynnön body
morgan.token("user-agent", (req) => req.headers["user-agent"]) // User-Agent

const customFormat = // Mukautettu lokiformaatti terminaaliin
  ':ip [:timestamp] ":method :url" :status - Body: :body - Agent: ":user-agent" - Response time: :response-time ms'
const customFormat2 = // Mukautettu lokiformaatti tiedostoon
  ':ip [:timestamp] ":method :url" :status - Agent: ":user-agent" - Response time: :response-time ms'

app.use(
  morgan(customFormat2, {
    stream: logStream,
  })
) // HTTP pyyntöjen logitus
app.use(morgan(customFormat)) // HTTP pyynnöt terminaaliin
app.use(middleware.tokenExtractor) // Ekstraktoi tokenin

// API routerit
app.use(`/api/register`, registerRouter)
app.use(`/api/login`, loginRouter)
app.use(`/api/events`, eventRouter)
app.use(`/api/users`, userRouter)
app.use(`/api/reservation`, reservationRouter)
app.use(`/api/translate`, translationRouter)

// Staattiset tiedostot
app.use(express.static(path.join(__dirname, "public")))
// Reititys aloitussivulle
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// Loppuun laitetaan unknownEndpoint ja virheenKorjaus
app.use(middleware.unknownEndpoint)

setInterval(() => {
  resetTranslateTokens()
}, 60 * 1000 * 15) // Ajo joka 15. minuutti

module.exports = app
