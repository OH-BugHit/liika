require("dotenv").config()
const axios = require("axios")

/**
 * Kääntää merkkijonon englanniksi
 * @param {String} text 
 * @returns tekstin käännettynä
 */
const translateText = async (text) => {
    try {
        const response = await axios.post('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=en',
            [{ Text: text }],
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': `${process.env.TRANSLATION_API_KEY}`,
                    'Ocp-Apim-Subscription-Region': `${process.env.TRANSLATION_RESOURCE_REGION}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data[0].translations[0].text
    } catch (error) {
        console.error('Error in translation:', error)
        throw error
    }
}

/**
 * Kääntää tekstiä olion sisällä
 * @param {object} texts Syötetekstiolio sisältää avain:arvo pareja
 * @param {String} toLanguage Kieli, jolle käännetään
 * @returns Palauttaa objektin käännettynä
 */
const translateTexts = async (texts, toLanguage) => {
    try {
        const response = await axios.post(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${toLanguage}`,
            texts,
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': `${process.env.TRANSLATION_API_KEY}`,
                    'Ocp-Apim-Subscription-Region': `${process.env.TRANSLATION_RESOURCE_REGION}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return response.data
    } catch (error) {
        console.error('Error in translating texts:', error)
        throw error
    }
}

module.exports = { translateText, translateTexts }
