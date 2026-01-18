const { Router } = require("express")
const { translateTexts } = require('../utils/translate')
const { userExtractor } = require("../utils/middleware")
const { sequelize, Users } = require('../models')
const { where } = require('sequelize')
const crypto = require("crypto")
const { FixedSizeQueue } = require('../utils/FixedSizeQueue')
const translationRouter = Router()

const translationCache = new Map() // Käännömuisti
const cacheLimiter = new FixedSizeQueue(1000) // Rajoitetaan käännösmuistin koko tuhanteen rengastoteutuksella
const MAX_CACHE_AGE_MS = 31 * 1000 * 60 * 60 * 24 // 1kk Muuttuja johon asetetaan käännöksen vanhentuminen

function hashInputObject(inputObject, toLanguage) {
    const inputString = JSON.stringify({ inputObject, toLanguage })
    return crypto.createHash("sha256").update(inputString).digest("hex")
}

// Hae käännös oliolle
translationRouter.post("/batch", userExtractor, async (req, res) => {
    const { inputObject, toLanguage, UserID } = req.body
    while (!cacheLimiter.isEmpty()) { // Tarkistetaan onko yli max-cachen vanhoja käännöksiä
        const entry = cacheLimiter.peek()
        if (Date.now() - entry.timestamp > MAX_CACHE_AGE_MS) {
            translationCache.delete(entry.key)
            cacheLimiter.dequeue()
            console.log("POISTETAAN VANHA!")
        } else {
            break
        }
    }
    if (UserID === req.user?.dataValues?.UserID ?? "NAN") {
        if (typeof inputObject !== "object" || inputObject === null) {
            return res.status(400).json({ error: "Invalid input object" })
        }
        try {
            const inputKey = hashInputObject(inputObject, toLanguage)
            if (translationCache.has(inputKey)) { // Jos löytyy jo backendin cachesta niin ei käännetä uudelleen
                const cacheItem = translationCache.get(inputKey)
                return res.status(200).json(cacheItem)
            }
            const translateHistory = await Users.findOne({
                where: {
                    UserID: UserID
                },
                attributes: ["TranslateTokens"],
            })
            if (translateHistory.dataValues.TranslateTokens < 2000) {
                return res.status(429).json({ error: "Monthly translation limit reached" })
            }
            // Valmistellaan data
            const keys = Object.keys(inputObject)
            const texts = keys.map(key => ({ Text: inputObject[key] }))

            // Lasketaan merkkimäärä valmiiksi
            const totalCharacters = Object.values(inputObject)
                .reduce((sum, text) => sum + (text?.length || 0), 0)

            const translation = await translateTexts(texts, toLanguage)
            if (translation.error) {
                console.log("translation failed", translation)
                return res.status(500).json({ error: "Translation failed" })
            }
            const translatedObject = {}
            keys.forEach((key, index) => {
                translatedObject[key] = translation[index]?.translations?.[0]?.text || inputObject[key]
            })
            // Päivitetään jäljellä oleva käännösoikeus
            const tokensLeft = translateHistory.dataValues.TranslateTokens - totalCharacters
            const usertoken = await Users.update(
                {
                    TranslateTokens: tokensLeft
                },
                { where: { UserID: UserID } }
            )
            // Tallennetaan cacheen:
            translationCache.set(inputKey, translatedObject)
            const overwritten = cacheLimiter.enqueue({ key: inputKey, timestamp: Date.now() }) // Cachen rajausta varten
            if (overwritten?.key) { // Jos rengas meni täyteen, palauttaa se avaimen joka tulee poistaa
                translationCache.delete(overwritten.key)
            }
            return res.status(200).json(translatedObject)
        } catch (error) {
            console.error("Problems with translation: ", error)
            return res.status(500).json({ error: "Translation failed" })
        }
    } else {
        console.error("Invalid token")
        res.status(401).json({ error: "Unauthorized" })
    }
})


module.exports = translationRouter
