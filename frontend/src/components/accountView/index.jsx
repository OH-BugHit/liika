import { useEffect, useState } from "react"
import Footer from "../footer"
import Header from "../header"
import "./accountView.css"
import userService from "../../services/userService"
import { useDispatch, useSelector } from "react-redux"
import { changeUser } from "../../store/userSlice"
import { Link } from "react-router-dom"
import "../../index.css"
import translations from "../../assets/translation"
import registerService from "../../services/registerService"
import NotificationContainer from "../notification/notificationContainer"

const AccountView = () => {
  const [user, setUser] = useState(null)
  const userID = useSelector((state) => state.user?.user?.userID ?? null)
  const dispatch = useDispatch()
  const language = useSelector((state) => state.language.language)
  const t = translations[language]
  const storedToken = useSelector((state) => state.user?.user?.token ?? null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userID || !storedToken) return // Ei tehdä pyyntöä jos userID ei ole saatavilla
      try {
        const response = await userService.getUserData(storedToken, userID)

        if (!response) {
          console.error("Response tyhjä")
          return
        }
        const email = response.Email
        dispatch(changeUser(email))
        setUser(response)
      } catch (error) {
        console.error("Virhe hakiessa yksittäisen käyttäjän tietoja: " + error)
      }
    }
    fetchUserInfo()
  }, [userID, dispatch, storedToken]) // Suoritetaan vain kun userID muuttuu

  const handleDeleteClick = async () => {
    const isConfirmed = window.confirm(
      "🔴Käyttäjätilin poistaminen poistaa myös kaikki tapahtumasi.⚠️\n🔴Haluatko varmasti poistaa käyttäjätilin? ⚠️"
    )
    if (isConfirmed) {
      const userInput = window.prompt(
        "🔴Syötä käyttäjänimi vahvistaaksesi poiston: ⚠️"
      )
      if (userInput === user.user.Username) {
        try {
          console.log(user.user.UserID)
          const response = await registerService.unregister(storedToken, {
            UserID: user.user.UserID,
          })
          console.log(response)
          alert(
            "Käyttäjätilisi poistettu. Muista, että voit aina rekisteröityä uudelleen!"
          )
          localStorage.clear()
          window.location.href = "/"
        } catch (e) {
          console.error(e)
          alert("Virhe poistossa, ota yhteyttä liikaservice@gmail.com")
        }
        // Tässä voit suorittaa tilin poistamiseen liittyvät toimenpiteet
      } else {
        alert("Virheellinen käyttäjänimi. Käyttäjätiliä ei poistettu.")
      }
    }
  }

  if (!user) {
    // Tietokantahaku kesken
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
        <NotificationContainer/>
        <div className="account-view">
          <p>Lataa...</p>
        </div>
        <Footer />
      </div>
    )
  }
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
      <div className="account-view">
        <h1>{t.accountInformation}</h1>
        <div className="spacer-line" />
        <div className="information-row">
          <div className="information">
            <h3>{t.email} </h3>
            {user.user.Email}
          </div>
          <div className="information">
            <Link to={`/own_info/email`} className="link-btn">
              {t.change}
            </Link>
          </div>
        </div>
        <div className="spacer-line" />
        <div className="information-row">
          <div className="information">
            <h3>{t.username}</h3>
            {user.user.Username}
          </div>
          <div className="information">
            <Link to={"/own_info/username"} className="link-btn">
              {t.change}
            </Link>
          </div>
        </div>
        <div className="spacer-line" />
        <div className="information-row">
          <div className="information">
            <h3>{t.password} </h3>
            <p>••••••••</p>
          </div>
          <div className="information">
            <Link to={`/own_info/password`} className="link-btn">
              {t.change}
            </Link>
          </div>
        </div>
        <div className="spacer-line" />
        <div className="information-row">
          <div className="information">
            <h3>{t.language} </h3>
            {user.user.LanguageID}
          </div>
          <div className="information">
            <Link to={`/own_info/language`} className="link-btn">
              {t.change}
            </Link>
          </div>
        </div>
        <div className="spacer-line" />
        <div className="information-row">
          <div className="information">
            <h3>{t.changeMapSettings}</h3>
          </div>
          <div className="information">
            <Link to={`/own_info/map`} className="link-btn">
              {t.change}
            </Link>
          </div>
        </div>
        <div className="spacer-line" />
        <div className="information-row">
          <div className="information">
            <h3>Poista käyttäjätili</h3>
          </div>
          <div>
            <button
              className="link-btn delete-account-btn"
              onClick={handleDeleteClick}
            >
              poista käyttäjätili
            </button>
          </div>
          <div className="spacer-line" />
        </div>
      </div>
      <Link to={"/map"} className="back-btn" style={{ alignSelf: "center" }}>
        <span>{t.back}</span>
      </Link>
      <Footer />
    </div>
  )
}

export default AccountView
