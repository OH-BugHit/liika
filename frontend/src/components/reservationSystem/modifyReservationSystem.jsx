import { Link, useParams } from "react-router-dom"
import Select from "react-select"
import Header from "../header"
import Footer from "../footer"
import { useSelector } from "react-redux"
import translations from "../../assets/translation"
import { useEffect, useState } from 'react'
import reservationService from '../../services/reservationService'
import NotificationContainer from '../notification/notificationContainer'
import LocationMap from '../../utils/locationMap'
import { selectCategoryName } from '../../assets/icons'

const ModifyReservationSystemView = () => {
    const { id } = useParams()
    const language = useSelector((state) => state.language.language)
    const storedToken = useSelector((state) => state.user?.user?.token ?? null)
    const userID = useSelector((state) => state.user?.user?.userID ?? null)
    const categories = useSelector((state) => state.categories?.categories ?? {})
    const t = translations[language]
    const [loading, setLoading] = useState(true)
    const [modifyRSisOpen, setModifyRSisOpen] = useState(false)
    const [addNewIsOpen, setAddNewIsOpen] = useState(false)
    const [system, setSystem] = useState(null)
    const [errors, setErrors] = useState({})
    // Varausjärjestelmän muokkaus
    const [disableSave, setDisableSave] = useState(true)
    const [description, setDescription] = useState("")
    const [title, setTitle] = useState("")
    const [popUpText, setPopUpText] = useState("")
    const [rentalAvailable, setRentalAvailable] = useState(null)
    const [establishment_location, setEstablishmentLocation] = useState(null)
    // Kentät
    const [fields, setFields] = useState([])
    // Kentän lisäyksen kentät
    const [activity, setActivity] = useState({})
    const [disableCreateField, setDisableCreateField] = useState(true)
    const [fieldName, setFieldName] = useState("")
    const [fieldDescription, setFieldDescription] = useState("")
    const [fieldCategories, setFieldCategories] = useState([])
    const [liikaAvailable, setLiikaAvailable] = useState(true)
    const [link, setLink] = useState("")
    const [reload, setReload] = useState(false)

    useEffect(() => {
        const fetchSystemData = async () => {
            try {
                // Haetaan kenttävarausjärjestelmän tiedot
                const response = await reservationService.getReservationSystem(storedToken, { // Haetaan kenttävarausjärjestelmän tiedot
                    SystemID: id,
                    userID: userID,
                })
                setSystem(response)
                setRentalAvailable(response.Rental)
                // Haetaan järjestelmään kuuluvat kentät
                const getFields = await reservationService.getFields(storedToken, {
                    SystemID: id,
                    userID: userID,
                })
                setFields(getFields)
                setAddNewIsOpen(false)
                setPopUpText("")
                setDescription("")
                setTitle("")
                // TODO: Tee notifikaatio, että tietojen päivitys onnistui
            } catch (error) {
                console.error(error)
                // TODO: dispatch kun ei löydy varausjärjestelmää
            } finally {
                setLoading(false)
            }
        }
        fetchSystemData()
    }, [id, reload, storedToken, t, userID])

    const handleTitleChange = (value) => {
        setTitle(value)
        setDisableSave(false)
    }

    const handlePopUpChange = (value) => {
        setPopUpText(value)
        setDisableSave(false)
    }

    const handleDescriptionChange = (value) => {
        setDescription(value)
        setDisableSave(false)
    }

    const handleChangeEquipment = (event) => {
        setRentalAvailable(event.target.checked)
        setDisableSave(false)
    }

    const handleChangeLiika = (event) => {
        setLiikaAvailable(event.target.checked)
    }

    const handleLocationChange = (newLocation) => {
        setEstablishmentLocation(newLocation)
        setDisableSave(false)
    }

    const toggleAddNew = () => {
        setAddNewIsOpen((prev) => !prev)
        setDisableCreateField(false)
    }

    const toggleModify = () => {
        setModifyRSisOpen((prev) => !prev)
        setDisableSave(false)
    }

    const currentActivities = () => {
        return (
            fieldCategories.map((cat) => (
                <div
                    key={cat.value}
                    style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
                    <p>{`${cat.label}`}</p>
                    <button className='btn' onClick={() => removeFromActivities(cat)}>X</button>
                </div>))
        )
    }

    // Lajin valinnan handleri
    const handleChange = (selectedOption) => {
        setActivity(selectedOption)
    }

    // Vaihtoehdot lajeille
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


    // Lisätään uusi laji kentälle
    const handleAddActivity = () => {
        if (Object.keys(activity).length === 0) return
        if (fieldCategories.some(item => item.value === activity.value)) return // Ei anneta lisätä uudelleen
        setFieldCategories((prev) => [...prev, activity])
    }

    // Poistetaan laji kentältä
    const removeFromActivities = (toRemove) => {
        setFieldCategories((prev) =>
            prev.filter(
                (cat) => cat.value !== toRemove.value
            )
        )
    }

    const handleNewField = async () => {
        setDisableCreateField(true)

        const fieldActivities = fieldCategories.map((cat) => cat.value)
        try {
            const response = await reservationService.createField(storedToken, {
                userID: userID,
                Name: fieldName,
                Description: fieldDescription,
                Liika: liikaAvailable,
                URL: link,
                SystemID: id,
                ClubID: system.ClubID,
                fieldCategories: fieldActivities,
                Opening_Hours: {
                    mon: { open: "", close: "", closed: false },
                    tue: { open: "", close: "", closed: false },
                    wed: { open: "", close: "", closed: false },
                    thu: { open: "", close: "", closed: false },
                    fri: { open: "", close: "", closed: false },
                    sat: { open: "", close: "", closed: false },
                    sun: { open: "", close: "", closed: false }
                },
            })
            setReload((prev) => !prev)
        } catch (error) {
            console.error(error)
        }
    }

    const handleSaveChanges = async () => {
        setDisableSave(true)
        const updatedtitle = title || system.Title
        const updatedDescription = description || system.Description
        const updatedPopUpText = popUpText || system.PopUpText

        try {
            await reservationService.modifyRS(storedToken, {
                UserID: userID,
                Title: updatedtitle,
                Establishment_Location: establishment_location,
                Description: updatedDescription,
                Rental: rentalAvailable,
                PopUpText: updatedPopUpText,
                SystemID: id,
                ClubID: system.ClubID
            })
            setFieldDescription("")
            setFieldName("")
            setLink("")
            setReload((prev) => !prev)
            setModifyRSisOpen(false)
        } catch (error) {
            console.error(error)
        }
    }

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

    if (!system) {
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
                    <p>{"No reservation system found"}</p>
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
                <div className="system-modify-item">
                    <h1>{"Kenttävarausjärjestelmän muokkaus"}</h1>
                    <p>
                        {"Muokkaa blaa blaa..."}
                        <br />
                        {t.exitWithoutSave}
                    </p>
                </div>
                <div className='system-modify-item'>
                    <span className="spacer-line"></span>
                    <h1>Kenttävarausjärjestelmä</h1> <em>{system.Title}</em>
                    <button className='link-btn' onClick={toggleModify}>
                        {!modifyRSisOpen && "Muokkaa kenttävarausjärjestelmää"} {/*TODO: Paljon kovakoodauksia (kielellistä)*/}
                        {modifyRSisOpen && "Sulje muokkaus"}
                    </button>
                    <div className={`add-new-panel ${modifyRSisOpen ? "open" : ""}`}>
                        <div className='system-modify-item'>
                            <h2>{t.currentTitle}</h2>
                            <h1>{system.Title}</h1>
                            <h2>{t.newTitle}</h2>
                            <input
                                type="text"
                                value={title}
                                placeholder={`${system.Title}`}
                                className="input-field"
                                onChange={(e) => handleTitleChange(e.target.value)}
                                required={true}
                            />
                        </div>
                        <span className="spacer-line"></span>
                        <div className='system-modify-item'>
                            <h2>{"Nykyinen kuvaus"}</h2>
                            <p style={{ textAlign: "left", marginBottom: "10px", whiteSpace: 'pre-line' }}>{system.Description}</p>
                            <h2>{"Uusi kuvaus"}</h2>
                            <textarea
                                type="text"
                                value={description}
                                placeholder={`anna kuvaus sijainnille`}
                                className="input-field"
                                onChange={(e) => handleDescriptionChange(e.target.value)}
                                required={true}
                            />
                        </div>
                        <span className="spacer-line"></span>
                        <div className='system-modify-item'>
                            <h2>{"Nykyinen Pop-up mainosteksti"}</h2>
                            <p>{system.PopUpText}</p>
                            <h2>{"Uusi Pop-up mainosteksti"}</h2>
                            <textarea
                                type="text"
                                value={popUpText}
                                placeholder={`${system.PopUpText}`}
                                className="input-field"
                                onChange={(e) => handlePopUpChange(e.target.value)}
                                required={true}
                            />
                        </div>
                        <span className="spacer-line"></span>
                        <div className='system-modify-item'>
                            <h2>{"Välinevuokrausta tarjolla"}</h2>
                            <input
                                type="checkbox"
                                checked={rentalAvailable}
                                placeholder={`${system.PopUpText}`}
                                className="input-field"
                                onChange={handleChangeEquipment}
                            />
                        </div>
                        <span className="spacer-line"></span>
                        <div className='system-modify-item'>
                            <h2>{t.location}</h2>
                            <LocationMap
                                onLocationChange={handleLocationChange}
                                oldLocation={[
                                    system.Establishment_Location.coordinates[0],
                                    system.Establishment_Location.coordinates[1],
                                ]}
                            />
                        </div>
                        <span className="spacer-line"></span>
                        <button className='forms-btn' style={{ marginBottom: "40px" }} onClick={handleSaveChanges} disabled={disableSave}>
                            Tallenna muutokset
                        </button>
                    </div>
                    <span className="spacer-line"></span>
                </div>
                <div className='system-modify-item'>
                    <h1>{"Kentät"}</h1>
                    <div className='field-btn-container'>
                        {fields.length === 0 ? (
                            <p>{"Ei vielä kenttiä. Lisää uusi kenttä alta"}</p>
                        ) : (
                            fields.map((field) => (
                                <Link
                                    to={`/partner/modify/field/${field.FieldID}`}
                                    key={field.FieldID}
                                    className="system-item-container"
                                >
                                    <div className="event-item">
                                        <div>
                                            <em>{field.Name}</em>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                    <span className="spacer-line"></span>
                    <h1>Lisää uusi kenttä</h1>
                    <button className='link-btn' onClick={toggleAddNew}>
                        {!addNewIsOpen && "Lisää uusi kenttä"}
                        {addNewIsOpen && "Sulje"}
                    </button>
                    <div className={`add-new-panel ${addNewIsOpen ? "open" : ""}`}>
                        <div className='system-modify-item'>
                            <h2>{"Kentän nimi"}</h2>
                            <input
                                type="text"
                                value={fieldName}
                                placeholder={`kentän nimi`}
                                className="input-field"
                                onChange={(e) => setFieldName(e.target.value)}
                                required={true}
                            />
                            <em>Anna kentän nimi, max 60 merkkiä</em>
                        </div>
                        <span className="spacer-line"></span>
                        <div className='system-modify-item'>
                            <h2>{"Kentän kuvaus / käyttöehdot"}</h2>
                            <textarea
                                type="text"
                                value={fieldDescription}
                                placeholder={`...\n...\n...\n...`}
                                className="input-field"
                                onChange={(e) => setFieldDescription(e.target.value)}
                                required={true}
                                style={{ minHeight: "100px", textAlign: "left" }}
                            />
                            <em>Voit kirjoittaa tähän esimerkiksi kenttään liittyviä erityispiirteitä ja käyttöehtoja. Maksimipituus 1700 merkkiä</em>
                        </div>
                        <span className="spacer-line"></span>
                        <div className='system-modify-item'>
                            <h2>{"Kentän laji / lajit"}</h2>
                            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: "40px" }}>
                                {currentActivities()}
                            </div>
                            <Select
                                className={`input-field ${errors.categoryID ? "error" : ""}`}
                                placeholder={t.activity}
                                value={activity}
                                onChange={handleChange}
                                options={options()}
                                isSearchable={true}
                            />
                            <button className='btn' onClick={handleAddActivity}>Lisää laji</button>
                            <span className="spacer-line"></span>
                            <h2>{"Liikavuoromahdollisuus"}</h2>
                            <input
                                type="checkbox"
                                checked={liikaAvailable}
                                className="input-field"
                                onChange={handleChangeLiika}
                            />
                            <em>Tämän merkinnän avulla käyttäjät näkevät, että kyseisellä kentällä saattaa olla tarjolla Liika-vuoroja. Merkitseminen ei velvoita järjestämään Liika-vuoroja. Merkki on tarkoitettu helpottamaan käyttäjiä Liika-vuorojen etsimisessä.</em>
                        </div>
                        <span className="spacer-line"></span>
                        <div className='system-modify-item'>
                            <h2>{"Oman varausjärjestelmän linkki"}</h2>
                            <textarea
                                type="text"
                                value={link}
                                placeholder={`https://...`}
                                className="input-field"
                                onChange={(e) => setLink(e.target.value)}
                                required={true}
                            />
                        </div>
                        <span className="spacer-line"></span>
                        <button className='forms-btn' style={{ marginBottom: "40px" }} onClick={handleNewField} disabled={disableCreateField}>
                            Luo kenttä
                        </button>
                    </div>
                </div>
            </div>
            <Link to={-1} className="back-btn" style={{ alignSelf: "center" }}>
                <span>{t.back}</span>
            </Link>
            <Footer />
        </div>
    )
}

export default ModifyReservationSystemView