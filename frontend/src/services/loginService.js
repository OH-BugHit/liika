import axios from "axios"
import { baseUrl } from "./utils"

const login = async (credentials) => {
  const response = await axios.post(baseUrl + "/login", credentials)
  return response.data
}

const sendEmail = async (email) => {
  console.log("SendEmail funktion email "+email)
  try {
      const response = await axios.post(baseUrl + "/login/sendEmail", { email })
      return response.data;
    } catch (error) {
      console.error("Virhe sähköpostin lähetyksessä:", error);
      throw error; // Heitetään virhe uudelleen, jotta komponentti voi käsitellä sen
    }
};

export default { login, sendEmail }
