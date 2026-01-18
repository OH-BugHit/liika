import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import translations from "../../assets/translation"
import { useState } from 'react'

const SignedOut = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const [disabled, setDisabled] = useState(false)

  const navigate = useNavigate()
  const navigateTo = (path) => {
    setDisabled(true)
    navigate(`/${path}`)
  }
  return (
    <div className="login-register-container">
      <div className="login-register-buttons">
        <button
          className="login-frontpage-btn"
          onClick={() => navigateTo("login")}
          disabled={disabled}
        >
          {t.login}
        </button>
        <button
          className="register-frontpage-btn"
          onClick={() => navigateTo("register")}
          disabled={disabled}
        >
          {t.register}
        </button>
      </div>

    </div>
  )
}

export default SignedOut
