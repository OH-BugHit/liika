import { useState } from "react"
import Footer from "../../footer"
import Header from "../../header"
import translations from "../../../assets/translation.js"
import { useSelector } from "react-redux"
import "../../../index.css"
import "../accountView.css"
import { Link } from "react-router-dom"
import { addNotification } from "../../../store/notificationSlice.js"
import NotificationContainer from "../../notification/notificationContainer.jsx"
import {
  DetailUpdated,
  EmailUpdateFailure,
  TokenNotFound
  } from "../../notification/notificationTemplates.js"


const ChangePassword = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordAgain, setNewPasswordAgain] = useState("")
  const [disabled, setDisabled] = useState(false)
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)
  const userID = useSelector((state) => state.user?.user?.userID ?? null)

  const handleChangePassword = async () => {
    setDisabled(true)
    if (storedToken) {
      try {
        const result = await userService.updateUserPassword(storedToken, {
          UserID: userID,
          newPassword: newPassword,
        })
        if (result) {
          setNewPassword("")
          setNewPasswordAgain("")
          console.log("Onnistui!")
          // TODO: Notifikaatio onnistui
        }
      } catch (error) {
        console.error(error)
        // TODO: Notifikaatio
        setDisabled(false)
      }
    } else {
      console.error("No token provided")
      dispatchEvent(addNotification(TokenNotFound("No token provided")))
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
          <h1>{t.ChangePassword}</h1>
          <h3>{t.newPassword}</h3>
          <input
            className="input-field"
            type="text"
            value={newPassword}
            name="new-password"
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t.newPassword}
            required={true}
            autoComplete="new-password"
          />
          <h3>{t.newPasswordAgain}</h3>
          <input
            className="input-field"
            type="text"
            value={newPasswordAgain}
            name="new-password-again"
            onChange={(e) => setNewPasswordAgain(e.target.value)}
            placeholder={t.newPasswordAgain}
            required={true}
            autoComplete="new-password"
          />
          <button className="save-btn" onClick={handleChangePassword} disabled={disabled}>
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

export default ChangePassword
