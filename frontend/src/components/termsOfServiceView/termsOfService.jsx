import translations from "../../assets/translation.js"
import { useSelector } from "react-redux"

const TermsOfService = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  return (
    <div className="text-box">
      <h2> {t.terms_of_service}</h2>
      <div>{t.terms_of_service_txt}</div>
    </div>
  )
}

export default TermsOfService
