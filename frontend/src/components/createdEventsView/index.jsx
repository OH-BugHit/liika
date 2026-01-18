import Header from "../header"
import EventList from "../../utils/eventList"
import Footer from "../footer"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import translations from "../../assets/translation"
import NotificationContainer from "../notification/notificationContainer"

const CreatedEvents = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]

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
      <NotificationContainer/>
      <EventList listType="created" />
      <Link
        to={"/map"}
        className="back-btn"
        style={{ margin: "auto", marginBottom: "30px", marginTop: "10px" }}
      >
        <span>{t.back}</span>
      </Link>
      <Footer />
    </div>
  )
}

export default CreatedEvents
