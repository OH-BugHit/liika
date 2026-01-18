import { useDispatch, useSelector } from "react-redux"
import Map from "./map"
import "./mapView.css"
import eventService from "../../services/eventService"
import { changeCategories } from "../../store/categoriesSlice"
import { setEvents } from "../../store/eventSlice"
import { useEffect } from "react"

const MapView = () => {
  const startingLocation = useSelector((state) => state.location.location) // haetaan kartan aloituskohta
  const userID = useSelector((state) => state.user?.user?.userID ?? null)
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)
  const dispatch = useDispatch()
  const categories = useSelector(
    (state) => state.categories?.categories ?? null
  )
  const events = useSelector((state) => state.event?.events ?? null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!categories || categories.length === 0) {
          const fetchedCategories = await eventService.getCategories()
          dispatch(changeCategories(fetchedCategories))
        }
      } catch (error) {
        console.error("Category fetch error:", error)
      }
    }

    fetchCategories()
  }, [dispatch, categories]) // Riippuvuus vain categories

  // Haetaan eventit vain, jos käyttäjä on kirjautunut eikä eventtejä ole jo haettu
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (
          userID &&
          (!events || (Array.isArray(events) && events.length === 0))
        ) {
          const fetchedEvents = await eventService.getJoined(storedToken, {
            UserID: userID,
          })

          // Tarkistetaan, ettei tehdä turhaa päivitystä
          if (
            !events ||
            JSON.stringify(events) !== JSON.stringify(fetchedEvents)
          ) {
            dispatch(setEvents(fetchedEvents))
          }
        }
      } catch (error) {
        console.error("Event fetch error:", error)
      }
    }

    fetchEvents()
  }, [dispatch, events, userID, storedToken]) // Riippuvuus vain userID, jotta se ei hae turhaan uudelleen

  return (
    <div
      className="fullpage"
      style={{
        backgroundImage: "url('/background-logandreg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="event-map-container">
        <Map startingLocation={startingLocation} />
      </div>
    </div>
  )
}

export default MapView
