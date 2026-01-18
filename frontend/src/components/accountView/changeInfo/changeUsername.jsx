import { useState } from "react"
import Footer from "../../footer"
import Header from "../../header"
import translations from "../../../assets/translation.js"
import { useDispatch, useSelector } from "react-redux"
import "../../../index.css"
import "../accountView.css"
import { Link } from "react-router-dom"
import userService from "../../../services/userService.js"
import { addNotification } from "../../../store/notificationSlice.js"
import NotificationContainer from "../../notification/notificationContainer.jsx"
import {
  DetailUpdated,
  EmailUpdateFailure,
  TokenNotFound
} from "../../notification/notificationTemplates.js"


const ChangeUsername = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const [newUsername, setNewUsername] = useState("")

  const [oldUsername, setOldUsername] = useState(
    useSelector((state) => state.user.user.username)
  )
  const userID = useSelector((state) => state.user.user.userID)
  const [newUserNameAgain, setNewUserNameAgain] = useState("")
  const [disabled, setDisabled] = useState(false)
  const dispatch = useDispatch()
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)

  const handleSubmit = async () => {
    setDisabled(true)
    if (storedToken) {
      try {
        const response = await userService.updateUserUsername(storedToken, {
          UserID: userID,
          Username: newUsername,
        })
        console.log(t.detail_changed + response)
        dispatch(addNotification(DetailUpdated(t.detail_changed)))
        setOldUsername(newUsername)
      } catch (error) {
        console.error("virhe käyttäjätunnuksen vaihdossa" + error)
        dispatch(addNotification(EmailUpdateFailure(t.username_update_error)))
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
        <div className="account-view-form">
          <h1>{t.changeUsername}</h1>
          <p>
            {t.currentUsername} {oldUsername}
          </p>
          <h3>{t.newUsername}</h3>
          <input
            className="input-field"
            type="text"
            value={newUsername}
            name="newUsername"
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder={t.newUsername}
            required={true}
          />
          <h3>{t.newUsernameAgain}</h3>
          <input
            className="input-field"
            type="text"
            value={newUserNameAgain}
            name="newUserNameAgain"
            onChange={(e) => setNewUserNameAgain(e.target.value)}
            placeholder={t.newUsernameAgain}
            required={true}
          />
          <button className="save-btn" onClick={handleSubmit} disabled={disabled}>
            {t.save}
          </button>
        </div>
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

export default ChangeUsername
