import "../index.css"
import { useSelector } from "react-redux"
import translations from "../assets/translation.js"
import FlagSelection from "./flagSelection.jsx"
import { Link, useNavigate } from "react-router-dom"

const Footer = () => {
  const navigate = useNavigate()
  const navigateTo = (path) => {
    navigate(`/${path}`)
  }
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="flag-selection">
          <FlagSelection menuPlacement="top" />
        </div>
        <div className="footer-text">
          <Link to={`/termsOfService`}>{t.terms_of_service}</Link>
        </div>
        <div className='footer-text'><Link to={'/privacy'}>{t.privacy}</Link></div>
        <div>
          <button className="info-btn" onClick={() => navigateTo("info")}>
            i
          </button>
        </div>
        <p style={{ fontWeight: "lighter" }}>Liika v. 1.9.6</p>
        <p style={{ fontWeight: "lighter" }}>
          <Link to={`/us`}>{t.contactUs}</Link>
        </p>
      </div>
    </footer>
  )
}

export default Footer
