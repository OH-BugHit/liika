require('dotenv').config(); // Lataa ympäristömuuttujat

const nodemailer = require('nodemailer');

//TODO: Pitää alkaa käyttämään modernia todennusta (OAuth 2.0)

const transporter = nodemailer.createTransport({
  
  service: '',
  auth: {
    user: '', //gmail käyttäjä
    pass: '', //Sovellussalasana
  },
  
});

const mailOptions = {
  from: '',//gmail käyttäjä
  to: '', // Vaihda vastaanottajan sähköpostiosoitteeseen
  subject: 'Testisähköposti',
  text: 'Tämä on testisähköposti Nodemailerilla',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Virhe sähköpostin lähetyksessä:', error);
  } else {
    console.log('Sähköposti lähetetty: ' + info.response);
  }
});

transporter.set('DEBUG', true);