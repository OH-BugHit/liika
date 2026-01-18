import Header from "../header"
import mapImage from "../../assets/map_kuvituskuva.png"
import Footer from "../footer"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import SignedOut from "./singedOut"
import SignedIn from "./signedIn"
import translations from "../../assets/translation"
import NotificationContainer from "../notification/notificationContainer"
const Frontpage = () => {
  const navigate = useNavigate()
  const navigateTo = (path) => {
    navigate(`/${path}`)
  }
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const user = useSelector((state) => state.user.user)

  const isSingedIn = () => {
    if (user === null) {
      return (false)
    }
    return true
  }

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
      <Header backButton={true} />
      <NotificationContainer />
      <div className="frontpage">
        <div className="map-container">
          <div className="text-background2">
            <h5 className="welcome-text">{t.welcomeText1}</h5>
          </div>
          <div className="image-wrapper">
            <span
              href="/map"
              className="placeholder"
              onClick={() => navigate("/map")}
            >
              {t.start}
            </span>
            <img
              src={mapImage}
              className="map-image"
              alt="Map"
              onClick={() => navigateTo("map")}
            />
          </div>
          <div className="button-container">{isSingedIn() ? <SignedIn /> : <SignedOut />}</div>
          <div className="text-background">
            <h5 className="frontpage-descriptive-text">
              <style className={"text-h6"}>Liika.eu</style> {t.welcomeText}
            </h5>
          </div>
          <div className="text-background3">
            {" "}
            <div className="frontpage-smaller-descriptive-text">
              {t.welcomeText2}
            </div>
          </div>
        </div>
        {!isSingedIn() && <div className='frontpage-smaller-descriptive-text'>{t.registerForFreeText}</div>}
      </div>
      <Footer />
    </div>
  )
}

export default Frontpage
