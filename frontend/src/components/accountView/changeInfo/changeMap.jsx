import Footer from "../../footer"
import Header from "../../header"
import translations from "../../../assets/translation.js"
import { useDispatch, useSelector } from "react-redux"
import "../../../index.css"
import "../accountView.css"
import { Link } from "react-router-dom"
import userService from "../../../services/userService.js"
import { useEffect, useState } from "react"
import { changeLocation } from "../../../store/locationSlice.js"
import { changeUser } from "../../../store/userSlice.js"
import NotificationContainer from "../../notification/notificationContainer.jsx"
import { addNotification } from "../../../store/notificationSlice.js"
import {
  DetailUpdated,
  TokenNotFound,
  MapUpdateError
} from "../../notification/notificationTemplates.js"
import LocationMap from '../../../utils/locationMap.jsx'

const ChangeMap = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const userID = useSelector((state) => state.user.user.userID)
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)
  const dispatch = useDispatch()
  const [location, setLocation] = useState(null)
  const oldLocation = [
    useSelector((state) => state.location.location.o_lng),
    useSelector((state) => state.location.location.o_lat),
  ]
  const [brightness, setBrightness] = useState(100)
  const [saturate, setSaturate] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [hue, setHue] = useState(0)
  const [invert, setInvert] = useState(0)
  const [sepia, setSepia] = useState(0)
  const [r, setR] = useState(180)
  const [g, setG] = useState(255)
  const [b, setB] = useState(122)
  const [a, setA] = useState(0)
  const [currentSetting, setCurrentSetting] = useState("brightness") // Asetus, jota säädetään (kirkkaus, äänenvoimakkuus, lämpötila)
  const [disabled, setDisabled] = useState(false)
  const oldPreferences = useSelector(
    (state) => state.user?.user?.mapPreferences ?? null
  )

  useEffect(() => {
    if (oldPreferences) {
      setBrightness(oldPreferences.brightness)
      setSaturate(oldPreferences.saturate)
      setContrast(oldPreferences.contrast)
      setHue(oldPreferences.hue)
      setInvert(oldPreferences.invert)
      setSepia(oldPreferences.sepia)
      setR(oldPreferences.r)
      setG(oldPreferences.g)
      setB(oldPreferences.b)
      setA(oldPreferences.a)
    }
  }, [])

  const saturateLimits = { min: 0, max: 300 } // Kylläisyys: 50%-300%
  const brightnessLimits = { min: 0, max: 200 } // Kirkkaus: 50%-150%
  const contrastLimits = { min: 0, max: 300 } // Kontrasti: 0%-300%
  const hueLimits = { min: -180, max: 180 }
  const invertLimits = { min: 0, max: 100 }
  const colorLimits = { min: 0, max: 255 }
  const aLimits = { min: 0, max: 30 }
  const sepiaLimits = { min: 0, max: 100 }

  const updateValue = (value, min, max) => Math.min(Math.max(value, min), max)

  const handleOnLocationChange = (location) => {
    setLocation(location)
  }

  const saveHandler = async () => {
    setDisabled(true)
    const mapPreferences = {
      brightness: brightness,
      saturate: saturate,
      contrast: contrast,
      hue: hue,
      invert: invert,
      sepia: sepia,
      r: r,
      g: g,
      b: b,
      a: a,
    }
    if (storedToken) {
      console.log(location)
      try {
        const response = await userService.updateUserMapLocation(storedToken, {
          UserID: userID,
          location: location,
          mapPreferences: mapPreferences,
        })
        console.log("Vaihdettu" + response) //TODO lisää notifikaatio kun vaihdettu
        dispatch(addNotification(DetailUpdated(t.detail_changed)))
        dispatch(
          changeLocation({
            o_lat: location.lat,
            o_lng: location.lng,
            lat: location.lat,
            lng: location.lng,
            zoom: location.zoom,
          })
        )
        dispatch(changeUser({ mapPreferences: mapPreferences }))
        setDisabled(false)
      } catch (error) {
        console.error(t.error_updating_map + error)
        dispatch(addNotification(MapUpdateError(t.error_updating_map)))
      }
    } else {
      console.error(t.token_not_found)
      dispatch(addNotification(TokenNotFound(t.token_not_found)))
    }
  }

  const handleSliderChange = (e) => {
    const newValue = Number(e.target.value)
    if (currentSetting === "brightness") {
      setBrightness(
        updateValue(newValue, brightnessLimits.min, brightnessLimits.max)
      )
    } else if (currentSetting === "saturate") {
      setSaturate(updateValue(newValue, saturateLimits.min, saturateLimits.max))
    } else if (currentSetting === "contrast") {
      setContrast(updateValue(newValue, contrastLimits.min, contrastLimits.max))
    } else if (currentSetting === "hue") {
      setHue(updateValue(newValue, hueLimits.min, hueLimits.max))
    } else if (currentSetting === "invert") {
      setInvert(updateValue(newValue, invertLimits.min, invertLimits.max))
    } else if (currentSetting === "a") {
      setA(updateValue(newValue, aLimits.min, aLimits.max))
    } else if (currentSetting === "r") {
      setR(updateValue(newValue, colorLimits.min, colorLimits.max))
    } else if (currentSetting === "g") {
      setG(updateValue(newValue, colorLimits.min, colorLimits.max))
    } else if (currentSetting === "b") {
      setB(updateValue(newValue, colorLimits.min, colorLimits.max))
    } else if (currentSetting === "sepia") {
      setSepia(updateValue(newValue, sepiaLimits.min, sepiaLimits.max))
    }
  }

  const toggleSlider = (setting) => {
    setCurrentSetting(currentSetting === setting ? null : setting)
  }

  // Määritetään aktiivinen sliderin min/max
  const getSliderLimits = () => {
    switch (currentSetting) {
      case "brightness":
        return brightnessLimits
      case "saturate":
        return saturateLimits
      case "contrast":
        return contrastLimits
      case "hue":
        return hueLimits
      case "invert":
        return invertLimits
      case "a":
        return aLimits
      case "r":
        return colorLimits
      case "g":
        return colorLimits
      case "b":
        return colorLimits
      case "sepia":
        return sepiaLimits
      default:
        return { min: 0, max: 100 }
    }
  }

  const sliderLimits = getSliderLimits()
  return (
    <div
      className="fullpage"
      style={{
        backgroundImage: "url('/backgroundpicture.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Header />
      <NotificationContainer />
      <div className="account-view">
        <h1>{t.mapSettings}</h1>

        <div className="account-view-form">
          <div
            className="blur-overlay set-overlay"
            style={{
              backdropFilter: `saturate(${saturate}%) brightness(${brightness}%) contrast(${contrast}%) hue-rotate(${hue}deg) invert(${invert}%) sepia(${sepia}%)`,
              backgroundColor: `rgba(${r}, ${g}, ${b}, ${a * 0.01})`,
            }}
          />
          <em style={{ marginBottom: "8px" }}>{t.setHomeLocation}</em>
          <LocationMap
            onLocationChange={handleOnLocationChange}
            oldLocation={oldLocation}
            layerOff={true}
          />
        </div>
        <div className="slider-panel">
          {currentSetting && (
            <div className="slider-wrapper">
              <input
                type="range"
                min={sliderLimits.min}
                max={sliderLimits.max}
                value={
                  currentSetting === "brightness"
                    ? brightness
                    : currentSetting === "saturate"
                      ? saturate
                      : currentSetting === "contrast"
                        ? contrast
                        : currentSetting === "invert"
                          ? invert
                          : currentSetting === "a"
                            ? a
                            : currentSetting === "r"
                              ? r
                              : currentSetting === "g"
                                ? g
                                : currentSetting === "b"
                                  ? b
                                  : currentSetting === "sepia"
                                    ? sepia
                                    : hue
                }
                onChange={handleSliderChange}
                className={`slider-input ${currentSetting}`}
              />
              <p>
                {currentSetting === "brightness" && (
                  <>
                    Kirkkaus: <span>{brightness}</span>%
                  </>
                )}
                {currentSetting === "saturate" && (
                  <>
                    Saturaatio: <span>{saturate}</span>%
                  </>
                )}
                {currentSetting === "contrast" && (
                  <>
                    Kontrasti: <span>{contrast}</span>%
                  </>
                )}
                {currentSetting === "hue" && (
                  <>
                    Sävy: <span>{hue}</span>°
                  </>
                )}
                {currentSetting === "invert" && (
                  <>
                    Käänteiset värit: <span>{invert}</span>%
                  </>
                )}
                {currentSetting === "r" && (
                  <>
                    R: <span>{r}</span>
                  </>
                )}
                {currentSetting === "g" && (
                  <>
                    G: <span>{g}</span>
                  </>
                )}
                {currentSetting === "b" && (
                  <>
                    B: <span>{b}</span>
                  </>
                )}
                {currentSetting === "a" && (
                  <>
                    Alpha: <span>0.{a}</span>
                  </>
                )}
                {currentSetting === "sepia" && (
                  <>
                    Seepia: <span>{sepia}</span>%
                  </>
                )}
              </p>
            </div>
          )}
          <div className="slider-container">
            {/* Painikkeet säätimille */}
            <div
              className={`slider-toggle ${currentSetting === "brightness" ? "active" : ""
                }`}
              onClick={() => toggleSlider("brightness")}
            >
              <span>Kirkkaus</span>
            </div>
            <div
              className={`slider-toggle ${currentSetting === "saturate" ? "active" : ""
                }`}
              onClick={() => toggleSlider("saturate")}
            >
              <span>Saturaatio</span>
            </div>
            <div
              className={`slider-toggle ${currentSetting === "contrast" ? "active" : ""
                }`}
              onClick={() => toggleSlider("contrast")}
            >
              <span>Kontrasti</span>
            </div>
            <div
              className={`slider-toggle ${currentSetting === "hue" ? "active" : ""
                }`}
              onClick={() => toggleSlider("hue")}
            >
              <span>Sävy</span>
            </div>
            <div
              className={`slider-toggle ${currentSetting === "sepia" ? "active" : ""
                }`}
              onClick={() => toggleSlider("sepia")}
            >
              <span>Seepia</span>
            </div>
            <div
              className={`slider-toggle ${currentSetting === "r" ? "active" : ""
                }`}
              onClick={() => toggleSlider("r")}
            >
              <span>R</span>
            </div>
            <div
              className={`slider-toggle ${currentSetting === "g" ? "active" : ""
                }`}
              onClick={() => toggleSlider("g")}
            >
              <span>G</span>
            </div>
            <div
              className={`slider-toggle ${currentSetting === "b" ? "active" : ""
                }`}
              onClick={() => toggleSlider("b")}
            >
              <span>B</span>
            </div>
            <div
              className={`slider-toggle ${currentSetting === "a" ? "active" : ""
                }`}
              onClick={() => toggleSlider("a")}
            >
              <span>Alpha</span>
            </div>
            <div
              className={`slider-toggle ${currentSetting === "invert" ? "active" : ""
                }`}
              onClick={() => toggleSlider("invert")}
            >
              <span>Invertoi</span>
            </div>
          </div>
        </div>
        <button className="save-btn" onClick={saveHandler} disabled={disabled}>
          {t.save}
        </button>
      </div>
      <Link
        to={"/own_info"}
        className="back-btn"
        style={{ alignSelf: "center" }}
      >
        <span>{t.back}</span>
      </Link>
      <Footer />
    </div>
  )
}

export default ChangeMap
