const { Users } = require("../models")
const jwt = require("jsonwebtoken")

// Tuntemattoman api-endpointin käsittely
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint, try something else" })
}

// Käyttäjän tunnisteen irroittaja
const tokenExtractor = (request, response, next) => {
  const getTokenFrom = (request) => {
    const authorization = request.get("authorization")
    if (authorization && authorization.startsWith("bearer")) {
      return authorization.replace("bearer ", "")
    }
    return null
  }
  request.token = getTokenFrom(request)
  next()
}

// Käyttäjän tunnistaminen tokenista
const userExtractor = async (request, response, next) => {
  if (request.token) {
    try {
      const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET)
      if (!decodedToken.id) {
        return response.status(401).json({ error: "token invalid" })
      }
      request.user = await Users.findOne({
        // Etsitään käyttäjä
        where: {
          UserID: decodedToken.id,
        },
        attributes: ["UserID"],
      })
    } catch (error) {
      console.log(error)
    }
  } else {
    request.user = null
  }
  next()
}

module.exports = {
  unknownEndpoint,
  tokenExtractor,
  userExtractor,
}
