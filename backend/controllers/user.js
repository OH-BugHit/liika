const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { Router } = require("express")
const Users = require("../models/users")
const { Sequelize, where, Op } = require("sequelize")
const { userExtractor } = require("../utils/middleware")

const userRouter = Router()

/**
 * Käyttäjän tietojen haku
 */
userRouter.post("/user", userExtractor, async (request, response) => {
  const { userID } = request.body
  if (userID === request.user.dataValues.UserID) {
    // Eli userExtractorin tokenista ekstraktoima userID
    try {
      const user = await Users.findOne({
        // Etsitään käyttäjä
        where: {
          UserID: userID,
        },
        attributes: ["UserID", "Username", "Email", "Location", "LanguageID"],
      })
      response.status(200).send({
        user,
      })
    } catch (error) {
      console.log("PostgreSQL Error:", error)
      response.status(400).send({ error: `User not found` })
    }
  } else {
    console.error("Invalid token")
    response.status(401).json({ error: "Unauthorized" })
  }
}) // Tietojen haku päättyy

userRouter.post("/update/email", userExtractor, async (request, response) => {
  const { UserID, Email } = request.body
  if (UserID === request.user.dataValues.UserID) {
    // Eli userExtractorin tokenista ekstraktoima userID
    const existingUser = await Users.findOne({
      // Tarkastetaan ensin löytyykö jo sama sähköpostiosoite
      where: {
        Email: Email,
      },
    })

    if (existingUser) {
      return response.status(400).json({ message: "Sähköposti on jo käytössä" })
    }
    try {
      const user = await Users.update(
        { Email: Email },
        { where: { UserID: UserID } }
      )
      console.log(user)
      if (!user) {
        response.status(500).json({ error: "Internal server error" })
      }
      response.json(user)
    } catch (error) {
      console.error("Problems with updating email" + error)
      response.status(500).json({ error: "Internal server error" })
    }
  } else {
    console.error("Invalid token")
    response.status(401).json({ error: "Unauthorized" })
  }
}) // Sähköpostin päivitys päättyy

userRouter.post(
  "/update/username",
  userExtractor,
  async (request, response) => {
    const { UserID, Username } = request.body
    if (UserID === request.user.dataValues.UserID) {
      // Eli userExtractorin tokenista ekstraktoima userID
      const existingUser = await Users.findOne({
        // Tarkastetaan ensin löytyykö jo sama sähköpostiosoite
        where: {
          Username: Username,
        },
      })

      if (existingUser) {
        return response
          .status(400)
          .json({ message: "Käyttäjätunnus on jo käytössä" })
      }
      try {
        const user = await Users.update(
          { Username: Username },
          { where: { UserID: UserID } }
        )
        console.log(user)
        if (!user) {
          response.status(500).json({ error: "Internal server error" })
        }
        response.json(user)
      } catch (error) {
        console.error("Problems with updating email" + error)
        response.status(500).json({ error: "Internal server error" })
      }
    } else {
      console.error("Invalid token")
      response.status(401).json({ error: "Unauthorized" })
    }
  }
)

userRouter.post(
  "/update/language",
  userExtractor,
  async (request, response) => {
    const { UserID, LanguageID } = request.body
    if (UserID === request.user.dataValues.UserID) {
      // Eli userExtractorin tokenista ekstraktoima userID
      try {
        const user = await Users.update(
          { LanguageID: LanguageID },
          { where: { UserID: UserID } }
        )
        console.log(user)
        if (!user) {
          response.status(500).json({ error: "Internal server error" })
        }
        response.json(user)
      } catch (error) {
        console.error("Problems with updating email" + error)
        response.status(500).json({ error: "Internal server error" })
      }
    } else {
      console.error("Invalid token")
      response.status(401).json({ error: "Unauthorized" })
    }
  }
)

userRouter.post(
  "/update/password",
  userExtractor,
  async (request, response) => {
    const { UserID, newPassword } = request.body
    if (UserID === request.user.dataValues.UserID) {
      // Eli userExtractorin tokenista ekstraktoima userID
      const saltRounds = 10
      const passwordhash = await bcrypt.hash(newPassword, saltRounds)

      try {
        const user = await Users.update(
          { Password: passwordhash },
          { where: { UserID: UserID } }
        )
        console.log(user)
        if (!user) {
          response.status(500).json({ error: "Internal server error" })
        }
        response.json(user)
      } catch (error) {
        console.error("Problems with updating email" + error)
        response.status(500).json({ error: "Internal server error" })
      }
    } else {
      console.error("Invalid token")
      response.status(401).json({ error: "Unauthorized" })
    }
  }
)

userRouter.post(
  "/update/map_preferences",
  userExtractor,
  async (request, response) => {
    const { UserID, location, mapPreferences } = request.body
    // Eli userExtractorin tokenista ekstraktoima userID
    if (UserID === request.user.dataValues.UserID) {
      // Lyhennetään tietokantaa varten
      const shortPref = {
        a: mapPreferences.a,
        b: mapPreferences.b,
        br: mapPreferences.brightness,
        co: mapPreferences.contrast,
        g: mapPreferences.g,
        hu: mapPreferences.hue,
        in: mapPreferences.invert,
        r: mapPreferences.r,
        sa: mapPreferences.saturate,
        se: mapPreferences.sepia,
      }
      const mapPreferencesString = JSON.stringify(shortPref)
      try {
        const user = await Users.update(
          {
            Location: Sequelize.fn(
              "ST_SetSRID",
              Sequelize.fn("ST_MakePoint", location.lng, location.lat),
              4326
            ),
            MapPreferences: mapPreferencesString,
            MapZoom: location.zoom,
          },
          { where: { UserID: UserID } }
        )
        //console.log(user)
        if (!user) {
          response.status(500).json({ error: "Internal server error" })
        }
        response.json(user)
      } catch (error) {
        console.error("Problems with updating email" + error)
        response.status(500).json({ error: "Internal server error" })
      }
    } else {
      console.error("Invalid token")
      response.status(401).json({ error: "Unauthorized" })
    }
  }
)

module.exports = userRouter
