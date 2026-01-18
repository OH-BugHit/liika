import { useEffect, useState } from "react"
import eventService from "../../services/eventService"
import Footer from "../footer"
import Header from "../header"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import translations from "../../assets/translation"
import "./eventView.css"
import { selectCategoryName } from "../../assets/icons"
import { addEvent, removeEvent } from "../../store/eventSlice"
import StaticMap from "../../utils/staticMap"
import { parseTimeAndDate, translateLanguage, translateOn } from "../../utils/helper"
import SendEmail from "../../utils/sendEmail.jsx"
import { addNotification } from "../../store/notificationSlice.js"
import {
  EventNotFound,
  EventJoinSuccess,
  EventJoinFailure,
  EventLeaveSuccess
} from "../notification/notificationTemplates.js"
import NotificationContainer from "../notification/notificationContainer.jsx"
import translationService from '../../services/translationService.js'



const EventView = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [times, setTimes] = useState([])
  const [loading, setLoading] = useState(true)
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const userID = useSelector((state) => state.user?.user?.userID ?? null)
  const userEvents = useSelector((state) => state.event.events || [])
  const [email, setEmail] = useState("")
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const dispatch = useDispatch()
  const [disableButton, setDisableButton] = useState(false)
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)
  // Käännökset
  const [translateBtnIsDisabled, setTranslateBtnIsDisabled] = useState(false)

  useEffect(() => {
    const fetchEventInfo = async () => {
      try {
        const eventData = await eventService.getSingleEventWithTimes({
          EventID: id,
        })
        setEvent(eventData)
        setTimes(eventData.Times)
      } catch (error) {
        console.error(t.event_not_found + error)
        dispatch(addNotification(EventNotFound(t.event_not_found)))
      } finally {
        setLoading(false)
      }
    }
    fetchEventInfo()
  }, [id])

  const handleTranslate = async () => {
    setTranslateBtnIsDisabled(true)

    // Luodaan inputObject ja annetaan sille helpot avainarvoparit
    const inputObject = {
      systemDescription: event.Description,
    }

    const toLanguage = translateLanguage(language)

    try {
      const translated = await translationService.getTranslations(storedToken, {
        UserID: userID,
        inputObject,
        toLanguage
      })
      // Päivitetään system olio uusilla käännöksillä
      const translatedEvent = {
        ...event,
        Description: translated.systemDescription,
      }
      // Asetetaan käännökset näkyville
      setEvent(translatedEvent)
    } catch (e) {
      console.error("Error with translation", e) // TODO: Notify käännöksen epäonnistumisesta
      setTranslateBtnIsDisabled(false)
    }
  }


  // Tapahtumaan liittymisen painikkeen handleri
  const handleJoin = async (selectedTime, userID, id) => {
    try {
      const response = await eventService.joinEvent(storedToken, {
        UserID: userID,
        EventID: id,
        TimeID: Number(selectedTime.TimeID),
      })

      console.log("join API response:", response) // TODO: Lisää notifikaatio?
      if (!response) {
        throw new Error(t.event_join_failure)
      }
      if (response && response.status >= 200 && response.status < 300) {
        dispatch(addNotification(EventJoinSuccess(t.event_joined)))
        dispatch(
          addEvent({
            UserID: userID,
            EventID: Number(id),
            TimeID: Number(selectedTime.TimeID),
          })
        )

        // Päivitä frontendin Times-tila
        setTimes((prevTimes) =>
          prevTimes.map((time) =>
            time.TimeID === selectedTime.TimeID
              ? { ...time, JoinedCount: (Number(time.JoinedCount) || 0) + 1 }
              : time
          )
        )
      } else {
        throw new Error(t.event_join_failure)
      }
    } catch (error) {
      console.error(t.event_join_failure + error)
      dispatch(addNotification(EventJoinFailure(t.event_join_failure)))
    }
  }


  const handleJoinUnSigned = async (time, email) => {
    console.log(time)
    try {
      const response = await eventService.joinEventUnSigned({
        Email: email,
        EventID: event.EventID,
        TimeID: Number(time.TimeID),
      })
      console.log(response) // TODO: Lisää notifikaatio?
      dispatch(addNotification(EventJoinSuccess(t.event_joined))),
        // Päivitä frontendin Times-tila
        setTimes((prevTimes) =>
          prevTimes.map((onetime) =>
            onetime.TimeID === time.TimeID
              ? { ...onetime, JoinedCount: (Number(onetime.JoinedCount) || 0) + 1 }
              : onetime
          )
        )
      dispatch(
        addEvent({
          UserID: null,
          EventID: Number(id),
          TimeID: Number(time.TimeID),
        })
      )
    } catch (error) {
      console.error(t.event_join_failure + error)
      dispatch(addNotification(EventJoinFailure(t.event_join_failure)))

    }
  }

  // Tapahtumasta eroamisen painikkeen handleri
  const handleLeave = async (selectedTime, userID, id) => {
    try {
      const response = await eventService.leaveEvent(storedToken, {
        UserID: userID,
        EventID: Number(id),
        TimeID: Number(selectedTime.TimeID),
      })
      console.log(response) // TODO: Lisää notifikaatio?
      dispatch(addNotification(EventLeaveSuccess(t.event_left)))
      dispatch(
        removeEvent({
          EventID: Number(id),
          UserID: userID,
          TimeID: selectedTime.TimeID,
        })
      )
      // Päivitä frontendin Times-tila
      setTimes((prevTimes) =>
        prevTimes.map((time) =>
          time.TimeID === selectedTime.TimeID
            ? {
              ...time,
              JoinedCount: Math.max((Number(time.JoinedCount) || 0) - 1, 0),
            }
            : time
        )
      )
    } catch (error) {
      console.error(t.event_join_failure + error)
      dispatch(addNotification(EventJoinFailure(t.event_join_failure)))
    }
  }

  // Päivämäärän valinnan handleri
  const handleTimeClick = (time, userID, id) => {
    if (!isJoined(time)) {
      handleJoin(time, userID, id)
    } else {
      handleLeave(time, userID, id)
    }
  }

  // Päivämäärän valinnan handleri
  const handleTimeClickUnsigned = (time) => {
    if (!isJoined(time)) {
      handleJoinUnSigned(time, email)
    }
  }

  // Tarkistaa onko käyttäjä liittynyt tiettyyn aikaan
  const isJoined = (time) => {
    return userEvents.some(
      (userEvent) =>
        String(userEvent.EventID) === String(id) &&
        Number(userEvent.TimeID) === Number(time.TimeID)
    )
  }

  const getTimeButtonClass = (time) => {
    return isJoined(time) ? "not-joined-time-btn" : "joined-time-btn"
  }

  const showUsername = ({ user, club }) => {
    if (club) {
      return (
        <h1 style={{ textAlign: "center" }}>
          {club} {t.organizesEvent}:
        </h1>
      )
    }
    if (user.includes("@") || user.includes("-")) {
      return ""
    } else {
      return (
        <h1>
          {user} {t.organizesEvent}:
        </h1>
      )
    }
  }

  if (loading) {
    // Tietokantahaku kesken
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
        <div className="event-view">
          <p>{t.loading_event}</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!event) {
    // Jos tapahtumaa ei löytynyt tietokantahaulla
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
        <div className="event-view">
          <p>{t.no_event_found}</p>
        </div>
        <Footer />
      </div>
    )
  }

  //Kirjautumaton tarvittavat tiedot löydetty

  if (!userID) {
    return (
      <div
        className="fullpage"
        style={{
          backgroundImage: "url('/alternativebackgroundpicture.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Header />
        <NotificationContainer />
        <div className="event-view">
          <img
            src={`/lajit/${selectCategoryName([event.CategoryID])}.png`}
            alt="Logo"
            width={100}
            height={100}
            className="event-view-icon" // Ei taida toimia tää className??
          />
          <h1>{event.Title}</h1>
          <h2>{t.upcomingEventDays}</h2>
          <div className="time-parent">
            {times.map((time, index) => (
              <div key={index} className="time-child">
                {parseTimeAndDate(time.StartTime)[1]}

              </div>
            ))}
          </div>
          <h2>{t.time}</h2>
          <p style={{ fontWeight: "bold" }}>
            {parseTimeAndDate(times[0].StartTime)[0]} -{" "}
            {parseTimeAndDate(times[0].EndTime)[0]}
          </p>
          <h2>{t.location}</h2>
          <StaticMap mapCenter={event.Event_Location.coordinates} />

          <h2>{t.participantCount}</h2>
          <p>
            {event.ParticipantMin} - {event.ParticipantMax}
          </p>
          <h2>{t.description}</h2>
          <div style={{ maxWidth: "600px", textAlign: "left", marginBottom: "10px", whiteSpace: 'pre-line' }}>
            {event.Description}
          </div>
          <h3>{t.enterEmailToJoinEvent}</h3>
          <input
            type="text"
            value={email}
            name="email"
            className="input-field"
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email}
            required={true}
          />

          <div>
            <SendEmail
              setIsOtpVerifiedFromParent={setIsOtpVerified}
              email={email}
              setDisableButton={setDisableButton}
            />
          </div>
          {isOtpVerified && <div>
            <div className="time-parent">
              {times.map((time, index) => (
                <div key={index} className="time-child">
                  {parseTimeAndDate(time.StartTime)[1]}
                  <div className="counter-icon">
                    <span>
                      {time.JoinedCount}/{event.ParticipantMax}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTimeClickUnsigned(time, email)}
                    className={getTimeButtonClass(time)}
                  >{!isJoined(time) && t.join}{isJoined(time) && t.youHaveJoinedForTheEvent}</button>

                </div>
              ))}
            </div>
          </div>
          }
          <em style={{ fontWeight: "lighter" }}>{t.lastUpdated}</em>
          <em style={{ fontWeight: "lighter" }}>
            {parseTimeAndDate(event.updatedAt)[1]}{" "}
            {parseTimeAndDate(event.updatedAt)[0]}
          </em>
          <Link to={"/map"} className="back-btn">
            <span>{t.back}</span>
          </Link>
        </div>

        <Footer />
      </div>
    )
  }

  // Kaikki tarvittavat tiedont löydetty. Näytetään...
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
      <div className="event-view">
        {translateOn(language) && <div className='translate-btn-container-top-right'> {/*Käännöksen tuottamisen painike*/}
          <button className='translate-btn' onClick={handleTranslate} disabled={translateBtnIsDisabled} >Translate</button>
        </div>}
        {showUsername({ user: event.Username, club: event.ClubName })}
        <img
          src={`/lajit/${selectCategoryName([event.CategoryID])}.png`}
          alt="Logo"
          width={100}
          height={100}
          className="event-view-icon" // Ei taida toimia tää className??
        />
        <h1>{event.Title}</h1>
        <h2>{t.upcomingEventDays}</h2>
        <div className="time-parent">
          {times.map((time, index) => (
            <div key={index} className="time-child">
              {parseTimeAndDate(time.StartTime)[1]}

            </div>
          ))}
        </div>
        <h2>{t.time}</h2>
        <p style={{ fontWeight: "bold" }}>
          {parseTimeAndDate(times[0].StartTime)[0]} -{" "}
          {parseTimeAndDate(times[0].EndTime)[0]}
        </p>
        <h2>{t.location}</h2>
        <StaticMap mapCenter={event.Event_Location.coordinates} />

        <h2>{t.participants}</h2>
        <p>
          {event.ParticipantMin} - {event.ParticipantMax}
        </p>
        <h2>{t.description}</h2>
        <div style={{ maxWidth: "600px", textAlign: "left", marginBottom: "10px", whiteSpace: 'pre-line' }}>
          {event.Description}
        </div>
        <h2>{t.join}</h2>
        <div className="time-parent">
          {times.map((time, index) => (
            <div key={index} className="time-child">
              {parseTimeAndDate(time.StartTime)[1]}
              <div className="counter-icon">
                <span>
                  {time.JoinedCount}/{event.ParticipantMax}
                </span>
              </div>
              <button
                onClick={() => handleTimeClick(time, userID, id)}
                className={getTimeButtonClass(time)}
              >{!isJoined(time) && t.join}{isJoined(time) && t.leave_event}</button>

            </div>
          ))}
        </div>
        <em style={{ fontWeight: "lighter" }}>{t.lastUpdated} {" "}
          {parseTimeAndDate(event.updatedAt)[1]}{" "}
          {parseTimeAndDate(event.updatedAt)[0]}
        </em>
        <Link to={-1} className="back-btn">
          <span>{t.back}</span>
        </Link>
        <span className="spacer-line"></span>
      </div>

      <Footer />
    </div>
  )
}

export default EventView
