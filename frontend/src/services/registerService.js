import axios from "axios"
import { baseUrl } from "./utils"

let token = null
const setToken = (storedToken) => {
  token = `bearer ${storedToken}`
}

const register = async (credentials) => {
  const response = await axios.post(baseUrl + "/register", credentials)
  return response.data
}

const unregister = async (storedToken, UserID) => {
  setToken(storedToken)
  const headers = {
    headers: { Authorization: token }, // Asetetaan token headeriin
  }
  const response = await axios.post(
    baseUrl + "/register/unregister",
    UserID,
    headers
  )
  return response.status
}

const sendOtp = async (parameters) => {
  try {
    const response = await axios.post(baseUrl + "/register/sendOtp", parameters)
    return response.data
  } catch (error) {
    console.error("Virhe sähköpostin lähetyksessä:", error)
    throw error // Heitetään virhe uudelleen, jotta komponentti voi käsitellä sen
  }
}

const verifyOtp = async (credentials) => {
  console.log("Credentials verifyotp: " + credentials)
  try {
    const response = await axios.post(
      baseUrl + "/register/verifyOtp",
      credentials
    )
    return response.data
  } catch (error) {
    console.error("Virhe koodin vahvistuksessa:", error)
    throw error // Heitetään virhe uudelleen, jotta komponentti voi käsitellä sen
  }
}

export default { register, unregister, sendOtp, verifyOtp }
