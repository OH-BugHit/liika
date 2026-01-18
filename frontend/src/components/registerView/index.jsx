import { useSelector } from "react-redux"
import Footer from "../footer"
import Header from "../header"
import translations from "../../assets/translation"
import RegisterForm from "./registerForm"
import "../../index.css"
import NotificationContainer from "../notification/notificationContainer"
import { Link } from "react-router-dom"

const Register = () => {
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
      <NotificationContainer />
      <Header />
      <div className="register">
        <h1>{t.register}</h1>
        <RegisterForm />
        <p style={{ textAlign: "center" }}>
          {t.ready_account}
          <br />
          <Link to={"/login"}>{t.login2}</Link>
        </p>
      </div>
      <Footer />
    </div>
  )
}

export default Register
