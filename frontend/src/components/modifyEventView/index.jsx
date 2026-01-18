import { Link, useNavigate, useParams } from "react-router-dom"
import Footer from "../footer"
import Header from "../header"
import Select from "react-select"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import translations from "../../assets/translation"
import eventService from "../../services/eventService"
import { addEvent, removeEvent } from "../../store/eventSlice"
import { selectCategoryName } from "../../assets/icons"
import { parseTimeAndDate } from "../../utils/helper"
import "./modifyEventView.css"
import DatePicker from "react-multi-date-picker"
import { addNotification } from "../../store/notificationSlice.js"
import {
  EventNotFound,
  EventJoinSuccess,
  EventJoinFailure,
  EventDeletionFailure,
  EventLeaveSuccess,
  EventLeaveFailure
} from "../notification/notificationTemplates.js"
import NotificationContainer from "../notification/notificationContainer.jsx"
import LocationMap from '../../utils/locationMap.jsx'


const ModifyEvent = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [times, setTimes] = useState([])
  const [pastTimes, setPastTimes] = useState([]) // Menneiden tapahtumaaikojen lista
  const [loading, setLoading] = useState(true)
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const userID = useSelector((state) => state.user.user.userID)
  const userEvents = useSelector((state) => state.event.events || [])
  // Uudet tiedot:
  const [event_location, setEventLocation] = useState(null)
  const [title, setTitle] = useState("")
  const [participantsMin, setParticipantsMin] = useState("")
  const [participantsMax, setParticipantsMax] = useState("")
  const [description, setDescription] = useState("")
  const [activity, setActivity] = useState({})
  const [dates, setDates] = useState([])
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEventInfo = async () => {
      try {
        const eventData = await eventService.getSingleEventWithTimes({
          EventID: id,
        })
        setEvent(eventData)

        console.log(eventData.Times)
        const pastTimes = eventData.Times.filter(
          (time) => new Date(time.EndTime) <= new Date()
        )
        setPastTimes(pastTimes)
        const futureTimes = eventData.Times.filter((time) => new Date(time.StartTime) > new Date())
        setTimes(futureTimes)
        setActivity({
          value: eventData.CategoryID,
          label: t[selectCategoryName([eventData.CategoryID])],
        })
      } catch (error) {
        dispatch(addNotification(EventNotFound(t.event_not_found)))
        console.error(t.event_not_found + error)
      } finally {
        setLoading(false)
      }
    }
    fetchEventInfo()
  }, [id, t])

  // Tapahtumaan liittymisen painikkeen handleri
  const handleJoin = async (selectedTime, userID, id) => {
    try {
      const response = await eventService.joinEvent(storedToken, {
        UserID: userID,
        EventID: id,
        TimeID: Number(selectedTime.TimeID),
      })
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
    } catch (error) {
      console.error(t.event_join_failure + error)
      dispatch(addNotification(EventJoinFailure(t.event_join_failure)))
    }
  }

  // Päivitä tapahtumaa
  const handleUpdateEvent = async () => {
    const updatedtitle = title || event.Title

    const updatedStartTime =
      startTime || times[0] && parseTimeAndDate(times[0].StartTime)[0] || pastTimes[0] && parseTimeAndDate(pastTimes[0].StartTime)[0]
    const updatedEndTime = endTime || times[0] && parseTimeAndDate(times[0].EndTime)[0] || pastTimes[0] && parseTimeAndDate(pastTimes[0].EndTime)[0]
    const updatedParticipantsMin = participantsMin || event.ParticipantMin
    const updatedParticipantsMax = participantsMax || event.ParticipantMax
    const updatedDescription = description || event.Description
    const updatedCategoryID = activity.value || event.CategoryID // Jos kategoria on tyhjä, käytetään oletusarvoa

    const response = await eventService.modifyEvent(storedToken, {
      Title: updatedtitle,
      UserID: userID,
      CategoryID: updatedCategoryID,
      Dates: dates,
      StartTime: updatedStartTime,
      EndTime: updatedEndTime,
      Event_Location: event_location,
      ParticipantsMin: updatedParticipantsMin,
      ParticipantsMax: updatedParticipantsMax,
      Description: updatedDescription,
      EventID: id,
    })
    if (response.status === 200) {
      console.log("joo")
      navigate("/created_events")
      //TODO: Notifikaatio että onnistui
    }
    //TODO: Errornotifikaatio, ettei onnistunut
  }

  // Poista tapahtuman päivä
  const handleCancelEvent = async (time) => {
    // TODO: Lisää alert: Haluatko poistaa tapahtuman esiintymän?
    const userConfirmed = window.confirm(t.event_deletion_warning)
    if (!userConfirmed) {
      return
    }
    try {
      var response = null
      /*
      if (times.length === 1) {
        response = await eventService.deleteEvent(storedToken, {
          UserID: userID,
          EventID: event.EventID,
          TimeID: time.TimeID,

        })
        navigate("/created_events")
      } else { */

      response = await eventService.deleteEventTime(storedToken, {
        UserID: userID,
        TimeID: time.TimeID,
      })
      // Päivitä frontendin times-tila poistamalla kyseinen aika listasta
      setTimes((prevTimes) =>
        prevTimes.filter((t) => t.TimeID !== time.TimeID)
      )
      //}
    } catch (error) {
      console.error("Virhe poistettaessa tapahtumaa" + error) //TODO NOTIYFY
      dispatch(addNotification(EventDeletionFailure(t.event_deletion_failure)))
    }
  }

  const handleLocationChange = (newLocation) => {
    setEventLocation(newLocation)
  }

  const handleTimeClick = (time, userID, id) => {
    if (!isJoined(time)) {
      handleJoin(time, userID, id)
    } else {
      handleLeave(time, userID, id)
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
      dispatch(addNotification(EventLeaveSuccess(t.event_left))) // TODO: Lisää notifikaatio?
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
      console.error("Virhe poistuessa tapahumasta" + error)
      dispatch(addNotification(EventLeaveFailure(t.event_leave_failure)))

    }
  }
  const handleChange = (selectedOption) => {
    setActivity(selectedOption)
  }

  const categories = useSelector((state) => state.categories.categories)

  const options = () => {
    try {
      return categories.map((cat) => ({
        value: cat.CategoryID,
        label: t[selectCategoryName([cat.CategoryID])],
      }))
    } catch (error) {
      console.log(error)
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
      <div className="modify-event-view">
        <div className="own-event-item">
          <h1>{t.event_editing}</h1>
          <p>
            {t.editEventDetailsView}
            <br />
            {t.enterNewInfoEditable}
            <br />
            <br />
            {t.exitWithoutSave}
          </p>
        </div>
        <div className="own-event-item">
          <h2>{t.currentActivity}</h2>
          <p className="old-event-value">
            {t[selectCategoryName([event.CategoryID])]}
          </p>
          <img
            src={`/lajit/${selectCategoryName([event.CategoryID])}.png`}
            alt="Logo"
            width={100}
            height={100}
            className="event-view-icon"
          />
          <span className="spacer-line"></span>
          <h3>{t.activity}</h3>
          <Select
            className="input-field"
            placeholder={t.activity}
            value={activity}
            onChange={handleChange}
            options={options()}
            isSearchable={true}
            required={true}
          />
        </div>
        <div className="own-event-item">
          <h2>{t.currentTitle}</h2>
          <p className="old-event-value">{event.Title}</p>
          <span className="spacer-line"></span>
          <h2>{t.newTitle}</h2>
          <input
            type="text"
            value={title}
            placeholder={`${event.Title}`}
            className="input-field"
            onChange={(e) => setTitle(e.target.value)}
            required={true}
          />
        </div>
        {pastTimes.length > 0 && <div className="own-event-item">
          <h2>{t.pastEventDates}</h2>
          <div className="time-parent">
            {pastTimes.map((time, index) => (
              <div key={index} className="time-child">
                {parseTimeAndDate(time.StartTime)[1]}
                <div className="counter-icon">
                  <span>
                    {time.JoinedCount}/{event.ParticipantMax}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>}
        <div className="own-event-item">
          <h2>{t.scheduledDates}</h2>
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

                <button className="btn" onClick={() => handleCancelEvent(time)}>
                  {t.deleteDate}
                </button>
              </div>
            ))}
          </div>
          <span className="spacer-line"></span>
          <h2>{t.scheduleMoreDates}</h2>
          <DatePicker
            value={dates}
            onChange={(newDates) =>
              setDates([...newDates].sort((a, b) => new Date(a) - new Date(b)))
            }
            multiple
            style={{ textAlign: "center" }}
            minDate={Date.now()}
            zIndex={1005}
            displayWeekNumbers={true}
            render={(value, openCalendar) => (
              <div className="custom-date-display" onClick={openCalendar}>
                {Array.isArray(value) ? (
                  value.map((date, index) => <div key={index}>{date}</div>)
                ) : (
                  <span>{value || "Choose dates"}</span>
                )}
              </div>
            )}
            format="DD.MM.YYYY"
            weekStartDayIndex={1}
          />
        </div>
        <div className="own-event-item">
          <h2>{t.currentTime}</h2>
          <p className="old-event-value">
            {times[0] && parseTimeAndDate(times[0].StartTime)[0] || pastTimes[0] && parseTimeAndDate(pastTimes[0].StartTime)[0]} -{" "}
            {times[0] && parseTimeAndDate(times[0].EndTime)[0] || pastTimes[0] && parseTimeAndDate(pastTimes[0].EndTime)[0]}
          </p>
          <span className="spacer-line"></span>
          <h2>{t.newTiming}</h2>
          <h3>{t.startTime}</h3>
          <input
            type="time"
            value={startTime}
            name="startTime"
            className="input-field"
            onChange={(e) => setStartTime(e.target.value)}
            placeholder={t.dateAndTime}
            required={true}
          />
          <h3>{t.endTime}</h3>
          <input
            type="time"
            value={endTime}
            name="endTime"
            className="input-field"
            onChange={(e) => setEndTime(e.target.value)}
            placeholder={t.dateAndTime}
            required={true}
          />
        </div>
        <div className="own-event-item">
          <h2>{t.location}</h2>
          <LocationMap
            onLocationChange={handleLocationChange}
            oldLocation={[
              event.Event_Location.coordinates[0],
              event.Event_Location.coordinates[1],
            ]}
          />
        </div>
        <div className="own-event-item">
          <h2>{t.participantLimits}</h2>
          <p className="old-event-value">
            {event.ParticipantMin} - {event.ParticipantMax}
          </p>
          <span className="spacer-line"></span>
          <h2>{t.newParticipantLimits}</h2>
          <input
            type="number"
            value={participantsMin}
            name="minParticipants"
            className="input-field"
            onChange={(e) => setParticipantsMin(e.target.value)}
            placeholder={t.minParticipants}
            required={true}
          />
          <input
            type="number"
            value={participantsMax}
            name="maxParticipants"
            className="input-field"
            onChange={(e) => setParticipantsMax(e.target.value)}
            placeholder={t.maxParticipants}
            required={true}
          />
        </div>
        <div className="own-event-item">
          <h2>{t.currentDescription}</h2>
          <p className="old-event-value" style={{ textAlign: "left", marginBottom: "10px", whiteSpace: 'pre-line' }}>{event.Description}</p>
          <span className="spacer-line"></span>
          <h2>{t.newDescription}</h2>
          <textarea
            type="description"
            value={description}
            name="description"
            className="input-field"
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.description}
          />
        </div>
        <p style={{ fontWeight: "lighter" }}>{t.lastUpdated}</p>
        <p style={{ fontWeight: "lighter" }}>
          {parseTimeAndDate(event.updatedAt)[1]}{" "}
          {parseTimeAndDate(event.updatedAt)[0]}
        </p>
        <button className="modify-event-btn" onClick={handleUpdateEvent}>
          {t.saveChanges}
        </button>
        <Link to={"/map"} className="back-btn">
          <span>{t.back}</span>
        </Link>
      </div>

      <Footer />
    </div>
  )
}

export default ModifyEvent
