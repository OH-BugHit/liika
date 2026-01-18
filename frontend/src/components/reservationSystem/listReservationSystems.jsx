import { Link } from "react-router-dom"
import Header from "../header"
import Footer from "../footer"
import { useSelector } from "react-redux"
import translations from "../../assets/translation"
import { useEffect, useState } from 'react'
import reservationService from '../../services/reservationService'
import NotificationContainer from '../notification/notificationContainer'
import "./reservationSystem.css"

const ListReservationSystems = () => {
    const language = useSelector((state) => state.language.language)
    const userID = useSelector((state) => state.user?.user?.userID ?? null)
    const storedToken = useSelector((state) => state.user?.user?.token ?? null)
    const t = translations[language]
    const clubs = useSelector((state) => state.user?.user?.clubs ?? null)
    const [loading, setLoading] = useState(true)
    const [reservationSystems, setReservationSystems] = useState(null)

    useEffect(() => {
        const fetchEventInfo = async () => {
            try {
                const response = await reservationService.getReservationSystems(storedToken, {
                    clubs: clubs,
                    userID: userID,
                })
                console.log(response)
                const clubIds = clubs.map((club) => club.ClubID) // Tehdään taulukko clubIDitä
                const groupedSystems = clubIds.map((clubId) => {
                    const club = clubs.find((c) => c.ClubID === clubId)
                    return {
                        club: {
                            ClubID: clubId,
                            clubName: club?.Name || "Tuntematon klubi",
                        },
                        systems: response.filter((system) => system.ClubID === clubId),
                    }
                })
                console.log(groupedSystems)
                setReservationSystems(groupedSystems)
            } catch (error) {
                console.error(error)
                // TODO: dispatch kun ei löydy varausjärjestelmää
            } finally {
                setLoading(false)
            }
        }
        fetchEventInfo()
    }, [clubs, storedToken, userID])

    if (loading) {
        // Tietokantahaku kesken
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
                <NotificationContainer />
                <div className="event-view">
                    <p>{t.loading_event}</p>
                </div>
                <Footer />
            </div>
        )
    }

    if (!reservationSystems) {
        // Jos kenttävarausjärjestelmää ei löytynyt tietokantahaulla
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
                <div className="event-view">
                    <p>{"No reservation systems found!"}</p>
                    <Link to={"/create_reservation_system"} className="link-btn">
                        {"Luo kenttävarausjärjestelmä"}
                    </Link>
                </div>
                <Footer />
            </div>
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
            <NotificationContainer />
            <div className='about-container'>
                {reservationSystems && reservationSystems.map((club) => (
                    <div key={club.club.ClubID} className="event-container">
                        <div className="spacer-line"></div>
                        <h1>{club.club.clubName}</h1>
                        <div className="event-list-items">
                            {club.systems.length === 0 ? (
                                <p>{t.no_upcoming_events}</p>
                            ) : (
                                club.systems.map((system) => (
                                    <Link
                                        to={`/partner/modify/system/${system.SystemID}`}
                                        key={system.SystemID}
                                        className="system-item-container"
                                    >
                                        <div className="event-item">
                                            <div>
                                                <em>{club.club.clubName}</em>
                                                <h3>{t.title}</h3>
                                                {system.Title}
                                            </div>
                                        </div>

                                    </Link>
                                ))
                            )}
                        </div>
                        {club.systems.map((system) => {
                            { console.log(system.Title) }
                            <Link>
                                <div key={system.SystemID} className="event-item" >
                                    <h1>{system.Title}</h1>
                                </div>
                            </Link>
                        })}
                        <div className="spacer-line"></div>
                    </div>
                ))}
            </div>
            <Link to={-1} className="back-btn" style={{ alignSelf: "center" }}>
                <span>{t.back}</span>
            </Link>
            <Footer />
        </div>
    )
}

export default ListReservationSystems