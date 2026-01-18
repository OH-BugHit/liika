import axios from "axios"
import { baseUrl } from "./utils"

let token = null
const setToken = (storedToken) => {
    token = `bearer ${storedToken}`
}

// Hakee käännöksen
const getTranslations = async (storedToken, parameters) => {
    setToken(storedToken)
    const headers = {
        headers: { Authorization: token }, // Asetetaan token headeriin
    }
    const response = await axios.post(
        baseUrl + "/translate/batch",
        parameters,
        headers
    )
    return response.data
}

export default { getTranslations }