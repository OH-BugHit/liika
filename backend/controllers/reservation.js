const { Router } = require("express")
const { Sequelize, where, Op } = require("sequelize")
const { userExtractor } = require("../utils/middleware")
const { getReservationSystemList } = require('../services/getReservationSystemList')
const { getReservationSystemsNearby } = require('../services/getReservationSystemsNearby')
const { FieldCategories, ClubMembers, Fields, ReservationSystems, Slots, sequelize } = require('../models')

const reservationRouter = Router()

/**
 * Kenttävarausjärjestelmän luonti
 */
reservationRouter.post("/create", userExtractor, async (request, response) => {
    const {
        title,
        popUpText,
        event_location,
        description,
        rentalAvailable,
        userID,
        clubID,
    } = request.body

    if (userID === request.user.dataValues.UserID) {
        // Eli userExtractorin tokenista ekstraktoima userID
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
                    response.status(403).json({ error: "Not part of the club at request" })
                } else {
                    const reservationSystem = await ReservationSystems.create({
                        Establishment_Location: Sequelize.fn(
                            "ST_SetSRID",
                            Sequelize.fn(
                                "ST_MakePoint",
                                event_location.lng,
                                event_location.lat
                            ),
                            4326
                        ),
                        Description: description,
                        Title: title,
                        ClubID: clubID,
                        Rental: rentalAvailable,
                        PopUpText: popUpText,
                    })
                    console.log(reservationSystem)
                    response.status(201).json({ SystemID: reservationSystem.dataValues.SystemID })
                }
            } catch (e) {
                console.error(e)
                response.status(500).send()
            }
        }
    } else {
        console.error("Invalid token")
        response.status(401).json({ error: "Unauthorized" })
    }
}) // Kenttävarausjärjestelmän luonti päättyy

// "Omien" kenttävarausjärjestelmien listaus
reservationRouter.post("/get_list", userExtractor, async (request, response) => {
    const {
        clubs,
        userID
    } = request.body

    if (userID === request.user.dataValues.UserID) {
        // Eli userExtractorin tokenista ekstraktoima userID
        // TODO: Tee tarkastus saako käyttäjä hakea juuri näitä clubeja!
        try {
            const rsList = await getReservationSystemList(clubs)
            response.status(200).json(rsList)
        } catch (error) {
            console.error("Problems with retreving joined evets for user: " + error)
            response.status(500).json({ error: "Internal Server Error" })
        }
    } else {
        console.error("Invalid token")
        response.status(401).json({ error: "Unauthorized" })
    }
}) // Kenttävarausjärjestelmien listaus päättyy

// Yksittäisen kenttävarausjärjestelmän tietojen haku
reservationRouter.post("/get_single", userExtractor, async (request, response) => {
    const {
        SystemID,
        userID
    } = request.body

    if (userID === request.user.dataValues.UserID) {
        // Eli userExtractorin tokenista ekstraktoima userID
        // Tarkastetaan vielä, että oli oikeus muokata
        try {
            const system = await ReservationSystems.findOne({
                where: {
                    SystemID: SystemID
                }
            })
            const result = await ClubMembers.findOne({
                where: {
                    UserID: userID,
                    ClubID: system.dataValues.ClubID,
                },
            })
            if (!result) {
                response.status(403).json({ error: "Not part of the club at request" })
            }
            response.status(200).json(system)
        } catch (error) {
            console.error("Problems with retreving system for user: " + error)
            response.status(500).json({ error: "Internal Server Error" })
        }
    } else {
        console.error("Invalid token")
        response.status(401).json({ error: "Unauthorized" })
    }
}) // Yksittäisen haku päättyy

// Kenttävarausjärjestelmän päivittäminen
reservationRouter.post("/update_system", userExtractor, async (request, response) => {
    const {
        UserID,
        Title,
        Establishment_Location,
        Description,
        Rental,
        PopUpText,
        SystemID,
        ClubID,
    } = request.body

    if (UserID === request.user?.dataValues?.UserID ?? "NAN") {
        // Eli userExtractorin tokenista ekstraktoima userID
        try {
            const result = await ClubMembers.findOne({
                where: {
                    UserID: UserID,
                    ClubID: ClubID,
                },
            })
            if (!result) {
                response.status(403).json({ error: "Not part of the club at request" })
            }
            const newRS = await ReservationSystems.update(
                {
                    Title: Title,
                    PopUpText: PopUpText,
                    Description: Description,
                    Rental: Rental,
                    Establishment_Location: Sequelize.fn(
                        "ST_SetSRID",
                        Sequelize.fn(
                            "ST_MakePoint",
                            Establishment_Location.lng,
                            Establishment_Location.lat
                        ),
                        4326
                    ),
                },
                { where: { SystemID: SystemID } }
            )

            response.status(200).send({ message: "Reservation system updated succesfully." })
        } catch (error) {
            console.error("Error updating reservation system: " + error)
            response.status(500).json({ error: "Internal Server Error" })
        }
    } else {
        console.error("Invalid token")
        response.status(401).json({ error: "Unauthorized" })
    }
}) // Kenttävarausjärjestelmän päivittäminen päättyy

// Kentän lisääminen
reservationRouter.post("/create_field", userExtractor, async (request, response) => {
    const {
        userID,
        Name,
        Description,
        Liika,
        URL,
        SystemID,
        ClubID,
        Opening_Hours,
        fieldCategories
    } = request.body

    if (userID === request.user.dataValues.UserID) {
        // Eli userExtractorin tokenista ekstraktoima userID
        // Tarkastetaan onko oikeus luoda yhteistyökumppanille tapahtumia (eli ei ole feikattu postpyyntö tavallisella käyttäjällä)
        try {
            const system = await ReservationSystems.findOne({ // Varmistetaan ensin clubin liittyminen Järjestelmään
                where: {
                    SystemID: SystemID,
                    ClubID: ClubID,
                },
            })
            if (!system) {
                response.status(403).json({ error: "User not part of the System at request" })
            }
            const clubMem = await ClubMembers.findOne({ // Ja varmistetaan, että henkilö kuuluu clubiin
                where: {
                    ClubID: ClubID,
                    UserID: userID
                },
            })
            if (!clubMem) {
                response.status(403).json({ error: "User not part of the System at request" })
            }
            const newField = await Fields.create({
                Description: Description,
                Name: Name,
                Liika: Liika,
                URL: URL,
                Opening_Hours: Opening_Hours,
                SystemID: SystemID,
            }
            )
            console.log(newField)
            // Tämä korvaa kentän kategoriat annetuilla ID:eillä:
            await newField.setCategories(fieldCategories)
            response.status(201).json({ NewField: newField })
        } catch (e) {
            console.error(e)
            response.status(500).send()
        }
    } else {
        console.error("Invalid token")
        response.status(401).json({ error: "Unauthorized" })
    }
}) // Kenttävarausjärjestelmän luonti päättyy

// "Omien" kenttävarausjärjestelmien listaus
reservationRouter.post("/get_fields", userExtractor, async (request, response) => {
    const {
        SystemID,
        userID
    } = request.body

    if (userID === request.user.dataValues.UserID) {
        // Eli userExtractorin tokenista ekstraktoima userID
        // TODO: Tee tarkastus saako käyttäjä hakea juuri näitä clubeja!
        try {
            const fields = await Fields.findAll({
                where: {
                    SystemID: SystemID
                }
            })
            response.status(200).json(fields)
        } catch (error) {
            console.error("Problems with retreving fields" + error)
            response.status(500).json({ error: "Internal Server Error" })
        }
    } else {
        console.error("Invalid token")
        response.status(401).json({ error: "Unauthorized" })
    }
}) // Kenttävarausjärjestelmien listaus päättyy

// Yksittäisen kentän tietojen haku (haku ei vaadi kirjautumista)
reservationRouter.post("/get_field", async (request, response) => {
    const { FieldID } = request.body
    try {
        const field = await Fields.findOne({
            // Etsitään kenttä
            where: {
                FieldID: FieldID,
            },
            attributes: ["FieldID", "Name", "Description", "Liika", "URL", "Opening_Hours", "SystemID"],
            include: [
                {
                    model: FieldCategories, // Linkki FieldCategories-tauluun
                    attributes: ["CategoryID"], // Voit lisätä lisää attribuutteja, jos haluat
                }
            ]
        })
        response.status(200).json({
            field,
        })
    } catch (error) {
        console.log("PostgreSQL Error:", error)
        response.status(400).send({ error: `User not found` })
    }
})

// Kentän päivittäminen
reservationRouter.post("/update_field", userExtractor, async (request, response) => {
    const {
        UserID,
        Name,
        Description,
        Liika,
        URL,
        Opening_Hours,
        FieldID,
        SystemID,
        fieldCategories,
    } = request.body

    if (UserID === request.user?.dataValues?.UserID ?? "NAN") {
        // Eli userExtractorin tokenista ekstraktoima userID
        try {
            const system = await ReservationSystems.findOne({
                where: {
                    SystemID: SystemID
                },
                attributes: ["ClubID"]
            })
            const result = await ClubMembers.findOne({
                where: {
                    UserID: UserID,
                    ClubID: system.ClubID,
                },
            })
            if (!result) {
                response.status(403).json({ error: "Not part of the club at request" })
            }
            const transaction = await sequelize.transaction()
            const newRS = await Fields.update(
                {
                    Name: Name,
                    Description: Description,
                    Liika: Liika,
                    URL: URL,
                    Opening_Hours: Opening_Hours
                },
                {
                    where: {
                        SystemID: SystemID,
                        FieldID: FieldID,
                    }
                },
                { transaction }
            )
            const field = await Fields.findByPk(FieldID)
            if (!field) {
                return res.status(404).json({ error: 'Field not found' })
            }
            // Tämä korvaa kentän kategoriat annetuilla ID:eillä:
            await field.setCategories(fieldCategories)

            await transaction.commit()
            response.status(200).send({ message: "Field updated succesfully." })
        } catch (error) {
            console.error("Error updating field: " + error)
            response.status(500).json({ error: "Internal Server Error" })
        }
    } else {
        console.error("Invalid token")
        response.status(401).json({ error: "Unauthorized" })
    }
}) // Kentän päivittäminen päättyy

// Vuoron lisääminen
reservationRouter.post("/create_slot", userExtractor, async (request, response) => {
    const {
        UserID,
        Type,
        StartTime,
        EndTime,
        Text,
        SystemID,
        FieldID,
    } = request.body

    if (UserID === request.user.dataValues.UserID) {
        // Eli userExtractorin tokenista ekstraktoima userID
        // Tarkastetaan onko oikeus luoda yhteistyökumppanille tapahtumia (eli ei ole feikattu postpyyntö tavallisella käyttäjällä)
        try {
            const system = await ReservationSystems.findOne({
                where: {
                    SystemID: SystemID
                },
                attributes: ["ClubID"]
            })
            const result = await ClubMembers.findOne({
                where: {
                    UserID: UserID,
                    ClubID: system.ClubID,
                },
            })
            if (!result) {
                response.status(403).json({ error: "User not part of the System at request" })
            }
            const newSlot = await Slots.create({
                Type: Type,
                StartTime: StartTime,
                EndTime: EndTime,
                Text: Text,
                FieldID: FieldID,
            })
            console.log(newSlot)
            response.status(201).json({ newSlot: newSlot })
        } catch (e) {
            console.error(e)
            response.status(500).send()
        }
    } else {
        console.error("Invalid token")
        response.status(401).json({ error: "Unauthorized" })
    }
}) // Vuoron lisääminen päättyy

// Vuorojen haku kentälle (haku ei vaadi kirjautumista)
reservationRouter.post("/get_slots", async (request, response) => {
    const { FieldID } = request.body
    try {
        const slots = await Slots.findAll({
            // Etsitään kenttä
            where: {
                FieldID: FieldID,
            },
            attributes: ["SlotID", "Type", "StartTime", "EndTime", "Text",],
        })
        response.status(200).json({
            slots: slots,
        })
    } catch (error) {
        console.log("PostgreSQL Error:", error)
        response.status(400).send({ error: `User not found` })
    }
}) // Vuorojen haku kentälle päättyy

/**
 * Hakee kenttävarausjärjestelmät alueelta
 * Parametrina leveys- ja pituuspiiri, sekä maksimietäisyys pisteestä
 * Lisäksi mukana aikaväli jolla haetaan. Default aikaväli on nykyinen päivämäärä ja 00:00 + 30 päivää 23:59
 * Palauttaa tapahtuman tiedot, sekä osallistujamäärän (aktiivinen tai seuraava esiintymä tapahtumasta)
 */
reservationRouter.post("/nearby", async (request, response) => {
    const {
        latitude,
        longitude,
        radius,
    } = request.body
    try {
        const events = await getReservationSystemsNearby(
            latitude,
            longitude,
            radius,
        )
        response.json(events)
    } catch (error) {
        response.status(500).json({ error: "Jotain meni pieleen" })
    }
}) // Tapahtumahaku päättyy

// Yksittäisen kenttävarausjärjestelmän tietojen haku käyttäjälle, hakee myös kenttien nimet ja tiedot ja varaukset
reservationRouter.post("/get_single_system", async (request, response) => {
    const {
        SystemID,
    } = request.body
    try {
        const systemWithFields = await ReservationSystems.findOne({
            where: {
                SystemID: SystemID
            },
            attributes: [
                "SystemID",
                "Establishment_Location",
                "Description",
                "Title",
                "ClubID",
                "Rental",
                "PopUpText",
                "updatedAt",
            ],
            include: [
                {
                    model: Fields,
                    attributes: [
                        "FieldID",
                        "Name",
                        "Description",
                        "Liika",
                        "URL",
                        "Opening_Hours",
                        "updatedAt",
                    ],
                    include: [
                        {
                            model: FieldCategories, // Linkitetään FieldCategories, mutta ei tarvitse hakea muuta kuin CategoryID
                            attributes: ["CategoryID"], // Hae vain CategoryID
                        },
                        {
                            model: Slots,
                            attributes: ["SlotID", "Type", "StartTime", "EndTime", "Text", "updatedAt"],
                        }
                    ]
                },
            ],
            order: [
                [Fields, "Name", "ASC"], // Kentät nimittäin järjestettynä
            ]
        })

        response.status(200).json(systemWithFields)
    } catch (error) {
        console.error("Problems with retreving system for user: " + error)
        response.status(500).json({ error: "Internal Server Error" })
    }
}) // Yksittäisen haku päättyy

module.exports = reservationRouter
