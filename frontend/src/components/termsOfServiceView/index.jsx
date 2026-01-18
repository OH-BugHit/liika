import { Link } from "react-router-dom"
import Header from "../header"
import TermsOfService from "./termsOfService"
import Footer from "../footer"
import { useSelector } from "react-redux"
import translations from "../../assets/translation"

const TermsOfServiceView = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]

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
      <Header />
      <TermsOfService />
      <Link to={-1} className="back-btn" style={{ alignSelf: "center" }}>
        <span>{t.back}</span>
      </Link>
      <Footer />
    </div>
  )
}

export default TermsOfServiceView
