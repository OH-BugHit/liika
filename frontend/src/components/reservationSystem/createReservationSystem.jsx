import { useDispatch, useSelector } from 'react-redux'
import translations from '../../assets/translation'
import Header from '../header'
import NotificationContainer from '../notification/notificationContainer'
import Footer from '../footer'
import { useState } from 'react'
import { selectCategoryName } from '../../assets/icons'
import reservationService from '../../services/reservationService'
import { Link } from 'react-router-dom'
import LocationMap from '../../utils/locationMap'

const CreateReservationSystem = () => {
    const language = useSelector((state) => state.language.language)
    const t = translations[language]
    const clubs = useSelector((state) => state.user?.user?.clubs ?? null)
    const categories = useSelector((state) => state.categories.categories)
    const userID = useSelector((state) => state.user?.user?.userID ?? null)
    const storedToken = useSelector((state) => state.user?.user?.token ?? null)
    const [selectedClub, setSelectedClub] = useState(null)
    const [errors, setErrors] = useState({})
    const [event_location, setEventLocation] = useState("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [popUpText, setPopUpText] = useState("")
    const [rentalAvailable, setRentalAvailable] = useState(false)
    const [disable, setDisabled] = useState(false)
    const [created, setCreated] = useState(false) // True kun varausjärjestelmä luotu
    // eslint-disable-next-line no-unused-vars
    const dispatch = useDispatch()
    const [reservationSystemID, setReservationSystemID] = useState(null)

    const options = () => {
        try {
            return categories.map((cat) => ({
                value: cat.CategoryID,
                label: t[selectCategoryName([cat.CategoryID])],
            }))
        } catch (error) {
            console.log(error)
        }
    }

    const handleClubSelect = (clubId) => {
        setSelectedClub(clubId)
    }

    const handleLocationChange = (newLocation) => {
        setEventLocation(newLocation)
    }

    const handleChangeEquipment = (event) => {
        setRentalAvailable(event.target.checked)
    }

    const clubEventView = () => {
        if (clubs[0]) {
            return (
                <div className="form-item">
                    <div className="club-selection-container">
                        <h2>{"Valitse kentän hallinnoitsija"}:</h2>
                        {clubs.map((club) => (
                            <label key={club.ClubID} className="club-radio-item">
                                <input
                                    type="radio"
                                    name="club"
                                    value={club.ClubID}
                                    checked={selectedClub === club.ClubID}
                                    onChange={() => handleClubSelect(club.ClubID)}
                                />
                                {club.Name}
                            </label>
                        ))}
                    </div>
                </div>
            )
        } else return null
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setDisabled(true)
        const clubID = selectedClub
        setErrors({})
        try {
            const response = await reservationService.createReservationSystem(storedToken, {
                title,
                popUpText,
                event_location,
                description,
                rentalAvailable,
                clubID,
                userID,
            })
            if (response.status === 201) {
                // uusi kenttävarausjärjestelmä luotu

                setReservationSystemID(response.data.SystemID)
                setCreated(true)
            }
        } catch (error) {
            console.error(error)
            // TODO: TEE ERRORI
            setDisabled(false)
        }
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
            <NotificationContainer />
            <div className="create-event">
                <h1>Luo kenttävarausjärjestelmä</h1>
                <div className="create-event-form">
                    <form onSubmit={handleSubmit}>
                        {clubEventView()}
                        <div className="form-item">
                            <h3>{t.title}</h3>
                            <input
                                type="text"
                                value={title}
                                placeholder={t.title}
                                className={`input-field ${errors.title ? "error" : ""}`}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={disable}
                            />
                        </div>
                        {errors.title && <div className="error-forms">{errors.title}</div>}
                        <div className="form-item">
                            <h3>{"Pop-up teksti"}</h3> {/*TODO: Kovakoodaukset*/}
                            <textarea
                                type="text"
                                value={popUpText}
                                name="popUpText"
                                className={`input-field ${errors.popUpText ? "error" : ""}`}
                                onChange={(e) => setPopUpText(e.target.value)}
                                placeholder={"Kartan esikatseluikkunan teksti (max 200 merkkiä)"}
                                disabled={disable}
                            /> {/*TODO: Kovakoodaukset*/}
                        </div>
                        <div className="form-item">
                            <h3>{t.setEventLocationInfo}</h3>
                            <LocationMap onLocationChange={handleLocationChange} />
                        </div>
                        <div className="form-item">
                            <h3>{t.description}</h3>
                            <textarea
                                type="description"
                                value={description}
                                name="description"
                                className={`input-field ${errors.description ? "error" : ""}`}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={"Lyhyt kuvaus vuokraajasta / paikasta"}
                                disabled={disable}
                            />
                        </div>
                        {errors.description && (
                            <div className="error-forms">{errors.description}</div>
                        )}
                        <div className="form-item">
                            <label>
                                <h3>Tarjolla varusteiden vuokrausta</h3>
                                <input
                                    type="checkbox"
                                    className={`input-field ${errors.categoryID ? "error" : ""}`}
                                    checked={rentalAvailable}
                                    onChange={handleChangeEquipment}
                                    disabled={disable}
                                />
                            </label>
                        </div>
                        <button
                            className={`forms-btn`}
                            onClick={handleSubmit}
                            disabled={disable}
                        >
                            <span>{"Luo kenttävarausjärjestelmä"}</span> {/*TODO: Kovakoodaukset*/}
                        </button>
                    </form>
                    {created &&
                        <Link
                            to={`/partner/modify/system/${reservationSystemID}`}
                            className={`forms-btn`}
                        >Siirry lisäämään kenttiä</Link>
                    }
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default CreateReservationSystem