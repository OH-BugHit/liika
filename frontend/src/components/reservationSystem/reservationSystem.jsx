import { useEffect, useState } from 'react'
import reservationService from '../../services/reservationService'
import { useSelector } from 'react-redux'
import translations from '../../assets/translation'
import { selectCategoryName } from '../../assets/icons'
import { formatUrl, parseTimeAndDate, translateOn } from '../../utils/helper'
import MiniCalendar from '../../utils/miniCalendar'
import { DayPilot, DayPilotNavigator } from '@daypilot/daypilot-lite-react'
import translationService from '../../services/translationService'

const ReservationSystem = (SystemID) => {
    const language = useSelector((state) => state.language.language)
    const t = translations[language]
    const storedToken = useSelector((state) => state.user?.user?.token ?? null)
    const UserID = useSelector((state) => state.user?.user?.userID ?? null)
    const [loading, setLoading] = useState(true)
    const [system, setSystem] = useState(null)
    const [multiCalendarIsOpen, setMultiCalendarIsOpen] = useState(false)
    const [fieldsIsOpen, setFieldsIsOpen] = useState(false)
    const [openFieldId, setOpenFieldId] = useState(null)
    // DaypilotNavigaattori kalenterikomponenteille
    const [isMobile, setIsMobile] = useState(false)
    const date = new Date()
    const [startDate, setStartDate] = useState(date)
    const [reload, setReload] = useState(false)
    // Käännökset
    const [translateBtnIsDisabled, setTranslateBtnIsDisabled] = useState(false)

    useEffect(() => {
        const fetchEventInfo = async () => {
            try {
                const systemData = await reservationService.getSingleSystem({
                    SystemID: SystemID.id,
                })
                setSystem(systemData)
            } catch (error) {
                console.error(error)
                // TODO Notifikaatio ettei onnistunut
                // vähän niinkuin dispatch(addNotification(EventNotFound(t.event_not_found))) mutta kenttävarausjärjestelmää ei löytynyt
            } finally {
                setLoading(false)
            }
        }
        fetchEventInfo()
    }, [SystemID.id])

    useEffect(() => { // Tällä valitaan käytettävä komponentti näytön koon mukaan
        const checkScreen = () => setIsMobile(window.innerWidth <= 768)
        checkScreen() // tarkistetaan alussa näytön koko
        window.addEventListener("resize", checkScreen)
        return () => window.removeEventListener("resize", checkScreen)
    }, [])

    // Yksittäisen kentän painallus. Jos painetaan uudelleen nii tulee null.
    const handleFieldClick = (field) => {
        setOpenFieldId((prevId) => (prevId === field.FieldID ? null : field.FieldID))
    }

    const toggleMultiCalendar = () => {
        setMultiCalendarIsOpen((prev) => !prev)
        //setDisableCreateField(false)
    }

    const toggleFields = () => {
        setFieldsIsOpen((prev) => !prev)
        //setDisableCreateField(false)
    }

    // Sivupainikkeen painalluksella siirretään kalenterinäkymiä viikolla eteenpäin
    const handleNextWeek = () => {
        if (isMobile) {
            if (startDate instanceof DayPilot.Date) {
                setStartDate(startDate.addDays(1))
            } else {
                setStartDate(startDate.setDate(startDate.getDate() + 1))
                setReload((prev) => !prev)
            }
        } else {
            if (startDate instanceof DayPilot.Date) {
                setStartDate(startDate.addDays(7))
            } else {
                setStartDate(startDate.setDate(startDate.getDate() + 7))
                setReload((prev) => !prev)
            }
        }
    }

    // Sivupainikkeen painalluksella siirretään kalenterinäkymiä viikolla taaksepäin
    const handlePrevWeek = () => {
        if (isMobile) {
            if (startDate instanceof DayPilot.Date) {
                setStartDate(startDate.addDays(-1))
            } else {
                setStartDate(startDate.setDate(startDate.getDate() - 1))
                setReload((prev) => !prev)
            }
        } else {
            if (startDate instanceof DayPilot.Date) {
                setStartDate(startDate.addDays(-7))
            } else {
                setStartDate(startDate.setDate(startDate.getDate() - 7))
                setReload((prev) => !prev)
            }
        }
    }

    const categoryImages = (field) => {
        return (
            field.FieldCategories.map((category) => (
                <div key={category.CategoryID}>
                    <img src={`/lajit/${selectCategoryName(category.CategoryID)}.png`}
                        width={100}
                        height={100}
                    />
                </div>
            ))
        )
    }

    const handleTranslate = async () => {
        setTranslateBtnIsDisabled(true)

        // Luodaan inputObject ja annetaan sille helpot avainarvoparit
        const inputObject = {
            systemDescription: system.Description,
        }
        // Sitten annetaan dynaamiset avain-arvoparit
        system.Fields.forEach((field, index) => {
            inputObject[`field_${index}`] = field.Description
        })
        let toLanguage = "en"
        switch (language) { // Lisää tänne kieliä kun niitä tulee valintoihin
            case "EN":
                toLanguage = "en"
                break
            default:
                toLanguage = "en" // fallback
        }
        try {
            const translated = await translationService.getTranslations(storedToken, {
                UserID,
                inputObject,
                toLanguage
            })
            // Päivitetään system olio uusilla käännöksillä
            const translatedSystem = {
                ...system,
                Description: translated.systemDescription,
                Fields: system.Fields.map((field, index) => ({
                    ...field,
                    Description: translated[`field_${index}`] || field.Description
                }))
            }
            // Asetetaan käännökset näkyville
            setSystem(translatedSystem)
        } catch (e) {
            console.error("Error with translation", e) // TODO: Notify epäonnistumisesta
            setTranslateBtnIsDisabled(false)
        }
    }

    const selectSelectMode = () => {
        if (isMobile) return "Day"
        return "Week"
    }

    /**
     * 
     * @param {kenttävarausjärjestelmä} system 
     * @returns Näyttää kenttien varauskalenterit alekkain, navigointi sivupainikkeella tai kalenterilla
     */
    const multiCalendar = (system) => {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "anchor-center", flexWrap: "wrap" }}>
                <DayPilotNavigator
                    selectMode={selectSelectMode()}
                    showMonths={1}
                    skipMonths={1}
                    selectionDay={startDate}
                    weekStarts={1}
                    onTimeRangeSelected={(args) => {
                        setStartDate(args.day)
                        setReload((prev) => !prev)
                    }}
                />
                <div className='field-calendar-container'>
                    <div className='field-calendar-navigation'>
                        <button className='field-calendar-navigation-button' onClick={handleNextWeek}>{<img
                            src="/weekArrowRight.png"
                            alt="Logo"
                            width={60}
                            height={60}
                            className="event-view-icon"
                        />}</button>
                        <button className='field-calendar-navigation-button' onClick={handlePrevWeek}>{<img
                            src="/weekArrowLeft.png"
                            alt="Logo"
                            width={60}
                            height={60}
                            className="event-view-icon"
                        />}</button>
                    </div>
                    <div>
                        {system.Fields.map((field) => (
                            <div
                                key={field.FieldID}
                                className="system-item-container"
                            >
                                <div className="system-item">
                                    <div>
                                        <div className='field-category-container'>
                                            {categoryImages(field)}
                                        </div>
                                        <h3>{field.Name}</h3>
                                        <p style={{ textAlign: "left", marginBottom: "10px", whiteSpace: 'pre-line' }}>{field.Description}</p>
                                    </div>
                                    {isMobile ? <MiniCalendar field={field} reload={reload} startDate={startDate} isMobile={true} /> : <MiniCalendar field={field} reload={reload} startDate={startDate} isMobile={false} />}
                                    {field.URL && <div style={{ marginTop: "8px" }}><em>{t.bookAt}: </em> <a href={`${formatUrl(field.URL)}`} style={{ wordBreak: "break-all" }} target="_blank"
                                        rel="noopener">{formatUrl(field.URL)}</a></div>}
                                </div>
                                <div className="system-item">

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const fields = (system) => {
        return (
            <div>
                {system.Fields.map((field) => (
                    <div
                        key={field.FieldID}
                        className="system-view-item-container"
                    >
                        <div className="system-view-item" style={{ display: "flex", flexDirection: "column" }}>
                            <div className='field-category-container'>
                                {categoryImages(field)}
                            </div>
                            <h3>{field.Name}</h3>
                            <p style={{ textAlign: "left", marginBottom: "10px", whiteSpace: 'pre-line' }}>{field.Description}</p>
                        </div>
                        {openFieldId === field.FieldID && (
                            <button onClick={() => handleFieldClick(field)} className='btn'>
                                {t.close}
                            </button>
                        )}
                        {openFieldId === field.FieldID && (
                            <div>
                                <div style={{ display: "flex", alignItems: "anchor-center", flexDirection: "row", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                                    <DayPilotNavigator
                                        selectMode={selectSelectMode()}
                                        showMonths={1}
                                        showWeekNumbers={true}
                                        skipMonths={1}
                                        selectionDay={startDate}
                                        weekStarts={1}
                                        onTimeRangeSelected={(args) => {
                                            setStartDate(args.day)
                                            setReload((prev) => !prev)
                                        }}
                                    />
                                    {isMobile ? <MiniCalendar field={field} reload={reload} startDate={startDate} isMobile={true} /> : <MiniCalendar field={field} reload={reload} startDate={startDate} isMobile={false} />}
                                </div>
                                {field.URL && <div style={{ marginTop: "8px" }}><em>{t.bookAt}: </em> <a href={`${formatUrl(field.URL)}`} style={{ wordBreak: "break-all" }} target="_blank"
                                    rel="noopener">{formatUrl(field.URL)}</a></div>}
                            </div>
                        )}
                        {openFieldId !== field.FieldID && (
                            <button onClick={() => handleFieldClick(field)} className='btn'>
                                {t.open}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    if (loading) {
        // Tietokantahaku kesken
        return (
            <div className="event-view">
                <p>{t.loading_event}</p>
            </div>
        )
    }

    if (!system) {
        // Jos kenttävarausjärjestelmää ei löytynyt tietokantahaulla
        return (

            <div className="event-view">
                <p>{t.reservationSystemLoadFailed}</p>
            </div>
        )
    }


    return (
        <div className='event-view'>
            {UserID && translateOn(language) && <div className='translate-btn-container-top-right'> {/*Käännöksen tuottamisen painike*/}
                <button className='translate-btn' onClick={handleTranslate} disabled={translateBtnIsDisabled} >Translate</button>
            </div>}
            <h1>{system.Title}</h1>
            {system.Rental ? (<div style={{
                display: "flex",
                alignItems: "anchor-center"
            }}>{t.rentalAvailable} {<img
                src={`/rentalEquipmentAvailable.png`}
                alt="Logo"
                width={100}
                height={100}
                className="event-view-icon"
            />}</div>) : ("")}
            <div className='spacer-line' />
            <h2>{t.info}</h2>
            <p style={{ maxWidth: "80%", whiteSpace: 'pre-line' }}>{system.Description}</p>
            <div className='spacer-line' />
            <h2>{t.fields}</h2>
            <em style={{ textAlign: "center", maxWidth: "80%" }}>{t.fieldsInfoText}</em>
            <button className='link-btn' onClick={toggleFields}>
                {!fieldsIsOpen && t.showFields}
                {fieldsIsOpen && t.hideFields}
            </button>
            <div className={`system-view-field-panel ${fieldsIsOpen ? "open" : ""}`}>
                <div className="event-list-items">
                    {system.Fields.length === 0 ? (
                        <p>{t.noFieldsToShow}</p>
                    ) : (
                        fields(system)
                    )}
                </div>
            </div>
            <button className='link-btn' onClick={toggleMultiCalendar}>
                {!multiCalendarIsOpen && t.openFieldCalendars}
                {multiCalendarIsOpen && t.closeFieldCalendars}
            </button>
            <div className={`field-calendar-panel ${multiCalendarIsOpen ? "open" : ""}`}>

                <div className="event-list-items">
                    {system.Fields.length === 0 ? (
                        <p>{t.noFieldsToShow}</p>
                    ) : (
                        multiCalendar(system)
                    )}
                </div>
            </div>
            <em style={{ fontWeight: "lighter" }}>{t.lastUpdated} {" "}
                {parseTimeAndDate(system.updatedAt)[1]}{" "}
                {parseTimeAndDate(system.updatedAt)[0]}
            </em>
        </div>
    )
}

export default ReservationSystem