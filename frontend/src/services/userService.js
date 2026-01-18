import axios from "axios"
import { baseUrl } from "./utils"

let token = null
const setToken = (storedToken) => {
  token = `bearer ${storedToken}`
}

// Hakee käyttäjän tiedot
const getUserData = async (storedToken, userID) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const data = { userID: userID }
  const response = await axios.post(baseUrl + "/users/user", data, headers)
  return response.data
}

const updateUserEmail = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/users/update/email",
    parameters,
    headers
  )
  return response.data
}

const updateUserUsername = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/users/update/username",
    parameters,
    headers
  )
  return response.data
}

const updateUserLanguage = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/users/update/language",
    parameters,
    headers
  )
  return response.data
}

const updateUserMapLocation = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/users/update/map_preferences",
    parameters,
    headers
  )
  return response.data
}

const updateUserPassword = async (storedToken, parameters) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/users/update/password",
    parameters,
    headers
  )
  return response.data
}

export default {
  getUserData,
  updateUserEmail,
  updateUserUsername,
  updateUserLanguage,
  updateUserMapLocation,
  updateUserPassword,
}
