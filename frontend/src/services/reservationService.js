import axios from "axios"
import { baseUrl } from "./utils"

let token = null
const setToken = (storedToken) => {
    token = `bearer ${storedToken}`
}

// Luo kenttävarausjärjestelmän
const createReservationSystem = async (storedToken, parameters) => {
    setToken(storedToken)
    const headers = {
        headers: { Authorization: token }, // Asetetaan token headeriin
    }
    const response = await axios.post(baseUrl + "/reservation/create", parameters,
        headers)
    return response
}

// Hakee yksittäisen tapahtuman tiedot järjestelmän muokkausta varten
const getReservationSystem = async (storedToken, parameters) => {
    setToken(storedToken)
    const headers = {
        headers: { Authorization: token }, // Asetetaan token headeriin
    }
    const response = await axios.post(
        baseUrl + "/reservation/get_single",
        parameters,
        headers
    )
    return response.data
}

// Hakee kenttävarausjärjestelmät, jotka linkittyvät käyttäjän clubeihin
const getReservationSystems = async (storedToken, parameters) => {
    setToken(storedToken)
    const headers = {
        headers: { Authorization: token }, // Asetetaan token headeriin
    }
    const response = await axios.post(
        baseUrl + "/reservation/get_list",
        parameters,
        headers
    )
    return response.data
}

// Kenttävarausjärjestelmän päivittäminen
const modifyRS = async (storedToken, parameters) => {
    setToken(storedToken)
    const headers = {
        headers: { Authorization: token }, // Asetetaan token headeriin
    }
    const response = await axios.post(
        baseUrl + "/reservation/update_system",
        parameters,
        headers
    )
    return response.data
}

// Kentän luominen
const createField = async (storedToken, parameters) => {
    setToken(storedToken)
    const headers = {
        headers: { Authorization: token }, // Asetetaan token headeriin
    }
    const response = await axios.post(
        baseUrl + "/reservation/create_field",
        parameters,
        headers
    )
    return response.data
}

// Kentän luominen
const getFields = async (storedToken, parameters) => {
    setToken(storedToken)
    const headers = {
        headers: { Authorization: token }, // Asetetaan token headeriin
    }
    const response = await axios.post(
        baseUrl + "/reservation/get_fields",
        parameters,
        headers
    )
    return response.data
}

// Kentän hakeminen
const getField = async (parameters) => {
    const response = await axios.post(
        baseUrl + "/reservation/get_field",
        parameters
    )
    return response.data
}

// Kentän muokkaaminen
const modifyField = async (storedToken, parameters) => {
    setToken(storedToken)
    const headers = {
        headers: { Authorization: token }, // Asetetaan token headeriin
    }
    const response = await axios.post(
        baseUrl + "/reservation/update_field",
        parameters,
        headers
    )
    return response.data
}

// Vuoron luominen
const createSlot = async (storedToken, parameters) => {
    setToken(storedToken)
    const headers = {
        headers: { Authorization: token }, // Asetetaan token headeriin
    }
    const response = await axios.post(
        baseUrl + "/reservation/create_slot",
        parameters,
        headers
    )
    return response.data
}

// Kentän hakeminen
const getSlots = async (parameters) => {
    const response = await axios.post(
        baseUrl + "/reservation/get_slots",
        parameters
    )
    return response.data
}

// Hakee kenttävarausjärjestelmät lähistölä
const getServices = async (parameters) => {
    const response = await axios.post(baseUrl + "/reservation/nearby", parameters)
    return response.data
}

// Hakee yksittäisen kenttävarausjärjestelmän tiedot käyttäjälle
const getSingleSystem = async (parameters) => {
    const response = await axios.post(
        baseUrl + "/reservation/get_single_system",
        parameters,
    )
    return response.data
}


export default {
    createReservationSystem,
    getReservationSystem,
    getReservationSystems,
    modifyRS,
    createField,
    getFields,
    getField,
    modifyField,
    createSlot,
    getSlots,
    getServices,
    getSingleSystem
}