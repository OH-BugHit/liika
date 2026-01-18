/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react"
import { categoryMap } from "../../assets/icons"
import DatePicker from "react-multi-date-picker"
import { changeDeviceSettings } from '../../store/deviceSettingsSlice'

const ShortcutButtons = ({ toggleCategory, fetchEvents, t, dispatch, initialSelections, initialShowSystems }) => {
  const [moreIsOpen, setMoreIsOpen] = useState(false)
  const [catIsOpen, setCatIsOpen] = useState(false) // Kategorioiden suoratuksen paneelin näkyvyys
  const [timeIsOpen, setTimeIsOpen] = useState(false) // Aikavälifiltteröinnin paneelin näkyvyys
  const [timeSelectIsOpen, setTimeSelectIsOpen] = useState(false)
  const [selectedQuick, setSelectedQuick] = useState(null)
  const [overflowVisibility, setOverflowVisibility] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState(initialSelections) // Valitut kategoriat
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [dates, setDates] = useState([])
  const [calendarPosition, setCalendarPosition] = useState("top") // Kalenterin avautumissuunta. Muuttuu ikkunan koon mukaan
  const [showReservationSystems, setShowReservationSystems] = useState(initialShowSystems) // Kenttävarausjärjestelmien toggle
  const [searchTerm, setSearchTerm] = useState("") // Hakupalkki kategorialle
  const panelRef = useRef(null)
  const timeInputRef = useRef(null)
  let quickTime = 0

  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < 580) {
        setCalendarPosition("left")
      } else if (window.innerHeight < 830) {
        setCalendarPosition("bottom")
      } else {
        setCalendarPosition("top")
      }
    }

    // Aseta alkuarvo ja kuuntele ikkunan koon muutosta
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // eslint-disable-next-line no-unused-vars
  const filteredCategories = Object.entries(categoryMap).filter(([id, name]) =>
    t[name].toLowerCase().includes(searchTerm.toLowerCase())
  )

  /**
   * Tämä funktio hoitaa aikafiltteröinnin tietojen keräyksen ja pyytää map-komponenttia suorittamaan fetchEvents
   */
  const handleTimeFilterChange = () => {
    let time = {
      dates: dates,
      startTime: startTime,
      endTime: endTime,
      quickTime: quickTime,
    }
    fetchEvents(time)
    setOverflowVisibility(false)
    setTimeIsOpen(false)
  }

  const handleClearTimeFilter = () => {
    setTimeSelectIsOpen(false)
    setDates([])
    setStartTime("")
    setEndTime("")
    setSelectedQuick(null)
    quickTime = 0
    let time = {
      dates: [],
      startTime: "",
      endTime: "",
      quickTime: -1,
    }
    fetchEvents(time)
    setOverflowVisibility(false)
    setTimeIsOpen(false)
  }

  /**
   * Tämä funktio avaa aikasuodatuspaneelin, sulkee samalla muut
   * @param {avattava kalenteri} openCalendar
   */
  const handleCalendarToggle = (openCalendar) => {
    if (moreIsOpen || catIsOpen || timeSelectIsOpen) {
      setCatIsOpen(false)
      setMoreIsOpen(false)
      setTimeSelectIsOpen(false)
      setTimeout(() => openCalendar(), 300) // Avaa kalenteri
    } else {
      quickTime = 0
      setSelectedQuick(null)
      openCalendar()
    }
  }

  const handleEndtimeChange = (e) => {
    setEndTime(e.target.value)
  }
  const handleStarttimeChange = (e) => {
    setStartTime(e.target.value)
  }

  /**
   * Tämä funktio klikkaa ajanvalitsinta. Näin saamme kuvakkeen klikkauksella ajanvalitsimen auki
   */
  const openTimePicker = () => {
    if (timeInputRef.current) {
      timeInputRef.current.click() // Klikkaa inputia, avaa ajanvalitsimen
    }
  }

  /**
   * Ajan pika-rajoittimet
   */
  const handleQuickTime = (button) => {
    if (button === 1) {
      console.log("Halutaan filtteröidä")
      setSelectedQuick(button)
      quickTime = button
      setTimeSelectIsOpen(false)
      handleTimeFilterChange()
    } else {
      setTimeSelectIsOpen(false)
      setDates([])
      setStartTime("")
      setEndTime("")
      setSelectedQuick(button)
      quickTime = button
      handleTimeFilterChange()
    }
  }

  /**
   * Avaa ja sulkee kategoriapaneelia
   */
  const toggleCatPanel = () => {
    setMoreIsOpen(false)
    setTimeIsOpen(false)
    setTimeSelectIsOpen(false)
    setOverflowVisibility(false)
    if (catIsOpen) {
      setCatIsOpen(false)
    } else {
      setTimeout(() => setCatIsOpen(true), 300)
    }
  }

  /**
   * Avaa ja sulkee ... paneelia
   */
  /*
  const toggleMorePanel = () => {
    setCatIsOpen(false)
    setTimeIsOpen(false)
    setOverflowVisibility(false)
    setTimeSelectIsOpen(false)
    if (moreIsOpen) {
      setMoreIsOpen(false)
    } else {
      setTimeout(() => setMoreIsOpen(true), 300)
    }
  }
    */

  /**
   * Avaa ja sulkee aikafiltteröintipaneelia
   */
  const toggleTimePanel = () => {
    setMoreIsOpen(false)
    setCatIsOpen(false)
    setTimeSelectIsOpen(false)
    if (timeIsOpen) {
      setTimeIsOpen(false)
      setOverflowVisibility(false)
    } else {
      setTimeout(() => setTimeIsOpen(true), 300)
      setTimeout(() => setOverflowVisibility(true), 600)
    }
  }

  /**
   * Avaa ja sulkee aloitus- ja lopetusajan paneelia
   */
  const toggleTimeSelectPanel = () => {
    quickTime = 0
    setSelectedQuick(null)
    setTimeSelectIsOpen((prev) => !prev)
  }

  /**
   * Toglaa kategoriaa valituksi ja pois
   * @param {Painetun kategorian id} categoryId
   */
  const handleCategoryClick = (categoryId) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  /**
   * Lähettää map-komponentille pyynnön filtteröidä
   */
  const handleClicks = () => {
    dispatch(changeDeviceSettings({
      selectedCategories: selectedCategories,
      showSystems: showReservationSystems
    }))
    toggleCategory(selectedCategories, showReservationSystems)
  }

  /**
   * Sulkee kaikki paneelit kun klikataan ulkopulelle
   * @param {eventti} e
   */
  const handleClickOutside = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
      setCatIsOpen(false)
      setMoreIsOpen(false)
      setTimeIsOpen(false)
      setTimeSelectIsOpen(false)
      setOverflowVisibility(false)
    }
  }

  /**
   * Tarkistaa jos klikataan ulkopulelle
   */
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="containerforshortcutbuttons" ref={panelRef}>
      {" "}
      {/*Alapalkin kontaineri, sisältää paneelien avausnapit*/}
      {/*
      <button
        className="shortcut-button"
        style={{
          backgroundImage: "url(/options.png)", // Suora polku publicista
        }}
        onClick={toggleMorePanel}
      />
      
      <div className={`more-panel ${moreIsOpen ? "open" : ""}`}>
        {" "}
        {/*... paneeli
        <div>...</div>
      </div>
      */}
      <button
        className="shortcut-button"
        style={{ backgroundImage: "url(/gategory.png)" }}
        onClick={toggleCatPanel}
      />
      <div className={`category-panel ${catIsOpen ? "open" : ""}`}>
        {/*Kategorioiden suodatupaneeli*/}
        <div className='category-list-container'>
          <div className="category-list" onClick={handleClicks()}>
            {filteredCategories.map(([id, name]) => (
              <button
                key={id}
                title={t[name]}
                className={`category-item ${selectedCategories[id] ? "active" : ""}`}
                onClick={() => handleCategoryClick(Number(id))}
                style={{ backgroundImage: `url(/lajit/${name}.png)` }}
              />
            ))}
            <button
              className={`category-item ${showReservationSystems ? "active" : ""}`}
              onClick={() => setShowReservationSystems((prev) => !prev)}
              style={{ backgroundImage: `url(/reservationSystemIcon.png)` }}
              title={t.fieldFilter}
            />
          </div>
          <input
            type="text"
            placeholder={t.searchCategory} // TODO: Kovakoodaus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="category-search"
          />
        </div>
      </div>
      <button
        className="shortcut-button"
        style={{ backgroundImage: "url(/timeDate.png)" }}
        onClick={toggleTimePanel}
      />
      <div
        className={`time-panel ${timeIsOpen ? "open" : ""}`}
        style={{ overflow: overflowVisibility ? "visible" : "hidden" }}
      >
        {/*Aikajaksolla suodattamisen paneeli*/}
        <div className="time-list">
          <DatePicker
            value={dates}
            onChange={(newDates) =>
              setDates([...newDates].sort((a, b) => new Date(a) - new Date(b)))
            }
            range
            minDate={Date.now()}
            zIndex={1005}
            displayWeekNumbers={true}
            calendarPosition={calendarPosition}
            render={(value, openCalendar) => (
              <div
                className="time-shortcut-button"
                onClick={() => handleCalendarToggle(openCalendar)}
                style={{
                  backgroundImage: "url(/calendar.png)", // Suora polku publicista
                  overflow: "visible",
                }}
              ></div>
            )}
            format="DD.MM.YYYY"
            weekStartDayIndex={1}
          />
          <button
            className="time-shortcut-button"
            style={{ backgroundImage: "url(/time.png)" }}
            onClick={toggleTimeSelectPanel}
          />
          <div
            className={`time-select-panel ${timeSelectIsOpen ? "open" : ""}`}
          >
            <div className="time-select-item">
              {/* Piilotettu input, joka on kuvakokoinen */}
              <input
                ref={timeInputRef}
                type="time"
                onChange={handleStarttimeChange}
                style={{
                  opacity: 0, // Piilottaa inputin
                  position: "absolute", // Aseta oikeaan kohtaan
                  width: "28px", // Aseta sama koko kuin kuvalla
                  height: "40px",
                  scale: 2,
                }}
              />
              {/* Kuvapainike, joka avaa ajanvalinnan */}
              <div
                onClick={openTimePicker} // Tämä avaa ajanvalitsimen
                style={{
                  backgroundImage: "url(/startTime.png)", // Polku kuvaan
                  backgroundSize: "cover",
                  width: "40px", // Sama koko kuin inputilla
                  height: "40px", // Sama koko kuin inputilla
                }}
              />
              {/* Näytettävä aika */}
              <span>{startTime || t.from}</span> {/*TODO: KOVAKOODAUS*/}
            </div>

            <div className="time-select-item">
              {/* Piilotettu input, joka on kuvakokoinen */}
              <input
                ref={timeInputRef}
                type="time"
                onChange={handleEndtimeChange}
                style={{
                  opacity: 0, // Piilottaa inputin
                  position: "absolute", // Aseta oikeaan kohtaan
                  width: "28px", // Aseta sama koko kuin kuvalla
                  height: "40px",
                  scale: 2,
                }}
              />
              {/* Kuvapainike, joka avaa ajanvalinnan */}
              <div
                onClick={openTimePicker} // Tämä avaa ajanvalitsimen
                style={{
                  backgroundImage: "url(/endTime.png)", // Polku kuvaan
                  backgroundSize: "cover",
                  width: "40px", // Sama koko kuin inputilla
                  height: "40px", // Sama koko kuin inputilla
                }}
              />
              {/* Näytettävä aika */}
              <span>{endTime || t.to}</span> {/*TODO: KOVAKOODAUS*/}
            </div>
          </div>
        </div>
        <div className="quick-time-select-container">
          <button
            className={`quick-time-select ${selectedQuick === 1 ? "selected" : ""
              }`}
            onClick={() => handleQuickTime(1)}
          >
            {t.filter}
          </button>
          <button
            className={`quick-time-select ${selectedQuick === 2 ? "selected" : ""
              }`}
            onClick={() => handleQuickTime(2)}
          >
            3 h
          </button>
          <button
            className={`quick-time-select ${selectedQuick === 3 ? "selected" : ""
              }`}
            onClick={() => handleQuickTime(3)}
          >
            1 d
          </button>
          <button
            className={`quick-time-select ${selectedQuick === 4 ? "selected" : ""
              }`}
            onClick={() => handleQuickTime(4)}
          >
            7 d
          </button>
          <button
            className={`quick-time-select ${selectedQuick === 5 ? "selected" : ""
              }`}
            onClick={() => handleQuickTime(5)}
          >
            1 kk
          </button>
          <button
            className="clear-button" /* Nollaa ajan valinnan */
            onClick={() => handleClearTimeFilter()}
          >
            {t.clear}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShortcutButtons
