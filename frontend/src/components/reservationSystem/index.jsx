import { Link, useParams } from "react-router-dom"
import Header from "../header"
import Footer from "../footer"
import { useSelector } from "react-redux"
import translations from "../../assets/translation"
import ReservationSystem from './reservationSystem'

const ReservationSystemView = () => {
    const language = useSelector((state) => state.language.language)
    const t = translations[language]
    const { id } = useParams()

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
            <ReservationSystem id={id} />
            <Link to={-1} className="back-btn" style={{ alignSelf: "center" }}>
                <span>{t.back}</span>
            </Link>
            <Footer />
        </div>
    )
}

export default ReservationSystemView
