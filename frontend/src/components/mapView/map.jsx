/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet.markercluster"
import "leaflet/dist/leaflet.css"
import "leaflet-control-geocoder/dist/Control.Geocoder.css"
import "leaflet-control-geocoder"
import "../../index.css"
import { useDispatch, useSelector } from "react-redux"
import { changeLocation } from "../../store/locationSlice"
import logo from "../../assets/liika_logo169.png"
import { useNavigate } from "react-router-dom"
import eventService from "../../services/eventService"
import reservationService from "../../services/reservationService"
import { createRoot } from "react-dom/client"
import { selectClubIcon, selectIcon, selectSystemIcon } from "../../assets/icons"
import { categories } from "./utils"
import ShortcutButtons from "./shortcutButtons"
import { DarkOverlay, LiikaOverlay, UserOverlay } from "./layers/overlayLayers"
import { parseTimeAndDate, translateLanguage, translateOn } from "../../utils/helper"
import translations from "../../assets/translation"
import homeIcon from "../../assets/home.png"
import translationService from '../../services/translationService'
import { changeDeviceSettings } from '../../store/deviceSettingsSlice'

const DEFAULT_DAYS = 31
let showSystems = true

const Map = ({ startingLocation }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const [timeStamp, setTimeStamp] = useState("") // Aikaleima, milloin päivitetty
  const [isCategoryPanelOpen, setCategoryPanelOpen] = useState(false)
  const timestampRef = useRef(null)
  const markerClusterGroup = L.markerClusterGroup({ spiderfyDistanceMultiplier: 3 }) // Säätää klusterin spreadin pituutta
  const reservationSystemMarkers = [] // Täällä pidetään yllä viitettä kenttävarausjärjestelmistä niiden filtteröintiä varten
  const searchMarkers = [] // Osoitteen haun marker tallennetaan tänne. Refresh poistaa sen kartalta
  const storedUser = useSelector((state) => state.user?.user ?? null)
  // Asetetaan kirjautuneen tiedot tai null
  const user = storedUser?.username ?? null
  const userID = storedUser?.userID ?? null
  const clubs = storedUser?.clubs ?? {}

  const storedToken = useSelector((state) => state.user?.user?.token ?? null)
  const mapPreferences = useSelector(
    (state) => state.user?.user?.mapPreferences ?? null
  )
  const deviceSettings = useSelector((state) => state.deviceSettings?.deviceSettings ?? null)

  useEffect(() => {
    if (timestampRef.current) {
      timestampRef.current.render(
        <div className="refresh-stamp">
          <p>{timeStamp}</p>
        </div>
      )
    }
  }, [timeStamp])

  // Käsittele paneelin näkyvyys
  const toggleCategoryPanel = () => {
    setCategoryPanelOpen(!isCategoryPanelOpen)
  }

  // Kategorioiden suodatus (poisto)
  const removeCategoryMarkers = (categoryId) => { // Poistetaan kategoriaID:n mukainen
    if (!categoryId) { // Tällä toteutettu kenttävarausjärjestelmien suodatus pois.
      reservationSystemMarkers.forEach((marker) => {
        markerClusterGroup.removeLayer(marker)
      })
    } else {
      const category = categories[categoryId] // categories sisältää markerit
      if (category && category.markers.length > 0) {
        category.markers.forEach((marker) => {
          markerClusterGroup.removeLayer(marker)
        })
      }
    }
  }

  // Kategorioiden suodatus (lisäys)
  const addCategoryMarkers = (categoryId) => {
    const category = categories[categoryId]
    if (category && category.markers.length > 0) {
      category.markers.forEach((marker) => {
        markerClusterGroup.addLayer(marker)
      })
    }
  }

  // Jos kuvaus on pitkä niin rajataan se 250merkkiin
  const handleDescription = (description) => {
    if (description.length > 200) {
      return description.slice(0, 200) + "..."
    }
    return description
  }

  const handleRental = (Rental) => {
    if (Rental) {
      return (
        `<img
        src="/rentalEquipmentAvailable.png"
        alt="Logo"
        width=60
        height=60
        className="event-view-icon"
      />`)
    } else return (`<div></div>`)
  }

  // Kategorian näkyvyyden käsittely
  const toggleCategory = (selectedCategories, showReservationSystems) => {
    let catSelected = []
    showSystems = showReservationSystems // Varausjärjestelmien näyttämisen tieto tarvitaan myös tallessa täällä map.jsx kun tehdään refreshMarkers

    Object.entries(selectedCategories).forEach(([categoryId, isSelected]) => {
      // Käydään läpi paneelin valinnat
      // categoryId on kategoria-ID (esim. 1, 2, 3)
      // isSelected on Boolean-arvo (true tai false)
      if (isSelected) {
        // Käsitellään vain valittuja kategorioita
        catSelected.push(Number(categoryId))
      }
    })
    if (catSelected.length === 0) { // Mikäli ei ole valittuna kategorioita niin näytetään kaikki
      showAllCategories(true)
    } else { // Kategoria(yksi tai enemmän) valittuna
      showAllCategories(false)
      showCategories(catSelected)
    }
    if (!showReservationSystems) { // Piilotetaan kenttävarausjärjestelmät jos false
      removeCategoryMarkers()
    }
  }

  // Tämä funktio näyttää tai piilottaa kaikki kategoriat ja lisää tai poistaa niiden markkerit parametrin show mukaan
  const showAllCategories = (show) => {
    Object.keys(categories).forEach((categoryId) => {
      categories[categoryId].visible = show
      if (show) {
        addCategoryMarkers(categoryId) // Lisätään markkerit, jos show === true
      } else {
        removeCategoryMarkers(categoryId) // Poistetaan markkerit, jos show === false
      }
    })
  }

  // Tämä funktio näyttää vain valitut kategoriat ja lisää niiden markkerit
  const showCategories = (selectedCategories) => {
    selectedCategories.forEach((categoryId) => {
      categories[categoryId].visible = true
      addCategoryMarkers(categoryId) // Lisätään markkerit valituille kategorioille
    })
  }

  // Piilotetaan sähköpostiosoitteet ja rekisteröimättömät nimet
  const showUsername = ({ user, club }) => {
    if (club) {
      return club
    }
    if (user.includes("@") || user.includes("-")) {
      return ""
    } else {
      return user
    }
  }

  // Funktio, joka hakee tapahtumat ja lisää markerit layerGroupeihin kategorioittain
  const refreshMarkers = async (map, time) => {
    const center = map.getCenter()
    setTimeStamp(new Date().toLocaleTimeString().replaceAll(".", ":")) // Asetetaan milloin haettu viimeksi
    const bounds = map.getBounds() // Haetaan radiuksen laskemista varten rajat
    const northWest = bounds.getNorthWest()
    const southEast = bounds.getSouthEast()
    const width = northWest.distanceTo([northWest.lat, southEast.lng])
    const height = northWest.distanceTo([southEast.lat, northWest.lng])
    try {
      let startDay = new Date()
      let today = startDay.toISOString().split("T")[0] // Tämä himmeli tuottaa päivämäärän muotoa: YYYY-MM-DD
      let endDay = new Date(startDay)
      endDay.setDate(endDay.getDate() + DEFAULT_DAYS) // Arvo asetettu tämän komponentin alussa
      let endDate = endDay.toISOString().split("T")[0]
      let eventList
      // Haetaan ensin kenttävarausjärjestelmät
      const systemList = await reservationService.getServices({
        latitude: center.lat,
        longitude: center.lng,
        radius: Math.max(Math.max(width, height) / 2, 10000),
      })
      if (!time || time.quickTime === -1) {
        // Haetaan normaali haku, refresh-nappulasta esimerkiksi. //TODO: Tallenna filtteri Reduksiin
        eventList = await eventService.getEvents({
          latitude: center.lat,
          longitude: center.lng,
          radius: Math.max(Math.max(width, height) / 2, 10000), // Haetaan kartallinen tapahtumia, kuitenkin vähintään 10km
          startTime: "00:00",
          endTime: "23:59",
          startDate: today,
          endDate: endDate,
        })
      } else {
        switch (
        time.quickTime // Haetaan ajan mukaan filtteröidyt tapahtumat
        ) {
          case 1:
            {
              if (time.dates[1]) {
                // Päivämääräväli
                startDay = new Date(time.dates[0]).toISOString().split("T")[0] // Tämä himmeli tuottaa päivämäärän muotoa: YYYY-MM-DD
                endDay = new Date(time.dates[1]).toISOString().split("T")[0]
              } else if (time.dates[0]) {
                // Yksi päivä
                startDay = new Date(time.dates[0]).toISOString().split("T")[0]
                endDay = new Date(time.dates[0]).toISOString().split("T")[0]
              }
              let starts = time.startTime
              let ends = time.endTime
              if (starts === "") {
                // Asetellaan tapahtumalle kellonaikaväli
                starts = "00:00"
              }
              if (ends === "") {
                ends = "23:59"
              }
              eventList = await eventService.getEvents({
                latitude: center.lat,
                longitude: center.lng,
                radius: Math.max(Math.max(width, height) / 2, 10000), // Haetaan kartallinen tapahtumia, kuitenkin vähintään 10km
                startTime: starts,
                endTime: ends,
                startDate: startDay,
                endDate: endDay,
              })
            }
            break

          case 2:
            {
              endDay = new Date(startDay)
              endDay.setHours(endDay.getHours() + 3) // Haetaan nyt -> +3 h

              eventList = await eventService.getEventsQuick({
                latitude: center.lat,
                longitude: center.lng,
                radius: Math.max(Math.max(width, height) / 2, 10000), // Haetaan kartallinen tapahtumia, kuitenkin vähintään 10km
                startTimeDate: startDay,
                endTimeDate: endDay,
              })
            }
            break
          case 3:
            {
              endDay = new Date(startDay)
              endDay.setHours(endDay.getHours() + 24) // Haetaan nyt -> +24 h

              eventList = await eventService.getEventsQuick({
                latitude: center.lat,
                longitude: center.lng,
                radius: Math.max(Math.max(width, height) / 2, 10000), // Haetaan kartallinen tapahtumia, kuitenkin vähintään 10km
                startTimeDate: startDay,
                endTimeDate: endDay,
              })
            }
            break
          case 4:
            {
              endDay = new Date(startDay)
              endDay.setDate(endDay.getDate() + 7) // Haetaan nyt -> +7 päivää
              eventList = await eventService.getEventsQuick({
                latitude: center.lat,
                longitude: center.lng,
                radius: Math.max(Math.max(width, height) / 2, 10000), // Haetaan kartallinen tapahtumia, kuitenkin vähintään 10km
                startTimeDate: startDay,
                endTimeDate: endDay,
              })
            }
            break
          case 5:
            {
              endDay = new Date(startDay)
              endDay.setDate(endDay.getDate() + 31) // Haetaan nyt -> +31 päivää
              eventList = await eventService.getEventsQuick({
                latitude: center.lat,
                longitude: center.lng,
                radius: Math.max(Math.max(width, height) / 2, 10000), // Haetaan kartallinen tapahtumia, kuitenkin vähintään 10km
                startTimeDate: startDay,
                endTimeDate: endDay,
              })
            }
            break
        }
      }

      // Tyhjentää kaikki categoryGroupit ja poistaa ne kartalta
      markerClusterGroup.clearLayers()
      // Poistetaan ne myös categoriesLayereistä
      Object.keys(categories).forEach((categoryId) => {
        categories[categoryId].markers = []
      })
      // Lisätään markerit uudelleen
      const fullList = [...eventList, ...systemList] // Sori koodin toistosta, mutten halunnut laittaa propseina eteenpäin kaikkea.
      fullList.forEach((tapahtuma) => {
        if (!tapahtuma.EventID) { // Jos ei Event_Location niin on kenttävarausjärjestelmä
          const { coordinates } = tapahtuma.Establishment_Location
          const lat = coordinates[1]
          const lng = coordinates[0]
          const marker = L.marker([lat, lng]).bindPopup(() => {
            // Asetetaan markkeri oikeisiin koordinaatteihin ja liitetään siihen popUp
            const container = document.createElement("div") // Kenttävarausjärjestelmän Popupin containeri, seuraavana sisältö:
            container.innerHTML = `
    <div class="popup-wrapper">
    <div class="popup-info">
      <h1>${tapahtuma.Title}</h1>
      <div id="description-text" style="white-space: pre-line margin-top: 2px">
      ${handleDescription(tapahtuma.PopUpText)}</div>
      <em>${tapahtuma.ClubName}</em> <br />
            <a href="/reservation_system/${tapahtuma.SystemID}" class="event-link">
              ${t.show_reservation_info}
            </a>
            <div id="translate-button-container" style= "position: absolute; bottom: 14px; right: 10px"></div>
    </div >
  <div class="popup-right">
    ${handleRental(tapahtuma.Rental)}
  </div>
  </div >
  `
            if (user && translateOn(language)) { // Jos käyttäjä ja kieli englanniksi
              const buttonContainer = container.querySelector("#translate-button-container")
              const button = document.createElement("button")
              button.className = "translate-btn"
              button.textContent = "translate"
              button.addEventListener("click", async () => {
                button.disabled = true
                // inputObjekti kääntäjälle
                const inputObject = {
                  description: handleDescription(tapahtuma.PopUpText)
                }
                const toLanguage = translateLanguage(language)
                const translatedText = await translationService.getTranslations(storedToken, { UserID: userID, inputObject, toLanguage })
                // Haetaan description-div ja päivitetään sen sisältö
                const descriptionDiv = container.querySelector("#description-text")
                console.log(translatedText.description)
                descriptionDiv.innerHTML = translatedText.description
              })
              buttonContainer.appendChild(button)
            }
            return container
          })
          // Muokataan const categoryID = tapahtuma.CategoryID
          marker.setIcon(selectSystemIcon())
          // Lisätään viite markerista varausjärjestelmätaulukkoon filtteröintiä varten
          reservationSystemMarkers.push(marker)
          // Lisää marker myös oikeaan kategoriaan
          tapahtuma.FieldCategoryIDs.forEach((categoryID) => {
            if (categories[categoryID]) {
              // Muuten laitetaan kategoriaikoni
              categories[categoryID].markers.push(marker)

              // Lisää markerClusterGroupiin vain, jos kategoria on asetettu näkyväksi
              if (categories[categoryID].visible) {
                markerClusterGroup.addLayer(marker)
              }
            }
          })
          // Ja lopuksi poistetaan vielä näkyvistä jos filtteröity pois..:
          if (!showSystems) {
            markerClusterGroup.removeLayer(marker)
          }
        } else { // Tapahtumat (ml. yhteistyökumppanien tapahtumat)
          const { coordinates } = tapahtuma.Event_Location
          const lat = coordinates[1]
          const lng = coordinates[0]
          const marker = L.marker([lat, lng]).bindPopup(() => {
            // Asetetaan markkeri oikeisiin koordinaatteihin ja liitetään siihen popUp
            const container = document.createElement("div") // Popupin containeri, seuraavana sisältö:
            container.innerHTML = `
  <h1> ${tapahtuma.Title}</h1 >
    <em>📅${parseTimeAndDate(tapahtuma.StartTime)[1]}
      <em>
        <em>🕒${parseTimeAndDate(tapahtuma.StartTime)[0]} - ${parseTimeAndDate(tapahtuma.EndTime)[0]
              }<em>
              <div id="description-text" style="white-space: pre-line margin-top: 2px">
            <p style="white-space: pre-line; margin-top: 2px"">${handleDescription(tapahtuma.Description)}</p></div>
            <p style="text-transform: lowercase; padding: 4px 0px; margin:0;">${t.participants
              }: ${tapahtuma.JoinedCount} / ${tapahtuma.ParticipantMax || "-"}</p>
            <em>${showUsername({
                user: tapahtuma.Username,
                club: tapahtuma.ClubName,
              })}</em> <br />
            <a href="/events/${tapahtuma.EventID
              }" style="color: blue; text-decoration: underline;">
              ${t.show_event_info}              
            </a>
  <div id="translate-button-container" style= "position: absolute; bottom: 14px; right: 10px"></div>
            `
            if (user && language === "EN") { // Jos käyttäjä ja kieli englanniksi
              const buttonContainer = container.querySelector("#translate-button-container")
              const button = document.createElement("button")
              button.className = "translate-btn"
              button.textContent = "translate"
              button.addEventListener("click", async () => {
                button.disabled = true
                const inputObject = {
                  description: handleDescription(tapahtuma.Description)
                }
                const toLanguage = translateLanguage(language)
                const translatedText = await translationService.getTranslations(storedToken, { UserID: userID, inputObject, toLanguage })
                // Haetaan description-div ja päivitetään sen sisältö
                const descriptionDiv = container.querySelector("#description-text")
                descriptionDiv.innerHTML = translatedText.description
              })
              buttonContainer.appendChild(button)
            }
            return container
          })
          const categoryID = tapahtuma.CategoryID
          if (tapahtuma.ClubName) {
            // Mikäli tapahtuma on yhteistyötapahtuma laitetaan yhteistyökumppanin ikoni
            marker.setIcon(
              selectClubIcon({
                clubName: tapahtuma.ClubName,
                categoryID: tapahtuma.CategoryID,
              })
            )
          } else {
            marker.setIcon(selectIcon(categoryID))
          }
          // Lisää marker oikeaan kategoriaan
          if (categories[categoryID]) {
            // Muuten laitetaan kategoriaikoni
            categories[categoryID].markers.push(marker)
            // Lisää markerClusterGroupiin vain, jos kategoria on asetettu näkyväksi
            if (categories[categoryID].visible) {
              markerClusterGroup.addLayer(marker)
            }
          }
        }
      }
      )

    } catch (error) {
      console.error(error)
    }
  }

  const onClickRefresh = async (map, time) => {
    searchMarkers.forEach((marker) => { // Poistetaan haun markkeri
      map.removeLayer(marker)
    })
    await refreshMarkers(map, time)
  }

  const onClickCreateEvent = () => {
    navigate("/create_event")
  }

  const onClickCreateClubEvent = () => {
    navigate("/partner")
  }

  const onClickListJoinedEvents = () => {
    navigate("/joined_events")
  }

  const onClickOwnInfo = () => {
    navigate("/own_info")
  }

  const onClickCreatedEvents = () => {
    navigate("/created_events")
  }

  useEffect(() => {
    /*Overlayt haetaan käyttöön tässä*/
    const liikaLayer = new LiikaOverlay()
    const darkLayer = new DarkOverlay()
    const userLayer = new UserOverlay(mapPreferences)

    const selectLayer = () => {
      if (deviceSettings === null || deviceSettings.layer === null) {
        return liikaLayer
      }
      switch (deviceSettings.layer) {
        case "liika": {
          return liikaLayer
        }
        case "dark": {
          return darkLayer
        }
        case "user": {
          return userLayer
        }
        default:
          return liikaLayer
      }
    }

    const firstLayer = selectLayer()
    // Luo karttaelementti kun komponentti mounttaa

    // Tarkastetaan ensin, että kartalla on aloitussijainti:
    if (!startingLocation.o_lat) {
      (startingLocation.o_lat = 62.6013), (startingLocation.o_lng = 29.7639)
      startingLocation.zoom = 12
    }

    // Lisää karttalaatta OpenStreetMapista
    var osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    )

    const map = L.map("map", {
      center: [startingLocation.lat, startingLocation.lng],
      zoom: startingLocation.zoom,
      layers: [osm, firstLayer],
    })

    //Search bar
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false // estetään oletustoiminto
    }).addTo(map)

    geocoder.on("markgeocode", function (e) {
      const { center } = e.geocode

      map.flyTo(center, 17)
      const address = e.geocode.properties.address
      const road = address.road || ""
      const house_number = address.house_number || ""
      const postcode = address.postcode || ""
      const city = address.city || ""
      const state = address.state || ""
      const country = address.country || ""

      const printAddress1 = `${road} ${house_number},  `
      const printAddress2 = `${postcode} ${city},`
      const printAddress3 = `${state} ${country}`

      // Lisätään marker popupilla
      const searchResultMarker = L.marker(center)
        .addTo(map)
        .bindPopup(`<p>${printAddress1}<br />${printAddress2}<br />${printAddress3}</p>`)
        .openPopup()
      searchMarkers.push(searchResultMarker)
    })

    // Lisää uuden layerit täällä
    const overlays = {
      Liika: liikaLayer,
      Dark: darkLayer,
      User: userLayer,
    }

    L.control.layers(overlays).addTo(map)

    const homeButton = L.control({ position: "topright" })
    homeButton.onAdd = () => {
      const container = L.DomUtil.create("div")
      L.DomEvent.disableClickPropagation(container)
      const root = createRoot(container)

      const handleClick = () => {
        //Move map¨
        const homeLocation = [startingLocation.o_lat, startingLocation.o_lng]
        map.flyTo(homeLocation, startingLocation.zoom)
      }

      root.render(
        <div className="refresh-events">
          <button
            className="pika-painike-refresh"
            onClick={handleClick}>
            <img className="refresh-image"
              src={homeIcon}
              width={30}
              height={30}
            /></button>
        </div>
      )
      return container
    }
    homeButton.addTo(map)

    const fetchEvents = (time) => {
      if (!time) {
        console.log("Virhe!")
      } else {
        if (time.quickTime) {
          onClickRefresh(map, time)
        } else {
          console.log("Virhe!" + JSON.stringify(time))
        }
      }
    }

    const customDiv = L.DomUtil.create("div", "overlay-container")
    customDiv.innerHTML = `<img src=${logo} alt="Logo" width=${120} height=${100} />`
    customDiv.addEventListener("click", () => {
      navigate("/")
    })
    map.getContainer().appendChild(customDiv)

    const pikapainikkeet = L.control({ position: "topleft" })

    pikapainikkeet.onAdd = () => {
      const container = L.DomUtil.create("div")
      L.DomEvent.disableClickPropagation(container)
      const root = createRoot(container)
      root.render(
        <div className="pikapainikkeet">
          <button
            className="pika-painike"
            onClick={() => onClickCreateEvent()}
            style={{
              backgroundImage: "url(/addeventCropped.png)", // Suora polku publicista
            }}
          ></button>
          {user && clubs[0] && (
            <button
              className="pika-painike"
              onClick={() => onClickCreateClubEvent()}
              style={{
                backgroundImage: "url(/create_event_partner_Cropped.png)", // Suora polku publicista
              }}
            ></button>
          )}
          {user && (
            <button
              className="pika-painike"
              onClick={() => onClickListJoinedEvents()}
              style={{
                backgroundImage: "url(/joinedeventsCropped.png)", // Suora polku publicista
              }}
            ></button>
          )}
          {user && (
            <button
              className="pika-painike"
              onClick={() => onClickCreatedEvents()}
              style={{
                backgroundImage: "url(/listedowneventsCropped.png)", // Suora polku publicista
              }}
            ></button>
          )}
          {user && (
            <button
              className="pika-painike"
              onClick={() => onClickOwnInfo()}
              style={{
                backgroundImage: "url(/personalinfoCropped.png)", // Suora polku publicista
              }}
            ></button>
          )}
        </div>
      )
      return container
    }
    pikapainikkeet.addTo(map)

    let initialSelections = {}
    if (deviceSettings && deviceSettings.selectedCategories !== null) {
      initialSelections = deviceSettings.selectedCategories
    }
    let initialShowSystems = true
    if (deviceSettings && deviceSettings.showSystems !== null) {
      initialShowSystems = deviceSettings.showSystems
    }

    const shortcutbuttons = L.control({ position: "topleft" })
    shortcutbuttons.onAdd = () => {
      const container = L.DomUtil.create("div")
      L.DomEvent.disableClickPropagation(container)
      const root = createRoot(container)
      root.render(
        <ShortcutButtons
          isOpen={isCategoryPanelOpen}
          toggleCategory={toggleCategory}
          toggleCategoryPanel={toggleCategoryPanel}
          fetchEvents={fetchEvents}
          onClose={() => setCategoryPanelOpen(false)}
          t={t}
          dispatch={dispatch}
          initialSelections={initialSelections}
          initialShowSystems={initialShowSystems}
        />
      )
      return container
    }
    shortcutbuttons.addTo(map)

    const refreshEvents = L.control({ position: "topright" })
    refreshEvents.onAdd = () => {
      const container = L.DomUtil.create("div")
      L.DomEvent.disableClickPropagation(container)
      const root = createRoot(container)

      const handleClick = () => {
        onClickRefresh(map, null)

        // Käynnistetään pyörimisefekti
        const image = container.querySelector(".refresh-image")
        image.classList.add("rotate-animation")

        // Poistetaan animaatio 1 sekunnin kuluttua
        setTimeout(() => {
          image.classList.remove("rotate-animation")
        }, 1000)
      }

      root.render(
        <div className="refresh-events">
          <button
            className="pika-painike-refresh"
            onClick={handleClick}>
            <div className="refresh-image"
              style={{
                backgroundImage: "url(/refreshCropped.png)", // Suora polku publicista
              }}
            /></button>
        </div>
      )
      return container
    }
    refreshEvents.addTo(map)

    const refreshStamp = L.control({ position: "topright" })
    refreshStamp.onAdd = () => {
      const container = L.DomUtil.create("div")
      timestampRef.current = createRoot(container)
      timestampRef.current.render(
        <div className="refresh-events">
          <p>{timeStamp}</p>
        </div>
      )
      return container
    }
    refreshStamp.addTo(map)

    map.on("moveend", () => {
      // Tallennetaan kartan nykyinen keskikohta reduxin storeen
      const newCenter = map.getCenter() // Kartan keskikohta
      const zoomLevel = map.getZoom() // Kartan zoom-level
      dispatch(
        changeLocation({
          o_lat: startingLocation.o_lat,
          o_lng: startingLocation.o_lng,
          lat: newCenter.lat,
          lng: newCenter.lng,
          zoom: zoomLevel,
        })
      )
    })

    map.on("baselayerchange", function (e) {
      console.log("Overlay lisätty:", e.name)
      switch (e.name) {
        case "Dark": {
          dispatch(changeDeviceSettings({
            layer: "dark"
          }))
          break
        }
        case "User": {
          dispatch(changeDeviceSettings({
            layer: "user"
          }))
          break
        }
        case "Liika": {
          dispatch(changeDeviceSettings({
            layer: "liika"
          }))
          break
        }
      }
    })

    map.addLayer(markerClusterGroup)
    onClickRefresh(map)
    if (deviceSettings && deviceSettings.selectedCategories !== null) {
      toggleCategory(deviceSettings.selectedCategories, deviceSettings.showSystems)
    }

    return () => {
      // Tuhoaa karttaelementin kun komponentti unmounttaa
      map.remove()
    }
  }, [])

  return (
    <div className="map">
      <div id="map" className="map"></div>
    </div>
  )
}

export default Map
