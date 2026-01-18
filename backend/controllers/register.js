const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { Router } = require("express")
const Users = require("../models/users")
const { Sequelize, where, Op } = require("sequelize")
const { Events, Times, Joins, sequelize } = require("../models")
const { sendEmail } = require("../services/email") // Tuo sendEmail-funktio
const { userExtractor } = require("../utils/middleware")

const registerRouter = Router()
const DEFAULT_TRANSLATE_TOKENS = 25000 // Oletusarvoiset translate tokenit

const VERIFICATION_CODES = new Map()

/**
 * Uuden käyttäjän rekisteröinti
 */
registerRouter.post("/", async (request, response) => {
  const { username, password, role, email, location, language, otp } =
    request.body

  // Tarkistetaan ensin one time password
  try {
    const storedCode = VERIFICATION_CODES.get(email) //Hae tallennettu koodi

    if (!storedCode) {
      return response
        .status(404)
        .json({ message: "Vahvistuskoodia ei löytynyt." })
    }

    console.log(otp)
    console.log(storedCode)
    if (storedCode === otp) {
      VERIFICATION_CODES.delete(email) //Poistetaan koodi, kun se on vahvistettu
    } else {
      return response
        .status(401)
        .json({ message: "Vahvistuskoodi on virheellinen." })
    }
  } catch (error) {
    return response.status(500).json({ message: "otp check failed" })
  }

  const existingUser = await Users.findOne({
    // Tarkastetaan ensin löytyykö jo sama käyttäjänimi tai sähköpostiosoite
    where: {
      [Op.or]: [{ Username: username }, { Email: email }],
    },
  })

  if (existingUser) {
    if (existingUser.Username === username) {
      return response
        .status(400)
        .json({ message: "Käyttäjänimi on jo käytössä" })
    }
    if (existingUser.Email === email) {
      if (existingUser.Role !== 2) {
        return response
          .status(400)
          .json({ message: "Sähköposti on jo käytössä" })
      }
      console.log("päivitetään käyttäjälle tiedot...")
      try {
        const saltRounds = 10
        const passwordhash = await bcrypt.hash(password, saltRounds)
        const user = await Users.update(
          {
            Email: email,
            Username: username,
            Role: role,
            Location: Sequelize.fn(
              "ST_SetSRID",
              Sequelize.fn("ST_MakePoint", location.lng, location.lat),
              4326
            ),
            LanguageID: language,
            Password: passwordhash,
            MapPreferences: null,
            MapZoom: 14,
          },
          { where: { Email: email } }
        )
        console.log(user)
        if (!user) {
          response.status(500).json({ error: "Internal server error" })
        }
        const userForToken = {
          // Luodaan tokeni käyttäjänimen ja id:n mukaan
          username: savedUser.Username,
          id: savedUser.UserID,
        }

        console.log(JSON.stringify(userForToken))
        const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
          // Luodaan tokeni uudelle käyttäjälle heti
          expiresIn: "60d",
        })
        response.status(200).send({
          token,
          username: savedUser.Username,
          userID: savedUser.UserID,
          email: savedUser.Email,
          location: [location.lng, location.lat],
        })
      } catch (error) {
        console.error("Problems with updating email" + error)
        response.status(500).json({ error: "Internal server error" })
      }
    }
  }

  const saltRounds = 10
  const passwordhash = await bcrypt.hash(password, saltRounds)

  try {
    const savedUser = await Users.create({
      // Uuden käyttäjän rekisteröinti
      Username: username,
      Password: passwordhash,
      Role: role,
      Email: email,
      Location: Sequelize.fn(
        "ST_SetSRID",
        Sequelize.fn("ST_MakePoint", location.lng, location.lat),
        4326
      ),
      LanguageID: language,
      MapPreferences: null,
      MapZoom: 14,
      TranslateTokens: DEFAULT_TRANSLATE_TOKENS,
    })

    const userForToken = {
      // Luodaan tokeni käyttäjänimen ja id:n mukaan
      username: savedUser.Username,
      id: savedUser.UserID,
    }

    console.log(JSON.stringify(userForToken))
    const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
      // Luodaan tokeni uudelle käyttäjälle heti
      expiresIn: "60d",
    })
    response.status(200).send({
      token,
      username: savedUser.Username,
      userID: savedUser.UserID,
      email: savedUser.Email,
      location: [location.lng, location.lat],
    })
  } catch (error) {
    console.log("PostgreSQL Error:", error)
    response.status(400).json({ error: `Error occured during user creation` })
  }
}) // Rekisteröinti päättyy

//Vahvistuskoodin luominen
const generateVerificationCode = () => {
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10).toString()
  }
  return code
}

//Vahvistuskoodin lähetys sähköpostiin
registerRouter.post("/sendOtp", async (req, res) => {
  const { email, language } = req.body

  try {
    const verificationCode = generateVerificationCode()

    let success = null
    if (language === "FI") {
      success = await sendEmail(
        email,
        "Sähköpostin vahvistus",
        `Vahvistuskoodisi on: ${verificationCode}`
      )
    } else {
      success = await sendEmail(
        email,
        "Email validation",
        `OTP code: ${verificationCode}`
      )
    }

    if (success) {
      res.status(200).json({ message: "Sähköposti lähetetty!" })

      VERIFICATION_CODES.set(email, verificationCode) // Tallennetaan koodi karttaan sähköpostiosoitteen perusteella
    } else {
      res.status(500).json({ message: "Sähköpostin lähetys epäonnistui." })
    }
  } catch (error) {
    console.error("Virhe:", error)
    res.status(500).json({ message: "Sähköpostin lähetys epäonnistui." })
  }
})
//Vahvistuskoodin lähetys sähköpostiin päättyy

registerRouter.post("/unregister", userExtractor, async (req, res) => {
  const { UserID } = req.body
  if (UserID === req.user.dataValues.UserID) {
    const transaction = await sequelize.transaction()
    try {
      // Poista liittymiset
      await Joins.destroy({ where: { UserID: UserID }, transaction })

      // Hae käyttäjän tapahtumat
      const userEvents = await Events.findAll({
        where: { UserID: UserID },
        transaction,
      })

      // Poista tapahtumien ajat ja liittymiset
      for (const event of userEvents) {
        await Joins.destroy({ where: { EventID: event.EventID }, transaction })
        await Times.destroy({ where: { EventID: event.EventID }, transaction })
      }

      // Poista tapahtumat
      await Events.destroy({ where: { UserID: UserID }, transaction })

      // Poista käyttäjä
      await Users.destroy({ where: { UserID: UserID }, transaction })

      // Hyväksy transaktio
      await transaction.commit()
      console.log("✅ Käyttäjä ja siihen liittyvät tiedot poistettu.")
      res
        .status(200)
        .json({ message: "User and affiliated data has been removed" })
    } catch (error) {
      // Perutaan transaktio, jos virhe tapahtuu
      await transaction.rollback()
      console.error("❌ Virhe käyttäjän poistossa:", error)
      res.status(500).json({
        error: "Error has occured while removing user from database...",
      })
    }
  }
})

module.exports = registerRouter
