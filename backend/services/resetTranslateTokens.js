const { Users, Settings } = require("../models")
const { Op } = require("sequelize")

const resetTranslateTokens = async () => {
    try {
        const now = new Date()

        // Tarkista, onko 1. päivä ja klo 00:xx
        if (now.getDate() !== 1 || now.getHours() !== 0) {
            return
        }

        // Hae edellinen reset-aika
        const setting = await Settings.findOne({ where: { key: "lastReset" } })
        const lastReset = new Date(setting.value)

        // Estä uudelleenajo samana kuukautena
        if (
            now.getFullYear() === lastReset.getFullYear() &&
            now.getMonth() === lastReset.getMonth()
        ) {
            console.log("Reset jo suoritettu tässä kuussa")
            return
        }

        // Suorita päivitykset
        await Users.update({ TranslateTokens: 25000 }, { where: { Role: 0 } })
        await Users.update({ TranslateTokens: 200000 }, { where: { Role: 1 } })

        // Päivitä reset-aika
        await Settings.update({ value: now.toISOString() }, { where: { key: "lastReset" } })

        console.log("TranslateTokens päivitetty onnistuneesti")
    } catch (err) {
        console.error("Virhe kuukausipäivityksessä:", err)
    }
}

module.exports = { resetTranslateTokens }