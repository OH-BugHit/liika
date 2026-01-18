const { Router } = require("express")
const {
  getEventsNearby,
  getEventsNearbyQuick,
} = require("../services/getEventsNearby")
const {
  getSingleEventWithTimes,
} = require("../services/getSingleEventWithTimes")
const {
  Categories,
  Events,
  Times,
  Joins,
  sequelize,
  ClubMembers,
} = require("../models")
const { Sequelize, where } = require("sequelize")
const Users = require("../models/users")
const { sendEmail } = require("../services/email")
const {
  createUserUnSigned,
  generateUserId,
} = require("../services/createUserUnSigned")
const {
  getUserJoinedEvents,
  getUserCreatedEvents,
  getClubCreatedEvents,
  getUserJoinedEventsPast,
  getUserCreatedEventsPast,
  getClubCreatedEventsPast,
} = require("../services/getUserJoinedEvents")
const { userExtractor } = require("../utils/middleware")

const eventRouter = Router()

// Hae yksittäinen tapahtuma aikoineen ja osallistujamäärineen
eventRouter.post("/singleEventWithTimes", async (req, res) => {
  const { EventID } = req.body
  try {
    const event = await getSingleEventWithTimes(EventID)
    if (!event) {
      return res.status(404).json({ error: "Eventtiä ei löytynyt" })
    }
    res.json(event)
  } catch (error) {
    console.error("Virhe haettaessa tapahtumaa:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

/**
 * Hakee tapahtumat alueelta
 * Parametrina leveys- ja pituuspiiri, sekä maksimietäisyys pisteestä
 * Lisäksi mukana aikaväli jolla haetaan. Default aikaväli on nykyinen päivämäärä ja 00:00 + 30 päivää 23:59
 * Palauttaa tapahtuman tiedot, sekä osallistujamäärän (aktiivinen tai seuraava esiintymä tapahtumasta)
 */
eventRouter.post("/nearby", async (req, res) => {
  const {
    latitude,
    longitude,
    radius,
    startTime,
    endTime,
    startDate,
    endDate,
  } = req.body
  try {
    const events = await getEventsNearby(
      latitude,
      longitude,
      radius,
      startTime,
      endTime,
      startDate,
      endDate
    )
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: "Jotain meni pieleen" })
  }
}) // Tapahtumahaku päättyy

/**
 * Hakee tapahtumat alueelta
 * Parametrina leveys- ja pituuspiiri, sekä maksimietäisyys pisteestä
 * Lisäksi mukana aikaväli jolla haetaan. Default aikaväli on nykyinen päivämäärä ja 00:00 + 30 päivää 23:59
 * Palauttaa tapahtuman tiedot, sekä osallistujamäärän (aktiivinen tai seuraava esiintymä tapahtumasta)
 */
eventRouter.post("/nearbyQuick", async (req, res) => {
  const { latitude, longitude, radius, startTimeDate, endTimeDate } = req.body
  try {
    const events = await getEventsNearbyQuick(
      latitude,
      longitude,
      radius,
      startTimeDate,
      endTimeDate
    )
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: "Jotain meni pieleen" })
  }
}) // Tapahtumahaku päättyy

// Hae kaikki kategoriat
eventRouter.get("/categories", async (req, res) => {
  try {
    const categories = await Categories.findAll()
    res.json(categories)
  } catch (error) {
    console.error("Virhe haettaessa kategorioita:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}) // Kategoriahaku päättyy

// Luo tapahtuma
eventRouter.post("/create_event", userExtractor, async (req, res) => {
  const {
    event_location,
    title,
    userID,
    categoryID,
    participantsMax,
    participantsMin,
    description,
    dates,
    startTime,
    endTime,
    clubID,
  } = req.body

  if (userID === req.user?.dataValues?.UserID ?? "NAN") {
    if (clubID) {
      // Tarkastetaan onko oikeus luoda yhteistyökumppanille tapahtumia (eli ei ole feikattu postpyyntö tavallisella käyttäjällä)
      try {
        const result = await ClubMembers.findOne({
          where: {
            UserID: userID,
            ClubID: clubID,
          },
        })
        if (!result) {
          res.status(403).json({ error: "Not part of the club at request" })
        }
      } catch (e) {
        console.error(e)
        res.status(500).send()
      }
    }

    const transaction = await sequelize.transaction()

    try {
      // Luodaan event transaktion sisällä
      const event = await Events.create(
        {
          Event_Location: Sequelize.fn(
            "ST_SetSRID",
            Sequelize.fn(
              "ST_MakePoint",
              event_location.lng,
              event_location.lat
            ),
            4326
          ),
          Status: "Basic",
          Title: title,
          UserID: userID,
          CategoryID: categoryID,
          ParticipantMax: participantsMax,
          ParticipantMin: participantsMin,
          Description: description,
          ClubID: clubID,
        },
        { transaction }
      )

      // Luodaan tapahtuman ajat
      await Promise.all(
        dates.map(async (timestamp) => {
          const date = new Date(timestamp).toISOString().split("T")[0] // YYYY-MM-DD

          await Times.create(
            {
              StartTime: `${date} ${startTime}:00`,
              EndTime: `${date} ${endTime}:00`,
              EventID: event.EventID,
            },
            { transaction }
          )
        })
      )

      // Jos kaikki onnistui, commitoidaan transaktio
      await transaction.commit()
      res.status(201).send()
    } catch (error) {
      console.error("Virhe tapahtuman luonnissa:", error)

      // Rollback jos virhe tapahtui
      await transaction.rollback()
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
}) // Tapahtuman luonti päättyy

//Tapahtuman luonti kirjautumaton
eventRouter.post("/create_event_unsigned", async (req, res) => {
  const {
    title,
    categoryID,
    dates,
    startTime,
    endTime,
    event_location,
    participantsMin,
    participantsMax,
    description,
    email,
  } = req.body

  // Luodaan satunnainen salasana
  const randomString = (length) => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/[!"#¤%&/()=?+><_]/'
    return Array.from(
      { length },
      () => characters[Math.floor(Math.random() * characters.length)]
    ).join("")
  }
  const password = randomString(12)

  // Aloitetaan transaktio
  const transaction = await sequelize.transaction()

  try {
    // Tarkistetaan ensin löytyykö käyttäjää jo
    let user = await Users.findOne({
      where: {
        Email: email,
      },
      attributes: ["UserID", "Role"],
      transaction,
    })
    if (!user) {
      // Jos uusi käyttäjä
      const UUID = generateUserId()
      user = await Users.create(
        {
          Username: UUID,
          Password: password,
          Role: 2,
          Email: email,
          Location: Sequelize.fn("ST_GeomFromText", "POINT(29.7639 62.6000)"),
          LanguageID: "FI",
        },
        { transaction }
      )
    }

    if (user && user.Role === 2) {
      // Jos vanha käyttäjä joka ei ole rekisteröitynyt
      // Luodaan tapahtuma
      const event = await Events.create(
        {
          Event_Location: Sequelize.fn(
            "ST_SetSRID",
            Sequelize.fn(
              "ST_MakePoint",
              event_location.lng,
              event_location.lat
            ),
            4326
          ),
          Status: "Basic",
          Title: title,
          UserID: user.UserID,
          CategoryID: categoryID,
          ParticipantMax: participantsMax,
          ParticipantMin: participantsMin,
          Description: description,
        },
        { transaction }
      )

      // Luodaan tapahtuman aika
      await Promise.all(
        dates.map(async (timestamp) => {
          const date = new Date(timestamp).toISOString().split("T")[0] // YYYY-MM-DD

          await Times.create(
            {
              StartTime: `${date} ${startTime}:00`,
              EndTime: `${date} ${endTime}:00`,
              EventID: event.EventID,
            },
            { transaction }
          )
        })
      )

      // Jos kaikki onnistuu, commitoidaan transaktio
      await transaction.commit()
      res.status(201).json({ message: "Event created successfully" })
    } else {
      res.status(401).json({ message: "User alredy registered" })
      console.error("User already registered")
    }
  } catch (error) {
    console.error("Virhe tapahtuman luonnissa:", error)

    // Rollback jos virhe tapahtui
    await transaction.rollback()
    res.status(500).json({ error: "Internal Server Error" })
  }
}) //Tapahtuman luonti kirjautumaton päättyy

// Liity tapahtumaan
eventRouter.post("/join_event", userExtractor, async (req, res) => {
  const { UserID, EventID, TimeID } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    try {
      const response = await Joins.create({
        UserID: UserID,
        EventID: EventID,
        TimeID: TimeID,
      })
      res.status(200).send()
    } catch (error) {
      console.error("Problems when joining event: " + error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
}) // Tapahtumaan liittyminen kirjautumaton
eventRouter.post("/join_event_unsigned", async (req, res) => {
  const { Email, EventID, TimeID } = req.body
  console.log("email eventRouter: " + Email)
  try {
    let user = await Users.findOne({
      where: {
        Email: Email,
      },
      attributes: ["UserID", "Role"],
    })
    if (!user) {
      user = await createUserUnSigned(Email)
      console.log("Uusi käyttäjä luotu:", newUser)
    }
    if (user.Role === 2) {
      try {
        const response = await Joins.create({
          UserID: user.UserID,
          EventID: EventID,
          TimeID: TimeID,
        })
        res.status(200).send()
      } catch (error) {
        console.error("Problems when joining event: " + error)
        res.status(500).json({ error: "Internal Server Error" })
      }
    } else {
      res.status(401).json({ message: "User alredy registered" })
      console.error("User already registered")
    }
  } catch (error) {
    console.error("Käyttäjän luominen epäonnistui:", error)
    // Tässä voit käsitellä virheen
  }
}) // Liittyminen tapahtumaan kirjautumaton päättyy

// Poistu tapahtumasta
eventRouter.post("/leave_event", userExtractor, async (req, res) => {
  const { UserID, EventID, TimeID } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    try {
      const deletedRows = await Joins.destroy({
        where: {
          UserID: UserID,
          EventID: EventID,
          TimeID: TimeID,
        },
      })
      if (deletedRows > 0) {
        res.status(200).json({ message: "Left event successfully" })
      } else {
        res.status(404).json({ error: "Event not found or already left" })
      }
    } catch (error) {
      console.error("Problems when leaving event: " + error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

// Hae käyttäjän liitytyt tapahtumat (id:t joinsista) ONKO YLIMÄÄRÄINEN??? 11.3.
eventRouter.post("/joined", userExtractor, async (req, res) => {
  const { UserID } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    try {
      const response = await Joins.findAll({
        where: { UserID: UserID },
      })
      res.status(200).json(response)
    } catch (error) {
      console.error("Problems with retreving joined evets for user: " + error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

// Hakee käyttäjän liitytyt tapahtumat (data)
eventRouter.post("/userJoinedEvents", userExtractor, async (req, res) => {
  const { UserID } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    try {
      const events = await getUserJoinedEvents(UserID)
      res.json(events)
    } catch (error) {
      console.error("Problems with retreving joined events with full data")
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

// Hakee käyttäjän menneet liitytyt tapahtumat (data)
eventRouter.post("/userJoinedEventsPast/", userExtractor, async (req, res) => {
  const { UserID } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    try {
      const events = await getUserJoinedEventsPast(UserID)
      res.json(events)
    } catch (error) {
      console.error("Problems with retreving joined events with full data")
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

// Käyttäjän luomat tapahtumat
eventRouter.post("/userCreatedEvents", userExtractor, async (req, res) => {
  const { UserID } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    try {
      const events = await getUserCreatedEvents(UserID)
      res.json(events)
    } catch (error) {
      console.error("Problems with retreving joined events with full data")
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

// Käyttäjän luomat menneet tapahtumat
eventRouter.post("/userCreatedEventsPast", userExtractor, async (req, res) => {
  const { UserID } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    try {
      const events = await getUserCreatedEventsPast(UserID)
      res.json(events)
    } catch (error) {
      console.error("Problems with retreving joined events with full data")
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

// Yhteistyökumppanin tapahtumien haku
eventRouter.post("/club_created_events", userExtractor, async (req, res) => {
  const { UserID, Clubs } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    try {
      // Haetaan tapahtumat, joiden ClubID on mukana listassa
      const events = await getClubCreatedEvents(Clubs)
      res.json(events)
    } catch (error) {
      console.error("Virhe haettaessa yhteistyökumppanin tapahtumia:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

// Yhteistyökumppanin menneiden tapahtumien haku
eventRouter.post("/club_created_eventsPast", userExtractor, async (req, res) => {
  const { UserID, Clubs } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    try {
      // Haetaan tapahtumat, joiden ClubID on mukana listassa
      const events = await getClubCreatedEventsPast(Clubs)
      res.json(events)
    } catch (error) {
      console.error("Virhe haettaessa yhteistyökumppanin tapahtumia:", error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

// Poistetaan yksittäinen aika. (Käyttää cascade-metodia)
eventRouter.post("/delete/time", userExtractor, async (req, res) => {
  const { UserID, TimeID } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    try {
      const deletedRows = await Times.destroy({ where: { TimeID: TimeID } })
      if (deletedRows > 0) {
        res.status(200).json({ message: "Time deleted successfully" })
      } else {
        res
          .status(404)
          .json({ error: "Time for event not found or already deleted" })
      }
    } catch (error) {
      console.error("Problems with deleting time")
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

// Poistetaan koko tapahtuma
eventRouter.post("/delete/event", userExtractor, async (req, res) => {
  const { UserID, EventID, TimeID } = req.body
  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    const transaction = await sequelize.transaction()
    try {
      await Times.destroy({ where: { TimeID: TimeID }, transaction })
      await Events.destroy({ where: { EventID: EventID }, transaction })

      await transaction.commit()
      console.log(`Event ${EventID} and related joins deleted.`)
      res.status(200).json({ message: "Event deleted successfully" })
    } catch (error) {
      console.error("Problems with deleting event" + error)
      await transaction.rollback()
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

// Tapahtuman muokkaaminen (päivittäminen)
eventRouter.post("/update", userExtractor, async (req, res) => {
  const {
    Title,
    UserID,
    CategoryID,
    Dates,
    StartTime,
    EndTime,
    Event_Location,
    ParticipantsMin,
    ParticipantsMax,
    Description,
    EventID,
  } = req.body

  if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
    // Eli userExtractorin tokenista ekstraktoima userID
    const transaction = await sequelize.transaction() // aloitetaan transaktio
    try {
      const event = await Events.update(
        {
          Title: Title,
          CategoryID: CategoryID,
          ParticipantMin: ParticipantsMin,
          ParticipantMax: ParticipantsMax,
          Description: Description,
          Event_Location: Sequelize.fn(
            "ST_SetSRID",
            Sequelize.fn(
              "ST_MakePoint",
              Event_Location.lng,
              Event_Location.lat
            ),
            4326
          ),
        },
        { where: { EventID: EventID }, },
        { transaction }
      )

      if (StartTime || EndTime) {
        const oldTimes = await Times.findAll({ where: { EventID }, transaction })

        await Promise.all(
          oldTimes.map(async (oldTime) => {
            const date = oldTime.StartTime.toISOString().split("T")[0] // säilytetään vanha päivämäärä

            await Times.update(
              {
                StartTime: `${date} ${StartTime}`,
                EndTime: `${date} ${EndTime}`,
              },
              {
                where: { TimeID: oldTime.TimeID },
                transaction,
              }
            )
          })
        )
      }

      // Lisätään tapahtuman uudet ajat myös
      await Promise.all(
        Dates.map(async (timestamp) => {
          const date = new Date(timestamp).toISOString().split("T")[0] // YYYY-MM-DD

          await Times.create(
            {
              StartTime: `${date} ${StartTime}`,
              EndTime: `${date} ${EndTime}`,
              EventID: EventID,
            },
            { transaction }
          )
        })
      )

      // Jos kaikki ok:
      await transaction.commit()
      res.status(200).send({ message: "Event updated succesfully." })
    } catch (error) {
      console.error("Error updating event: " + error)
      // Rollback jos virhe tapahtui
      await transaction.rollback()
      res.status(500).json({ error: "Internal Server Error" })
    }
  } else {
    console.error("Invalid token")
    res.status(401).json({ error: "Unauthorized" })
  }
})

//Vahvistuskoodin luominen
const generateVerificationCode = () => {
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += Math.floor(Math.random() * 10).toString()
  }
  return code
}

const verificationCodes = new Map() //----VOIDAAN VAIHTAA TIETOKANTAAN JOS HALUTAAN----

//Vahvistuskoodin lähetys sähköpostiin
eventRouter.post("/sendOtp", async (req, res) => {
  const { email } = req.body

  console.log("email " + email)

  try {
    const verificationCode = generateVerificationCode()

    const success = await sendEmail(
      email,
      "Sähköpostin vahvistus",
      `Vahvistuskoodisi on: ${verificationCode}`
    )

    if (success) {
      res.status(200).json({ message: "Sähköposti lähetetty!" })

      verificationCodes.set(email, verificationCode) // Tallennetaan koodi karttaan sähköpostiosoitteen perusteella
    } else {
      res.status(500).json({ message: "Sähköpostin lähetys epäonnistui." })
    }
  } catch (error) {
    console.error("Virhe:", error)
    res.status(500).json({ message: "Sähköpostin lähetys epäonnistui." })
  }
})
//Vahvistuskoodin lähetys sähköpostiin päättyy

//Vahvistuskoodin vertailu
eventRouter.post("/verifyOtp", async (req, res) => {
  //const testCode = "123456"

  const { email, otp } = req.body
  console.log("VerifyOtp rq body : " + req.body)

  //verificationCodes.set(email, testCode);

  try {
    const storedCode = verificationCodes.get(email) //Hae tallennettu koodi

    if (!storedCode) {
      return res.status(400).json({ message: "Vahvistuskoodi ei löytynyt." })
    }

    if (storedCode === otp) {
      verificationCodes.delete(email) //Poistetaan koodi, kun se on vahvistettu
      res.status(200).json({ message: "Vahvistuskoodi oikein!" })
    } else {
      res.status(400).json({ message: "Vahvistuskoodi on virheellinen." })
    }
  } catch (error) {
    console.error("Virhe:", error)
    res.status(500).json({ message: "Vahvistus epäonnistui." })
  }
})

module.exports = eventRouter
