import { useDispatch, useSelector } from "react-redux"
import { useEffect, useRef, useState } from "react"
import translations from "../../assets/translation.js"
import { useNavigate } from "react-router-dom"
import registerService from "../../services/registerService.js"
import "./register.css"
import { changeLocation } from "../../store/locationSlice.js"
import { changeUser } from "../../store/userSlice.js"
import {
  otpValidation,
  registerValidation,
} from "../../utils/validationSchemas.js"
import { addNotification } from "../../store/notificationSlice.js"
import {
  EmailSentSuccess,
  EmailSentFailure,
  OtpRobotCheck,
  OtpVerified,
  OtpNotVerified,
  EmailAlreadyRegistered,
  EmailSendWait,
} from "../notification/notificationTemplates.js"
import { Link } from "react-router-dom"
import LocationMap from "../../utils/locationMap.jsx"

const RegisterForm = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordAgain, setPasswordAgain] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordAgain, setShowPasswordAgain] = useState(false)
  const [location, setLocation] = useState()
  const [errors, setErrors] = useState({})
  const [otp, setOtp] = useState("") // OTP-tila
  const [otpSent, setOtpSent] = useState(false) // Tila OTP:n lähetyksen seuraamiseksi
  const [isOtpVerified, setIsOtpVerified] = useState(false) // Tila OTP:n vahvistuksen seuraamiseksi
  const [loader, setLoader] = useState(false)
  const [blockRegister, setBlockRegister] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [canResendOtp, setCanResendOtp] = useState(false)

  const schema = registerValidation()
  const schemaOtp = otpValidation()

  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const otpInputRefs = useRef([]) // Luo ref-taulukko

  useEffect(() => {
    otpInputRefs.current = otpInputRefs.current.slice(0, 6) // Varmista, että ref-taulukko on oikean kokoinen
  }, [])

  useEffect(() => {
    let timer
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    } else if (resendCooldown === 0 && otpSent && !canResendOtp) {
      // Cooldown on päättynyt, OTP on lähetetty aiemmin, ja emme ole vielä sallineet uudelleenlähetystä
      setCanResendOtp(true)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown, otpSent, canResendOtp])

  const handleReadyState = () => {
    setBlockRegister(true)
    setTimeout(() => navigate("/"), 3000)
  }

  const handleOtpChange = (index, value) => {
    const newOtp = otp.split("")
    newOtp[index] = value
    setOtp(newOtp.join(""))

    // Siirrä kohdistus seuraavaan kenttään, jos kentässä on arvo
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const sendOtp = async () => {
    try {
      await schema.validate(
        { username, email, password, passwordAgain },
        { abortEarly: false }
      )
      setErrors({})
    } catch (err) {
      if (err.inner) {
        const errorMap = {}
        err.inner.forEach((error) => {
          errorMap[error.path] = error.message
        })
        setErrors(errorMap)

        console.log("Validation errors:", errorMap)
      }
      return
    }
    setLoader(true)
    try {
      const response = await registerService.sendOtp({
        email: email,
        language: language,
      })
      console.log(response)
      dispatch(addNotification(EmailSentSuccess(t.email_sent))) // Lähetä onnistumisilmoitus

      // Jos OTP lähetettiin onnistuneesti, päivitä tila
      setOtpSent(true)
      setLoader(false)
      setBlockRegister(false)
      setCanResendOtp(false)
      setResendCooldown(30)
    } catch (error) {
      console.error(t.email_send_error, error)

      dispatch(addNotification(EmailSentFailure(t.email_send_error))) // Lähetä virheilmoitus
      setLoader(false)
    }
  }

  const handleResendOtp = async () => {
    if (loader) {
      dispatch(addNotification(EmailSendWait(t.email_send_wait)))
      return
    }

    setLoader(true)

    try {
      const response = await registerService.sendOtp({
        email: email,
        language: language,
      })
      console.log(response)
      dispatch(addNotification(EmailSentSuccess(t.email_sent)))
      setOtp("") // Tyhjennetään vanha OTP käyttäjän syötteestä
      otpInputRefs.current.forEach((input) => {
        // Tyhjennetään myös yksittäiset input-kentät visuaalisesti
        if (input) input.value = ""
      })
      setLoader(false)
      setCanResendOtp(false)
      setResendCooldown(30)
    } catch (error) {
      console.error(t.email_send_error, error)
      dispatch(addNotification(EmailSentFailure(t.email_send_error))) // Lähetä virheilmoitus
      setLoader(false)
    }
  }

  const verifyOtp = async () => {
    setBlockRegister(true)
    if (!termsAccepted) {
      setErrors({ ...errors, terms: t.terms_of_service_accept })
      setBlockRegister(false)
      return
    }

    await schemaOtp.validate({ otp }, { abortEarly: false })
    try {
      // Lähetä OTP backendille vahvistusta varten
      const user = await registerService.register({
        username,
        email,
        password,
        role: 0,
        location,
        language,
        otp,
      })
      dispatch(
        changeUser({
          userID: user.userID,
          username: user.username,
          token: user.token,
          email: user.email,
        })
      )
      dispatch(
        changeLocation({
          o_lat: user.location[1],
          o_lng: user.location[0],
          lat: user.location[1],
          lng: user.location[0],
          zoom: 14,
        })
      ) // Kovakoodattu etäisyys
      setIsOtpVerified(true)
      dispatch(addNotification(OtpVerified(t.email_confirmation))) // Lähetä onnistumisilmoitus
      // Jos OTP on oikein, päivitä tila
      handleReadyState()
    } catch (error) {
      if (error.response) {
        if (error.response.status == 400) {
          dispatch(
            addNotification(EmailAlreadyRegistered(t.email_already_registered))
          ) // Lähetä virheilmoitus
        } else {
          console.error(t.otp_not_verified, error)
          dispatch(addNotification(OtpNotVerified(t.otp_send_error))) // Lähetä virheilmoitus
        }
      }
      setBlockRegister(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  const togglePasswordVisibilityAgain = () => {
    setShowPasswordAgain(!showPasswordAgain)
  }

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData("text")
    const pasteArray = paste.split("").slice(0, 6) // Rajoitetaan 6 merkkiin

    setOtp(pasteArray.join("")) // Asetetaan koko OTP-arvo kerralla

    // Täytetään input-kentät ja siirretään focus viimeiseen
    pasteArray.forEach((value, index) => {
      if (otpInputRefs.current[index]) {
        otpInputRefs.current[index].value = value
      }
    })

    if (otpInputRefs.current[pasteArray.length - 1]) {
      otpInputRefs.current[pasteArray.length - 1].focus()
    }
  }

  return (
    <div className="register-form">
      <div className="register-form-item">
        <h3>{t.email}</h3>
        <input
          type="text"
          className={`input-field ${errors.email ? "error" : ""}`}
          value={email}
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.email}
          autoComplete="email"
        />
      </div>
      {errors.email && <div className="error-forms">{errors.email}</div>}
      <div className="register-form-item">
        <h3>{t.username}</h3>
        <input
          ref={inputRef}
          type="text"
          className={`input-field ${errors.username ? "error" : ""}`}
          value={username}
          name="username"
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t.username}
          autoComplete="username"
        />
      </div>
      {errors.username && <div className="error-forms">{errors.username}</div>}
      <div className="register-form-item">
        <h3>{t.password}</h3>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            className={`input-field ${errors.password ? "error" : ""}`}
            value={password}
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.password}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle-button"
            onClick={togglePasswordVisibility}
          >
            <span
              className="material-symbols-outlined"
              style={{ maxWidth: "20px" }}
            >
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>
      {errors.password && <div className="error-forms">{errors.password}</div>}
      <div className="register-form-item">
        <h3>{t.passwordAgain}</h3>
        <div className="password-input-container">
          <input
            type={showPasswordAgain ? "text" : "password"}
            className={`input-field ${errors.passwordAgain ? "error" : ""}`}
            value={passwordAgain}
            name="passwordAgain"
            onChange={(e) => setPasswordAgain(e.target.value)}
            placeholder={t.passwordAgain}
            autoComplete="off"
          />
          <button
            type="button"
            className="password-toggle-button"
            onClick={togglePasswordVisibilityAgain}
          >
            <span
              className="material-symbols-outlined"
              style={{ maxWidth: "20px" }}
            >
              {showPasswordAgain ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>
      {errors.passwordAgain && (
        <div className="error-forms">{errors.passwordAgain}</div>
      )}
      <div className="register-form-location-container">
        <h3>{t.setStartLocationInfo}</h3>
        <LocationMap onLocationChange={handleLocationChange} />
      </div>

      {otpSent ? (
        isOtpVerified ? (
          <div>
            <img
              src={"/checkCropped.png"}
              alt="check"
              width={100}
              height={100}
            />
          </div>
        ) : (
          <div>
            <h3>{t.otp_sent}</h3>{" "}
            <div className="otp-input-container" onPaste={handlePaste}>
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  type="number"
                  maxLength="1"
                  className={`otp-input ${errors.otp ? "error" : ""}`}
                  value={otp[index] || ""}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  ref={(el) => (otpInputRefs.current[index] = el)} // Aseta ref
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index]) {
                      if (index > 0) {
                        otpInputRefs.current[index - 1]?.focus()
                      }
                    } else if (e.key === "ArrowLeft" && index > 0) {
                      otpInputRefs.current[index - 1]?.focus()
                    } else if (e.key === "ArrowRight" && index < 5) {
                      otpInputRefs.current[index + 1]?.focus()
                    }
                  }}
                />
              ))}
            </div>
            <div
              className="resend-otp-container"
            >
              {loader && <div className="loader"></div>}
              {canResendOtp && resendCooldown === 0 ? (
                // Jos uudelleenlähetys on sallittu JA cooldown on nolla, näytä nappi:
                <button
                  onClick={handleResendOtp}
                  className="btn"
                  type="button"
                >
                  {t.resend_otp || "Lähetä koodi uudelleen"}
                </button>
              ) : (
                <p className="btn-link-otp">
                  {t.can_resend_in}{" "}
                  {resendCooldown} {t.seconds}
                </p>
              )}
            </div>
          </div>
        )
      ) : (
        <div className='send-otp-container'>
          <h3>{t.opt_robot_check}</h3>
          <h4>{t.otp_insert}</h4>
          {loader ? (
            <div className="loader"></div>
          ) : (
            <button
              onClick={sendOtp}
              disabled={email === "" ? true : false}
              className="btn"
            >
              {t.send}
            </button>
          )}
        </div>
      )}
      {errors.otp && <div className="error-forms">{errors.otp}</div>}
      <div className="terms-container">
        {`${t.terms_of_service_accept}`}&nbsp;
        <Link to="/termsOfService" target="_blank">
          {t.terms_of_service_accept_terms}
        </Link>
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
      </div>
      {errors.terms && <div className="error-forms">{errors.terms}</div>}

      <button
        className={`forms-btn`}
        disabled={blockRegister}
        onClick={verifyOtp}
      >
        <span>{t.register}</span>
      </button>
    </div>
  )
}

export default RegisterForm
