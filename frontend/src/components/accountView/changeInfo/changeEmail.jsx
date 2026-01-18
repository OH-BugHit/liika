import { useState } from "react"
import Footer from "../../footer"
import Header from "../../header"
import translations from "../../../assets/translation.js"
import { useDispatch, useSelector } from "react-redux"
import "../../../index.css"
import "../accountView.css"
import { Link } from "react-router-dom"
import userService from "../../../services/userService.js"
import { changeUser } from "../../../store/userSlice.js"
import {
  DetailUpdated,
  EmailUpdateFailure,
  TokenNotFound
  } from "../../notification/notificationTemplates.js"
import { addNotification } from "../../../store/notificationSlice.js"
import NotificationContainer from "../../notification/notificationContainer.jsx"


const ChangeEmail = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const [newEmail, setNewEmail] = useState("")
  const userID = useSelector((state) => state.user.user.userID)
  const [newEmailAgain, setNewEmailAgain] = useState("")
  const [oldEmail, setOldEmail] = useState(
    useSelector((state) => state.user.user.email)
  )
  const [disabled, setDisabled] = useState(false)
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)
  const dispatch = useDispatch()

  const handleSubmit = async () => {
    setDisabled(true)
    if (storedToken) {
      try {
        const response = await userService.updateUserEmail(storedToken, {
          UserID: userID,
          Email: newEmail,
        })
        console.log("Vaihdettu" + response)
        setOldEmail(newEmail)
        dispatch(changeUser({ email: newEmail })) //TODO lisää notifikaatio kun vaihdettu
        dispatch(addNotification(DetailUpdated(t.detail_changed)))
      } catch (error) {
        console.error(t.email_update_error + error)
        dispatch(addNotification(EmailUpdateFailure(t.email_update_error)))
        
        
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
        <h1>{t.changeEmail}</h1>
        <div className="account-view-form">
          <p>
            {t.currentEmail} {oldEmail}
          </p>
          <h3>{t.newEmail}</h3>
          <input
            className="input-field"
            type="text"
            value={newEmail}
            name="newEmail"
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder={t.newEmail}
            required={true}
          />
          <h3>{t.newEmailAgain}</h3>
          <input
            className="input-field"
            type="text"
            value={newEmailAgain}
            name="newEmailAgain"
            onChange={(e) => setNewEmailAgain(e.target.value)}
            placeholder={t.newEmailAgain}
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

export default ChangeEmail
