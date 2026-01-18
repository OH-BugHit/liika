const app = require("./app")
const config = require("./utils/config")

app.listen(config.PORT, () => {
  console.log(`Serveri on käynnissä portissa ${config.PORT}`)
})
