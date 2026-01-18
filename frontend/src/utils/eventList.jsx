import { useEffect, useState } from "react"
import "./eventList.css"
import { useSelector } from "react-redux"
import eventService from "../services/eventService"
import { parseTimeAndDate } from "./helper"
import { Link } from "react-router-dom"

import translations from "../assets/translation"
import { selectCategoryName } from "../assets/icons"

const EventList = (listType) => {
  const userID = useSelector((state) => state.user.user.userID)
  const clubs = useSelector((state) => state.user.user.clubs)
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const [events, setEvents] = useState([])
  const [clubEvents, setClubEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [upcomingClubEvents, setUpcomingClubEvents] = useState([])
  const [pastEvents, setPastEvents] = useState([])
  const [pastClubEvents, setPastClubEvents] = useState([])
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    const fetchEvents = async () => {
      if (listType.listType === "created") {
        try {
          const events = await eventService.getUserCreatedEvents(
            storedToken,
            userID
          )
          if (events) {
            setUpcomingEvents(events)
            setEvents(events)
          }

          // Haetaan clubiroolin luodut tapahtumat
          const clubEvents = await eventService.getClubCreatedEvents(
            storedToken,
            { UserID: userID, Clubs: clubs }
          )
          const clubIds = clubs.map((club) => club.ClubID) // Tehdään taulukko clubIDitä
          const groupedEvents = clubIds.map((clubId) => {
            const club = clubs.find((c) => c.ClubID === clubId)
            return {
              club: {
                ClubID: clubId,
                clubName: club?.Name || "Tuntematon klubi",
              },
              events: clubEvents.filter((event) => event.ClubID === clubId),
            }
          })
          setUpcomingClubEvents(groupedEvents)
          setClubEvents(groupedEvents)
        } catch (error) {
          console.error("Virhe haettaessa käyttäjän tapahtumia: " + error)
        }
      } else if (listType.listType === "joined") {
        try { // Haetaan käyttäjän liitytyt tapahtumat jos on siis liityttyjen näkymä
          const response = await eventService.getUserJoinedEvents(
            storedToken,
            userID
          )
          if (response) {
            setUpcomingEvents(response)
            setEvents(response)
          }
        } catch (error) {
          console.error("Virhe haettaessa käyttäjän tapahtumia: " + error)
        }
      }
    }
    fetchEvents()
  }, [userID, storedToken, listType])

  const handleTabChange = async (tab) => {
    setActiveTab(tab)
    if (tab === "upcoming") {
      setEvents(upcomingEvents)
      setClubEvents(upcomingClubEvents)
    } else {
      if (pastEvents.length === 0) {
        if (listType.listType === "created") {
          try {
            const clubEvents = await eventService.getClubCreatedEventsPast(
              storedToken,
              { UserID: userID, Clubs: clubs }
            )
            // Haetaan clubiroolin luodut menneet tapahtumat
            const clubIds = clubs.map((club) => club.ClubID)
            const groupedEvents = clubIds.map((clubId) => {
              const club = clubs.find((c) => c.ClubID === clubId)
              return {
                club: {
                  ClubID: clubId,
                  clubName: club?.Name || "Tuntematon klubi",
                },
                events: clubEvents.filter((event) => event.ClubID === clubId),
              }
            })
            setPastClubEvents(groupedEvents)
            setClubEvents(groupedEvents)
            // Haetaan käyttäjän luomat menneet tapahtumat
            const events = await eventService.getUserCreatedEventsPast(
              storedToken, userID)
            if (events) {
              setPastEvents(events)
              setEvents(events)
            }
          } catch (error) {
            console.error("Virhe haettaessa käyttäjän tapahtumia: " + error)
          }
        } else {
          try {
            const response = await eventService.getUserJoinedEventsPast(
              storedToken,
              userID
            )
            if (response) {
              setPastEvents(response)
              setEvents(response)
            }
          } catch (error) {
            console.error("Virhe haettaessa käyttäjän tapahtumia: " + error)
          }
        }
      } else {
        setEvents(pastEvents)
        setClubEvents(pastClubEvents)
      }
    }
  }

  const header = () => {
    if (listType.listType === "created") {
      return <h1 className="h1-resizeable">{t.createdEvents}:</h1>
    } else {
      return <h1 className="h1-resizeable">{t.joinedEvents}:</h1>
    }
  }

  const parseLink = () => {
    if (listType.listType === "created") {
      return "/events/own/"
    } else {
      return "/events/"
    }
  }

  return (
    <div className="joined-view">
      <div className="tab-container">
        <div
          className={`tab ${activeTab === "upcoming" ? "active-tab" : ""}`}
          onClick={() => handleTabChange("upcoming")}
        >
          {t.showUpcomingEvents}
        </div>
        <div
          className={`tab ${activeTab === "past" ? "active-tab" : ""}`}
          onClick={() => handleTabChange("past")}
        >
          {t.showPastEvents}
        </div>
      </div>
      <div className="event-container">
        {header()}
        <div className="event-list-items">
          {events.map((event, index) => (
            <Link
              to={`${parseLink()}${event.EventID}`}
              key={index}
              className="event-item-container"
            >
              <div className="event-item">
                <div>
                  <h2>{t.title}</h2>
                  {event.Title}
                </div>
                <div>
                  <h2>{t.time}</h2>
                  {parseTimeAndDate(event.StartTime)[1].slice(0, -4)} {""}
                  {parseTimeAndDate(event.StartTime)[0]}
                </div>

                <div>
                  <h2>{t.participants}</h2>
                  {event.JoinedCount}
                </div>
              </div>

              <div className="event-item">
                <img
                  src={`/lajit/${selectCategoryName([event.CategoryID])}.png`}
                  alt="Logo"
                  width={100}
                  height={100}
                  className="event-view-icon" // Ei taida toimia tää className??
                />
              </div>
            </Link>
          ))}
        </div>
        {listType.listType === "created" && clubEvents[0] && (
          <div>
            {clubEvents.map(({ club, events }) => (
              <div key={club.ClubID} className="event-container">
                <div className="spacer-line"></div>
                <h1>{club.clubName}</h1>
                <div className="spacer-line"></div>
                <div className="event-list-items">
                  {events.length === 0 ? (
                    <p>{t.no_upcoming_events}</p>
                  ) : (
                    events.map((event, index) => (
                      <Link
                        to={`${parseLink()}${event.EventID}`}
                        key={index}
                        className="event-item-container"
                      >
                        <div className="event-item">
                          <div>
                            <em>{club.clubName}</em>
                            <h3>{t.title}</h3>
                            {event.Title}
                          </div>
                          <div>
                            <h3>{t.time}</h3>
                            {parseTimeAndDate(event.StartTime)[1].slice(
                              0,
                              -4
                            )}{" "}
                            {parseTimeAndDate(event.StartTime)[0]}
                          </div>
                          <div>
                            <h3>{t.participants}</h3>
                            {event.JoinedCount}
                          </div>
                        </div>

                        <div className="event-item">
                          <img
                            src={`/lajit/${selectCategoryName([
                              event.CategoryID,
                            ])}.png`}
                            alt="Logo"
                            width={100}
                            height={100}
                            className="event-view-icon"
                          />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventList
