const nodemailer = require('nodemailer');
require("dotenv").config()

// Sähköpostin lähetyspalvelun määrittely
const transporter = nodemailer.createTransport({
  service: 'gmail', // Tai mikä tahansa sähköpostipalvelu
  auth: {
    user: process.env.EMAIL_USER, // Sähköpostiosoite, jota käytetään lähettämiseen
    pass: process.env.EMAIL_PASSWORD, // Sähköpostin sovelluskohtainen salasana
  },
});

const sendEmail = async (email, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Viesti lähetetty: %s", info.messageId);
    return true; // Palautetaan true, jos sähköposti lähetettiin onnistuneesti
  } catch (error) {
    console.error("Virhe sähköpostin lähetyksessä:", error);
    return false; // Palautetaan false, jos sähköpostin lähettäminen epäonnistui
  }
};

module.exports = { sendEmail };