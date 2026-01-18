/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import translations from "../../assets/translation.js"
import "./createEvent.css"
import Select from "react-select"
import eventService from "../../services/eventService.js"
import { useNavigate } from "react-router-dom"
import DatePicker from "react-multi-date-picker"
import SendEmail from "../../utils/sendEmail.jsx"
import { selectCategoryName } from "../../assets/icons.js"
import { addNotification } from "../../store/notificationSlice.js"
import {
  EventCreated,
  EventCreationFailure,
  OtpNotVerified,
} from "../notification/notificationTemplates.js"

import { createEventUnSignedValidation } from "../../utils/validationSchemas.js"
import { createEventValidation } from "../../utils/validationSchemas.js"
import LocationMap from '../../utils/locationMap.jsx'

const CreateEventForm = ({ club }) => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const navigate = useNavigate()

  const [errors, setErrors] = useState({})
  const [activity, setActivity] = useState({})
  const [dates, setDates] = useState([])
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [event_location, setEventLocation] = useState("")
  const [title, setTitle] = useState("")
  const [participantsMin, setParticipantsMin] = useState("")
  const [participantsMax, setParticipantsMax] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [blockRegister, setBlockCreate] = useState(true)
  const [disable, setDisabled] = useState(false)
  const [selectedClub, setSelectedClub] = useState(null)
  const userID = useSelector((state) => state.user?.user?.userID ?? null)
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)
  const clubs = useSelector((state) => state.user?.user?.clubs ?? null)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  let clubID = null // Tallennettava yhteistyökumppani ID. Oletus on null
  const dispatch = useDispatch()

  const handleClubSelect = (clubId) => {
    setSelectedClub(clubId)
  }

  // Tallennetaan muuttujaan return arvo
  const schema = createEventValidation()

  const schemaUnSigned = createEventUnSignedValidation()

  const clubEventView = () => {
    if (club && clubs[0]) {
      return (
        <div className="form-item">
          <div className="club-selection-container">
            <h2>{t.choose_organiser}:</h2>
            {clubs.map((club) => (
              <label key={club.ClubID} className="club-radio-item">
                <input
                  type="radio"
                  name="club"
                  value={club.ClubID}
                  checked={selectedClub === club.ClubID}
                  onChange={() => handleClubSelect(club.ClubID)}
                />
                {club.Name}
              </label>
            ))}
          </div>
        </div>
      )
    } else return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setDisabled(true)
    const categoryID = activity.value

    if (club) {
      console.log("clubitapahtuma")
      clubID = selectedClub
    }

    try {
      await schema.validate(
        {
          title,
          categoryID,
          dates,
          startTime,
          endTime,
          participantsMin,
          participantsMax,
          description,
        },
        { abortEarly: false }
      )
      setErrors({})

      try {
        const response = await eventService.createEvent(storedToken, {
          title,
          userID,
          categoryID,
          dates,
          startTime,
          endTime,
          event_location,
          participantsMin,
          participantsMax,
          description,
          clubID,
        })
        console.log(response)
        if (response === 201) {
          // uusi event luotu
          navigate(`/map`)
        }
      } catch (error) {
        console.error(t.event_creation_failure + error)
        dispatch(addNotification(EventCreationFailure(t.event_creation_failure)))
        setDisabled(false)
      }
    } catch (err) {
      if (err.inner) {
        const errorMap = {}
        err.inner.forEach((error) => {
          errorMap[error.path] = error.message
        })
        setErrors(errorMap)
        console.log("Validation errors:", errorMap)
      }
      setDisabled(false)
    }
  }

  const handleLocationChange = (newLocation) => {
    setEventLocation(newLocation)
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

  const handleChange = (selectedOption) => {
    setActivity(selectedOption)
  }

  const handleSubmitUnSigned = async (event) => {
    const categoryID = activity.value
    event.preventDefault()
    setBlockCreate(true)
    setDisabled(true)

    if (!isOtpVerified) {
      console.error(t.otp_send_error)
    } else {
      try {
        await schemaUnSigned.validate(
          {
            title,
            categoryID,
            dates,
            startTime,
            endTime,
            participantsMin,
            participantsMax,
            description,
            email,
          },
          { abortEarly: false }
        )
        setErrors({})
        try {
          const response = await eventService.createEventUnSigned({
            // TODO: Tee varmennus, että kyselyn tekijä on sama joka varmensi emailin
            title,
            categoryID,
            dates,
            startTime,
            endTime,
            event_location,
            participantsMin,
            participantsMax,
            description,
            email,
            clubID,
          })
          if (response === 201) {
            navigate(`/map`)
          }
        } catch (error) {
          console.error("Erron while creating event (unsigned): " + error) //TODO: notifikaatio
          dispatch(
            addNotification(EventCreationFailure(t.event_creation_failure))
          )
          setBlockCreate(false)
        }
      } catch (err) {
        if (err.inner) {
          const errorMap = {}
          err.inner.forEach((error) => {
            errorMap[error.path] = error.message
          })
          setErrors(errorMap)
          console.log("Validation errors:", errorMap)
        }
        setDisabled(false)
      }
    }
  }

  if (!userID) {
    // Ei-kirjautuneen käyttäjän näkymä
    return (
      <div className="create-event-form">
        <div className="form-item">
          <h3>{t.title}</h3>
          <input
            type="text"
            value={title}
            placeholder={t.title}
            className={`input-field ${errors.title ? "error" : ""}`}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {errors.title && <div className="error-forms">{errors.title}</div>}
        <div className="form-item">
          <h3>{t.activity}</h3>
          <Select
            className={`input-field ${errors.categoryID ? "error" : ""}`}
            placeholder={t.activity}
            value={activity}
            onChange={handleChange}
            options={options()}
            isSearchable={true}
          />
        </div>
        {errors.categoryID && (
          <div className="error-forms">{errors.categoryID}</div>
        )}
        <div className="form-item">
          <h3>{t.date}</h3>
          <DatePicker
            value={dates}
            sort
            onChange={setDates}
            multiple
            style={{ textAlign: "center" }}
            minDate={yesterday}
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
        {errors.dates && <div className="error-forms">{errors.dates}</div>}
        <div className="form-item">
          <h3>{t.startTime}</h3>
          <input
            type="time"
            value={startTime}
            name="startTime"
            className={`input-field ${errors.startTime ? "error" : ""}`}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder={t.dateAndTime}
          />
        </div>
        {errors.startTime && (
          <div className="error-forms">{errors.startTime}</div>
        )}
        <div className="form-item">
          <h3>{t.endTime}</h3>
          <input
            type="time"
            value={endTime}
            name="endTime"
            className={`input-field ${errors.endTime ? "error" : ""}`}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder={t.dateAndTime}
          />
        </div>
        {errors.endTime && <div className="error-forms">{errors.endTime}</div>}
        <div className="form-item">
          <br />
          <h3>{t.setEventLocationInfo}</h3>
          <LocationMap onLocationChange={handleLocationChange} />
        </div>
        <div className="form-item">
          <h3>{t.minParticipants}</h3>
          <input
            type="number"
            value={participantsMin}
            name="minParticipants"
            className={`input-field ${errors.participantsMin ? "error" : ""}`}
            onChange={(e) => setParticipantsMin(e.target.value)}
            placeholder={t.minParticipants}
          />
        </div>
        {errors.participantsMin && (
          <div className="error-forms">{errors.participantsMin}</div>
        )}
        <div className="form-item">
          <h3>{t.maxParticipants}</h3>
          <input
            type="number"
            value={participantsMax}
            name="maxParticipants"
            className={`input-field ${errors.participantsMax ? "error" : ""}`}
            onChange={(e) => setParticipantsMax(e.target.value)}
            placeholder={t.maxParticipants}
          />
        </div>
        {errors.participantsMax && (
          <div className="error-forms">{errors.participantsMax}</div>
        )}
        <div className="form-item">
          <h3>{t.description}</h3>
          <textarea
            type="description"
            value={description}
            name="description"
            className={`input-field ${errors.description ? "error" : ""}`}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.description}
          />
        </div>
        {errors.description && (
          <div className="error-forms">{errors.description}</div>
        )}
        <div className="form-item">
          <h3>{t.email}</h3>
          <input
            type="text"
            value={email}
            name="email"
            className={`input-field ${errors.email ? "error" : ""}`}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.email}
          />
        </div>
        {errors.email && <div className="error-forms">{errors.email}</div>}

        <div>
          <SendEmail
            setIsOtpVerifiedFromParent={setIsOtpVerified}
            email={email}
            setDisableButton={setBlockCreate}
          />
        </div>

        <button
          className={`forms-btn`}
          disabled={blockRegister}
          onClick={handleSubmitUnSigned}
        >
          <span>{t.createEvent}</span>
        </button>
        <div style={{ marginTop: "20px" }}>
          <em>{t.modify_event_later}.</em>
        </div>
      </div>
    )
  }

  return (
    // Kirjautuneen käyttäjän näkymä
    <div className="create-event-form">
      <form onSubmit={handleSubmit}>
        {clubEventView()}
        <div className="form-item">
          <h3>{t.title}</h3>
          <input
            type="text"
            value={title}
            placeholder={t.title}
            className={`input-field ${errors.title ? "error" : ""}`}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {errors.title && <div className="error-forms">{errors.title}</div>}
        <div className="form-item">
          <h3>{t.activity}</h3>
          <Select
            className={`input-field ${errors.categoryID ? "error" : ""}`}
            placeholder={t.activity}
            value={activity}
            onChange={handleChange}
            options={options()}
            isSearchable={true}
          />
        </div>
        {errors.categoryID && (
          <div className="error-forms">{errors.categoryID}</div>
        )}
        <div className="form-item">
          <h3>{t.date}</h3>
          <DatePicker
            value={dates}
            sort
            onChange={setDates}
            multiple
            style={{ textAlign: "center" }}
            minDate={yesterday}
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
        {errors.dates && <div className="error-forms">{errors.dates}</div>}
        <div className="form-item">
          <h3>{t.startTime}</h3>
          <input
            type="time"
            value={startTime}
            name="startTime"
            className={`input-field ${errors.startTime ? "error" : ""}`}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder={t.dateAndTime}
          />
        </div>
        {errors.startTime && (
          <div className="error-forms">{errors.startTime}</div>
        )}
        <div className="form-item">
          <h3>{t.endTime}</h3>
          <input
            type="time"
            value={endTime}
            name="endTime"
            className={`input-field ${errors.endTime ? "error" : ""}`}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder={t.dateAndTime}
          />
        </div>
        {errors.endTime && <div className="error-forms">{errors.endTime}</div>}
        <div className="form-item">
          <h3>{t.setEventLocationInfo}</h3>
          <LocationMap onLocationChange={handleLocationChange} />
        </div>
        <div className="form-item">
          <h3>{t.minParticipants}</h3>
          <input
            type="number"
            value={participantsMin}
            name="minParticipants"
            className={`input-field ${errors.participantsMin ? "error" : ""}`}
            onChange={(e) => setParticipantsMin(e.target.value)}
            placeholder={t.minParticipants}
          />
        </div>
        {errors.participantsMin && (
          <div className="error-forms">{errors.participantsMin}</div>
        )}
        <div className="form-item">
          <h3>{t.maxParticipants}</h3>
          <input
            type="number"
            value={participantsMax}
            name="maxParticipants"
            className={`input-field ${errors.participantsMax ? "error" : ""}`}
            onChange={(e) => setParticipantsMax(e.target.value)}
            placeholder={t.maxParticipants}
            required={true}
          />
        </div>
        {errors.participantsMax && (
          <div className="error-forms">{errors.participantsMax}</div>
        )}
        <div className="form-item">
          <h3>{t.description}</h3>
          <textarea
            type="description"
            value={description}
            name="description"
            className={`input-field ${errors.description ? "error" : ""}`}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.description}
          />
        </div>
        {errors.description && (
          <div className="error-forms">{errors.description}</div>
        )}
        <button
          className={`forms-btn`}
          onClick={handleSubmit}
          disabled={disable}
        >
          <span>{t.createEvent}</span>
        </button>
      </form>
    </div>
  )
}

export default CreateEventForm
