import Footer from "../footer"
import Header from "../header"
import CreateEventForm from "./createEventForm"
import "./createEvent.css"
import { useSelector } from "react-redux"
import translations from "../../assets/translation"
import NotificationContainer from "../notification/notificationContainer"

// eslint-disable-next-line react/prop-types
const CreateEventView = ({ club }) => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]

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
      <Header />
      <NotificationContainer />
      <div className="create-event">
        <h1>{t.createEvent}</h1>
        <CreateEventForm club={club} />
      </div>
      <Footer />
    </div>
  )
}



export default CreateEventView
