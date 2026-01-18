import translations from "../../assets/translation"
import Header from "../header"
import LoginForm from "./LoginForm"
import Footer from "../footer"
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import loginService from "../../services/loginService.js" // Tuo loginService
import "./login.css"
import NotificationContainer from "../notification/notificationContainer"
import { addNotification } from "../../store/notificationSlice.js"
import { 
  EmailSentSuccess, 
  EmailSentFailure, 
  OtpRobotCheck, 
  OtpVerified, 
  OtpNotVerified, 
  UserFailure} from "../notification/notificationTemplates.js"


const Login = () => {
  const [emailForm, setEmailForm] = useState(false)
  const [email, setEmail] = useState("")
  const [resetMessage, setResetMessage] = useState("")
  const [loader, setLoader] = useState(false)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()

    setLoader(true)

    try {
      console.log("Sähköposti: " + email)
      const response = await loginService.sendEmail(email)
      console.log("SendEmail response " + response)
      setLoader(false)
      if (response.message === "Sähköposti lähetetty!") {
        dispatch(addNotification(EmailSentSuccess(t.email_sent)));
        setResetMessage(t.email_sent)
        setEmail("") // Tyhjennä sähköposti-kenttä
      } else {
        dispatch(addNotification(EmailSentFailure(t.email_not_found)));
        setResetMessage(response.message || t.email_not_found)
      }
    } catch (error) {
      dispatch(addNotification(EmailSentFailure(t.email_not_found)));
      setResetMessage("")
      setLoader(false)
    }
  }

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
      <NotificationContainer/>
      <div className="login">
        <h1>{t.login2}</h1>
        <LoginForm />
        <div className="forgot-password-text">
          <a href="#" onClick={() => setEmailForm(!emailForm)}>
            {t.forgot_pw}
          </a>
        </div>
        {emailForm && (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {loader ? (
              <div className="loader"></div>
            ) : (
              <div>
                <button className="btn" type="submit">
                  {t.reset_pw}
                </button>
                {resetMessage && (
                  <img
                    src={"/checkCropped.png"}
                    alt="check"
                    width={100}
                    height={100}
                    style={{ display: "block", margin: "0 auto" }}
                  />
                )}
              </div>
            )}
          </form>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Login
