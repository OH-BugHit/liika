import { useDispatch, useSelector } from "react-redux"
import { useEffect, useRef, useState } from "react"
import translations from "../../assets/translation.js"
import loginService from "../../services/loginService.js"
import { useNavigate } from "react-router-dom"
import "./login.css"
import { changeLocation } from "../../store/locationSlice.js"
import { changeUser } from "../../store/userSlice.js"
import { loginValidation } from "../../utils/validationSchemas.js"
import { addNotification } from "../../store/notificationSlice.js"
import { UserFailure } from "../notification/notificationTemplates.js"
import { changeLanguage } from "../../store/languageSlice.js"
import { changeDeviceSettings } from '../../store/deviceSettingsSlice.js'

const LoginForm = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [disabled, setDisabled] = useState(false)

  // Tallennetaan muuttujaan return arvo
  const schema = loginValidation()

  const inputRef = useRef(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setDisabled(true)

    try {
      await schema.validate({ username, password }, { abortEarly: false })
      setErrors({})

      try {
        const user = await loginService.login({
          username,
          password,
        })
        let zoom
        if (user.mapZoom) {
          zoom = user.mapZoom
        } else {
          zoom = 10
        }
        dispatch(
          changeUser({
            userID: user.userID,
            username: user.username,
            token: user.token,
            email: user.email,
            clubs: user.clubs,
            mapPreferences: user.mapPreferences,
          })
        )
        dispatch(
          changeLocation({
            o_lat: user.location[1],
            o_lng: user.location[0],
            lat: user.location[1],
            lng: user.location[0],
            zoom: zoom,
          })
        )
        dispatch(
          changeDeviceSettings({
            selectedCategories: {},
            showSystems: true
          })
        )
        dispatch(changeLanguage(user.language))
        navigate(`/`)
      } catch (error) {
        dispatch(addNotification(UserFailure(t.alert_incorrect)))
        console.log(error)
        setDisabled(false)
      }
    } catch (err) {
      if (err.inner) {
        const errorMap = {}
        err.inner.forEach((error) => {
          errorMap[error.path] = error.message
        })
        setErrors(errorMap)
        console.log("Validation errors:", errorMap)
      }
      setDisabled(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="login-form">
      <form onSubmit={handleSubmit}>
        <div className="login-form-item">
          <h3>{t.username}</h3>
          <input
            ref={inputRef}
            type="text"
            className={`input-field ${errors.username ? "error" : ""}`}
            value={username}
            name="username"
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t.username}
            autoComplete="text"
          />
        </div>
        {errors.username && (
          <div className="error-forms">{errors.username}</div>
        )}
        <div className="login-form-item">
          <h3>{t.password}</h3>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              className={`input-field ${errors.password ? "error" : ""}`}
              value={password}
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.password}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={togglePasswordVisibility}
            >
              <span className="material-symbols-outlined">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>
        {errors.password && (
          <div className="error-forms">{errors.password}</div>
        )}
        <button type="submit" className="forms-btn" disabled={disabled}>
          <span>{t.login}</span>
        </button>
      </form>
    </div>
  )
}
export default LoginForm
