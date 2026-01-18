import Footer from "../../footer"
import Header from "../../header"
import translations from "../../../assets/translation.js"
import { useSelector } from "react-redux"
import "../../../index.css"
import "../accountView.css"
import { Link } from "react-router-dom"
import FlagSelection from "../../flagSelection.jsx"
import userService from "../../../services/userService.js"
import {
  DetailUpdated,
  LanguageUpdateFailure,
  TokenNotFound
  } from "../../notification/notificationTemplates.js"
import { addNotification } from "../../../store/notificationSlice.js"
import NotificationContainer from "../../notification/notificationContainer.jsx"


const ChangeLanguage = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const [disabled, setDisabled] = useState(false)
  const userID = useSelector((state) => state.user.user.userID)
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)

  const saveHandler = async () => {
    setDisabled(true)
    console.log("Change language attempt:", {
      language,
    })
    if (storedToken) {
      try {
        const response = await userService.updateUserLanguage(storedToken, {
          UserID: userID,
          LanguageID: language,
        })
        console.log("Vaihdettu" + response) //TODO lisää notifikaatio kun vaihdettu
        dispatch(addNotification(DetailUpdated(t.detail_changed)))
      } catch (error) {
        console.error(t.language_update_failure + error)
        dispatch(addNotification(LanguageUpdateFailure(t.language_update_failure)))

      }
    } else {
      console.error(t.tokenNotFound)
      dispatch(addNotification(TokenNotFound(t.tokenNotFound)))
    }
  }

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
        <h1>{t.ChangeLanguage}</h1>
        <FlagSelection menuPlacement="bottom" />
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

export default ChangeLanguage
