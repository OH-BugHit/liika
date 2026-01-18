class infoText {
  constructor() {
    this.enText = `Site under construction
This is the English info area.
Information about site will be added later`

    this.fiText = `Sivusto on rakenteilla
Tämä on suomenkielinen info-sivu.`
  }

  getText(language) {
    if (language === "en") {
      return this.enText
    } else if (language === "fi") {
      return this.fiText
    } else {
      return this.fiText
    }
  }
}

export default new infoText()
