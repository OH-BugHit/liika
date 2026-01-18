import { Link } from "react-router-dom"
import Header from "../header"
import Footer from "../footer"
import { useSelector } from "react-redux"
import translations from "../../assets/translation"
import "./about.css"

const AboutView = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]

  const linkedInLink = (osoite) => {
    return (
      <a href={`https://www.linkedin.com/in/${osoite}/`} target="_blank" rel="noopener noreferrer">
        <img
          src="InBug-blue.png"
          alt="LinkedIn"
          width="23"
          height="20"
        />
      </a>
    )
  }

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
      <div className='about-container'>
        <div className="about-text-box">
          <h1>Liika</h1>
          <p style={{ marginTop: "20px" }}>
            {t.about_us_text}<br />
            {t.about_us_text_2}
          </p>
          <h1 style={{ marginTop: "30px" }}>{t.contact_info}</h1>
          <div style={{ marginTop: "20px" }} >
            <div className='about-item'><p>Olli Hilke {linkedInLink("ollihi")}</p>{emailLink("h.illo@hotmail.com")} </div>
            <div className='about-item'><p>Tomi Leminen  {linkedInLink("tomi-leminen-8244a0263")}</p>{emailLink("tomppa600@gmail.com")}</div>
            <div className='about-item'><p>Elmeri Saurus {linkedInLink("elmeri-saurus-458635214")}</p>{emailLink("elmerisaurus25@gmail.com")}</div>
            <div className='about-item'><p>Annakaisa Turunen {linkedInLink("annakaisa-turunen-024a64348")}</p>{emailLink("turunenannakaisa@gmail.com")}</div>
            <div className='about-item'><p>Annukka Mäkinen {linkedInLink("annukka-mäkinen-5344422b1")}</p>{emailLink("annuma@uef.fi")}</div>
            <div className='about-item'><p>Paulus Ollikainen {linkedInLink("paulus-ollikainen-5a0b12351")}</p>{emailLink("paulus.ollikainen@gmail.com")}</div>
          </div>
        </div>
      </div>
      <Link to={'/'} className="back-btn" style={{ alignSelf: "center" }}>
        <span>{t.back}</span>
      </Link>
      <Footer />
    </div>
  )

  function emailLink(osoite) {
    return <a href={`mailto:${osoite}`}>{osoite}</a>
  }
}

export default AboutView