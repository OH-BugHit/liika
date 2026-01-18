const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { Router } = require("express")
const User = require("../models/users")
const { sendEmail } = require("../services/email") // Tuo sendEmail-funktio
const { getUserClubs } = require("../services/getUserClubs")
const { Op } = require("sequelize")

const loginRouter = Router()

// Kirjautuminen
loginRouter.post("/", async (req, res) => {
  const { username, password } = req.body

  console.log(" req body username: " + username)
  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ Username: username }, { Email: username }],
      },
    })
    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.Password)
    if (!(user && passwordCorrect)) {
      return res.status(401).json({
        error: "invalid username or password",
      })
    }

    const userForToken = {
      username: user.Username,
      id: user.UserID,
    }

    const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
      expiresIn: "60d",
    })

    const clubs = await getUserClubs(user.UserID)
    console.log(clubs)
    console.log("Yhteistyökumppanit")
    let mapPreferences
    if (user.MapPreferences) {
      const olio = JSON.parse(user.MapPreferences)
      mapPreferences = {
        a: olio.a,
        b: olio.b,
        brightness: olio.br,
        contrast: olio.co,
        g: olio.g,
        hue: olio.hu,
        invert: olio.in,
        r: olio.r,
        saturate: olio.sa,
        sepia: olio.se,
      }
    } else {
      mapPreferences = null
    }

    res.status(200).send({
      token,
      userID: user.UserID,
      username: user.Username,
      location: user.Location.coordinates,
      email: user.Email,
      language: user.LanguageID,
      mapZoom: user.MapZoom,
      mapPreferences: mapPreferences,
      role: user.Role,
      clubs: clubs,
    })
  } catch (error) {
    console.log(error)
  }
}) // Kirjautuminen päättyy

// Reitti salasanan palauttamiseen
loginRouter.post("/sendEmail", async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ where: { Email: email } })
    if (!user) {
      return res.status(404).json({ message: "Sähköpostia ei löydy." })
    }

    // 1. Luodaan kertakäyttöinen salasana

    let char = "L"
    const tempPassword = Math.random().toString(36).slice(2)
    const password = char + tempPassword
    const hashedTempPassword = await bcrypt.hash(password, 10)

    // 2. Tallennetaan kertakäyttöinen salasana tietokantaan
    user.Password = hashedTempPassword
    await user.save()

    const success = await sendEmail(
      email,
      "Salasanan palautus",
      `Kertakäyttöinen salasanasi on: ${password}\n\nKäytä tätä salasanaa kirjautuessasi sisään. Muista vaihtaa salasanasi heti kirjautumisen jälkeen.`
    )

    if (success) {
      res.status(200).json({ message: "Sähköposti lähetetty!" })
    } else {
      res.status(500).json({ message: "Sähköpostin lähetys epäonnistui." })
    }
  } catch (error) {
    console.error("Virhe:", error)
    res.status(500).json({ message: "Sähköpostin lähetys epäonnistui." })
  }
}) // Salasanan palauttaminen päättyy

module.exports = loginRouter
