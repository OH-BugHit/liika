class termsOfServiceText {
  constructor() {
    this.enText = `
1.     General

Service Provider:
Liika

Liika-webservice (referred to as” service”, or “product” in the document) requires the user to abide by these terms of use. The Liika is a map service owned by Liika. The content of the service has been made and developed by Liika and it is maintained by Liika as well. Liika is the sole service provider for the product. Use of the service requires the acceptance of these terms, so it is important that the reader understands them well.
The aim of the service is to aid users notify others of their intention to play group sports or other similar activities. Users can notify others of an event or users can join an event created by another user. Using the Liika-service users can see what activities or events there are near them or in their chosen city. Liika is not an event organizer nor does Liika have anything to do with any event a user has notified others of.

”Liika” refers to :
          -Service provider Liika
          - ”Liika-service”
          - ”Liika-product”
          - ”Liika website”

2.     Copyrights

All intellectual property rights or documentation related to the product is owned solely by Liika. “Intellectual property rights” refer to copyright and local law.
The map has been created by using data from OpenStreetMap that Liika does not own.
(https://www.openstreetmap.org  )
The functionability of the map has been created using the Leaflet library that Liika does not own.
(https://leafletjs.com/  )

3.     User Responsibility

The user agrees to abide by the rules or laws of the event they have joined or notified of and any other rules that are set up by the owner of the property the event is on. The User also agrees to abide by the laws of the country that the event or activity is held in. Polite, lawful, orderly and sportsmanship-like behavior is expected of the user and the user agrees to behave themselves like so. Users are also obligated to ensure that any and every place an event or activity is held in is left clean.

4.     Service Provider Responsibility

Liika is not an event organizer, and no event notified on the service is organized by Liika. Liika is not liable to users or any third party for possible bugs, mistakes or failures in the service. Liika is not liable for any misuse of the service nor is Liika liable or responsible to any party for the suitability and appropriateness of the service for any specific purpose. Liika does not own, manage, or have a partnership with any sporting facility, or any location, out or indoor field. Liika is not responsible for any equipment that a user owns, borrows or loans.

5.     Changing Service Functions

Liika reserves the right to change the content, operation, and these terms of use for the benefit of improving the service or for any other necessary reasons.`

    this.fiText = `
1.     Yleistä

Palveluntarjoaja:
Liika

Liika-verkkopalvelun (jäljempänä ”palvelu”) käyttöön sovelletaan näitä käyttöehtoja. Palvelu on Liikan omistama karttapalvelu. Palvelun sisällön on tuottanut Liika ja sitä ylläpitää Liika. Palveluntuottajilla ja palveluntarjoajalla tarkoitetaan yksinomaan Liikaa. Palvelunkäyttö edellyttää näiden ehtojen hyväksymistä, joten on tärkeää, että ymmärrät ne hyvin.

Palvelun käyttötarkoituksena on helpottaa urheiluun liittyvien tapahtumien ilmoittamista ja niihin liittymistä. Käyttäjät voivat ilmoittaa tapahtumia ja liittyä tapahtumiin. Liika-palvelun avulla käyttäjät voivat nähdä eri tapahtumia ja aktiviteetteja valitussa kaupungissa. Liika ei ole tapahtumien järjestäjä, eikä Liika osallistu millään tavalla tapahtuman järjestämiseen.

”Liika” tarkoittaa:
          - ”Palveluntarjoaja Liika”
          - ”Palveluntuottaja Liika”
          - ”Liika-sivu”
          - ”Liika-palvelua”

2.     Tekijänoikeudet

Kaikki immateriaalioikeudet Liika-palveluun tai siihen liittyvään dokumentaatioon ja niiden osiin ovat yksinomaan Liikan omaisuutta. ”Immateriaalioikeudet” tarkoittavat tekijänoikeuksia ja lähioikeuksia.

Kartan luomiseen on käytetty OpenStreetMap-dataa, jota Liika ei omista.
(https://www.openstreetmap.org )
Kartan tomintoihin on myös käytetty Leaflet-kirjastoa, jota Liika ei omista.
(https://leafletjs.com/ )

3.     Käyttäjän vastuu

Käyttäjä sitoutuu noudattamaan ilmoittaneensa tai liittyneensä tapahtuman sijainnin sääntöjä ja muita säädöksiä, jotka ovat tapahtuman sijainnin yhteyteen kuuluvia. Käyttäjä sitoutuu myös noudattamaan tapahtuman maan lakeja ja kaupungin säädöksiä. Käyttäjältä vaaditaan hyvää, asiallista, laillista ja urheiluhenkistä käytöstä. Käyttäjiä myös vaaditaan siivoamaan jälkensä ja tarkistamaan, että tilat pysyvät hyvässä kunnossa.

4.     Palveluntuottajien vastuu

Liika ei ole tapahtumien järjestäjä, eikä se osallistu millään tavalla tapahtumien järjestämiseen. Liika ei vastaa käyttäjille tai kolmansille osapuolille palvelun mahdollisesti sisältämistä virheistä. Liika ei myöskään vastaa palvelun soveltuvuudesta ja sopivuudesta mihinkään tiettyyn tarkoitukseen. Liika ei vastaa, osallistu tai ole yhteistyökumppani minkään sijainnin, kentän tai urheilulaitoksen kanssa. Liika ei myöskään vastaa mistään välineistä, jota käyttäjät itse tuovat, vuokraavat tai lainaavat sijainneilta.

5.     Palveluntoimintojen muuttaminen
Liikalla on oikeus muuttaa palvelun sisältöä, toimintaa ja näitä käyttöehtoja palvelun kehittämiseksi tai muista tarpeellisista syistä.`
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

export default new termsOfServiceText()
