import Footer from "../footer"
import Header from "../header"
import { useSelector } from "react-redux"
import translations from "../../assets/translation"
import EventList from "../../utils/eventList"
import { Link } from "react-router-dom"
const JoinedView = () => {
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
      <EventList listType="joined" />
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

export default JoinedView
