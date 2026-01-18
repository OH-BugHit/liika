import axios from "axios"
import { baseUrl } from "./utils"

let token = null
const setToken = (storedToken) => {
  token = `bearer ${storedToken}`
}

// Hakee aktiviteettikategoriat
const getCategories = async () => {
  const response = await axios.get(baseUrl + "/events/categories")
  return response.data
}

// Hakee tapahtumat lähistölä (kartta)
const getEvents = async (parameters) => {
  const response = await axios.post(baseUrl + "/events/nearby", parameters)
  return response.data
}

// Hakee tapahtumat lähistölä (kartta)
const getEventsQuick = async (parameters) => {
  const response = await axios.post(baseUrl + "/events/nearbyQuick", parameters)
  return response.data
}

// Hakee yksittäisen tapahtuman tiedot
const getSingleEventWithTimes = async (parameters) => {
  const response = await axios.post(
    baseUrl + "/events/singleEventWithTimes",
    parameters
  )
  return response.data
}

// Luo tapahtuman
const createEvent = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/create_event",
    parameters,
    headers
  )
  return response.status
}

// Luo tapahtuman kirjautumattomalle käyttäjälle
const createEventUnSigned = async (parameters) => {
  console.log("tapahtuman luonti: " + parameters)
  const response = await axios.post(
    baseUrl + "/events/create_event_unsigned",
    parameters
  )
  return response.status
}

// Sähköpostivahvistus tapahtuman luonnissa kirjautumattomalle käyttäjälle
const createEventEmailSend = async (email) => {
  console.log("Lähetetään pyyntö, body:", { email })
  const respone = await axios.post(baseUrl + "/events/sendOtp", { email })
  return respone.data
}

//Vahvistuskoodi tapahtuman luonnissa kirjautumattomalle käyttäjälle
const createEventVerifyOtp = async (parameters) => {
  const response = await axios.post(baseUrl + "/events/verifyOtp", parameters)
  return response.data
}

// Liittyy tapahtumaan
const joinEvent = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  try { //Debuggausta varten lisätty, poistetaan myöhemmin
    console.log("Lähetetään POST-pyyntö", parameters)
    const response = await axios.post(
      baseUrl + "/events/join_event",
      parameters,
      headers
    )
    console.log("joinEvent vastaus", response)
    return response
  } catch (error) {
    console.error("joinEvent epäonnistui", error)
    throw error
  }
}

// Liittyy tapahtumaan kirjautumaton
const joinEventUnSigned = async (parameters) => {
  console.log("Lähetetään pyyntö, body:", parameters)
  const response = await axios.post(
    baseUrl + "/events/join_event_unsigned",
    parameters
  )
  return response.data
}

// Poistuu tapahtumasta
const leaveEvent = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/leave_event",
    parameters,
    headers
  )
  return response.data
}

// Hakee käyttäjän liitytyt tapahtumat

const getJoined = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/joined",
    parameters,
    headers
  )
  return response.data
}

// Hakee käyttäjän liitytyt tapahtumat
const getUserJoinedEvents = async (storedToken, UserID) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/userJoinedEvents",
    {
      UserID,
    },
    headers
  )
  return response.data
}

// Hakee käyttäjän liitytyt menneet tapahtumat
const getUserJoinedEventsPast = async (storedToken, UserID) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/userJoinedEventsPast",
    {
      UserID,
    },
    headers
  )
  return response.data
}

// Hakee käyttäjän liitytyt tapahtumat
const getUserCreatedEvents = async (storedToken, UserID) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/userCreatedEvents",
    {
      UserID,
    },
    headers
  )
  return response.data
}

// Hakee käyttäjän liitytyt menneet tapahtumat
const getUserCreatedEventsPast = async (storedToken, UserID) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/userCreatedEventsPast",
    {
      UserID,
    },
    headers
  )
  return response.data
}

// Hakee klubin luomat tapahtumat
const getClubCreatedEvents = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/club_created_events",
    parameters,
    headers
  )
  return response.data
}

// Hakee klubin luomat menneet tapahtumat
const getClubCreatedEventsPast = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/club_created_eventsPast",
    parameters,
    headers
  )
  return response.data
}

// Poistaa tapahtuman yhden ajan
const deleteEventTime = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/delete/time",
    parameters,
    headers
  )
  return response.data
}

const deleteEvent = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/delete/event",
    parameters,
    headers
  )
  return response.data
}

const modifyEvent = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/events/update",
    parameters,
    headers
  )
  return response
}

export default {
  getCategories,
  getClubCreatedEvents,
  getEvents,
  createEvent,
  createEventUnSigned,
  joinEvent,
  joinEventUnSigned,
  getJoined,
  leaveEvent,
  createEventEmailSend,
  createEventVerifyOtp,
  getSingleEventWithTimes,
  getUserJoinedEvents,
  getUserCreatedEvents,
  deleteEventTime,
  deleteEvent,
  modifyEvent,
  getEventsQuick,
  getClubCreatedEventsPast,
  getUserCreatedEventsPast,
  getUserJoinedEventsPast,
}
