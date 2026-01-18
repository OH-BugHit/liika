import React, { useState, useEffect } from "react"
import {
    DayPilotCalendar,
    DayPilotNavigator,
    DayPilot,
} from "@daypilot/daypilot-lite-react"
import "./calendar.css"
import reservationService from '../services/reservationService'
import { useSelector } from 'react-redux'
import translations from '../assets/translation'

const styles = {
    wrap: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px"
    },
    main: {
        flexGrow: "1",
    },
    button: {
        marginTop: "10px",
        padding: "8px 12px",
        cursor: "pointer",
        color: "black",
    },
}

const typeColorMap = {
    Liika: "#0097b2B5",
    Harjoitus: "#66CCFF",
    Varattu: "#66FF66",
    Suljettu: "#69758754"
    // Lisää tyyppejä ja värejä tarvittaessa
}

// eslint-disable-next-line react/prop-types
const MobileCalendar = ({ field }) => {
    const date = new Date()
    const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    const language = useSelector((state) => state.language.language)
    const storedToken = useSelector((state) => state.user?.user?.token ?? null)
    const userID = useSelector((state) => state.user?.user?.userID ?? null)
    const [reload, setReload] = useState(false)
    const t = translations[language]
    const [loading, setLoading] = useState(true)
    const [calendar, setCalendar] = useState(null)
    const [startDate, setStartDate] = useState(date)
    const [events, setEvents] = useState([])
    const [selectedRange, setSelectedRange] = useState(null)

    const config = { //TODO: Edit ja delete varaus
        viewType: "Week",
        durationBarVisible: false,
        timeRangeSelectedHandling: "Enabled",
        timeFormat: "Clock24Hours",
        headerDateFormat: "dddd",
        weekStarts: 1,

        onTimeRangeSelected: (args) => {
            setSelectedRange({ start: args.start, end: args.end })
        },
        onEventClick: async (args) => {
            await editEvent(args.e)
        },
        contextMenu: new DayPilot.Menu({
            items: [
                {
                    text: "Delete",
                    onClick: async (args) => {
                        calendar.events.remove(args.source)
                    },
                },
                {
                    text: "Edit...",
                    onClick: async (args) => {
                        await editEvent(args.source)
                    },
                },
            ],
        }),
        eventRender: (args) => {
            if (selectedRange && args.data.id === "selected-range") {
                args.data.backColor = styles.selectedHighlight.backgroundColor
                args.data.opacity = styles.selectedHighlight.opacity
            }
        },
    }

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const result = await reservationService.getSlots({
                    FieldID: field.FieldID,
                })
                const mappedEvents = result.slots.map(slot => ({
                    id: slot.SlotID,
                    text: slot.Text,
                    start: slot.StartTime,
                    end: slot.EndTime,
                    backColor: typeColorMap[slot.Type] || "#EEEEEE"
                }))

                const allEvents = [...mappedEvents, ...closedEvents]
                setEvents(allEvents)
            } catch (error) {
                console.error("Event fetch error:", error)
            }
        }
        fetchSlots()
    }, [field.FieldID, reload])

    useEffect(() => { // Päivitä korostusvalinta, kun selectedRange muuttuu
        if (selectedRange && calendar) {
            const startTime = selectedRange.start.toString("H:mm")
            const endTime = selectedRange.end.toString("H:mm")
            const highlightText = `${startTime} - ${endTime}`

            const highlightEvent = {
                id: "selected-range",
                start: selectedRange.start,
                end: selectedRange.end,
                text: highlightText,
                cssClass: "selected-highlight", // Voit myös käyttää CSS-luokkaa
                moveDisabled: true,
                resizeDisabled: true,
                clickDisabled: true,
            }
            const existingHighlight = calendar.events.find("selected-range")
            if (existingHighlight) {
                calendar.events.update(highlightEvent)
            } else {
                calendar.events.add(highlightEvent)
            }
        } else if (calendar) {
            calendar.events.remove("selected-range")
        }
    }, [selectedRange, calendar])

    const baseDate = (() => {
        const now = new Date(startDate)
        const day = now.getDay() // 0 = Su, 1 = Ma, ..., 6 = La
        const monday = new Date(now)
        const diff = (day === 0 ? -6 : 1 - day) // jos sunnuntai, mennään taaksepäin 6 päivää
        monday.setDate(now.getDate() + diff)
        monday.setHours(0, 0, 0, 0)
        return monday
    })()

    const closedEvents = Object.entries(field.Opening_Hours).flatMap(([day, { open, close, closed }], index) => {
        const dayOffset = weekdays.indexOf(day)
        const currentDate = new Date(baseDate)
        currentDate.setDate(currentDate.getDate() + dayOffset)
        const yyyy = currentDate.getFullYear()
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0')
        const dd = String(currentDate.getDate()).padStart(2, '0')

        const toISO = (h) => `${yyyy}-${mm}-${dd}T${h}:00`

        let result = []

        if (closed) {
            // koko päivä suljettu
            result.push({
                id: `closed-${day}-full`,
                text: "Suljettu",
                start: `${yyyy}-${mm}-${dd}T00:00:00`,
                end: `${yyyy}-${mm}-${dd}T23:59:59`,
                backColor: typeColorMap["Suljettu"] || "#FFFFFF"
            })
        } else {
            if (open && open !== '00:00') {
                result.push({
                    id: `closed-${day}-before`,
                    text: "Suljettu",
                    start: `${yyyy}-${mm}-${dd}T00:00:00`,
                    end: toISO(open),
                    backColor: typeColorMap["Suljettu"] || "#FFFFFF"
                })
            }

            if (close) {
                result.push({
                    id: `closed-${day}-after`,
                    text: "Suljettu",
                    start: toISO(close),
                    end: `${yyyy}-${mm}-${dd}T23:59:59`,
                    backColor: typeColorMap["Suljettu"] || "#FFFFFF"
                })
            }
        }
        return result
    })

    const handleDoSlot = async () => {
        if (selectedRange) {
            try {
                const modal = await DayPilot.Modal.prompt("Create a new event..:")
                if (modal.result) {
                    console.log(selectedRange)
                    const response = await reservationService.createSlot(storedToken, {
                        UserID: userID,
                        Type: "Liika",
                        StartTime: selectedRange.start.value,
                        EndTime: selectedRange.end.value,
                        Text: modal.result,
                        SystemID: field.SystemID,
                        FieldID: field.FieldID
                    })
                    console.log(response)

                    calendar.events.add({
                        start: selectedRange.start,
                        end: selectedRange.end,
                        id: DayPilot.guid(),
                        text: modal.result,
                    })
                }
                setSelectedRange(null)
            } catch (e) {
                console.error(e)
            }
        } else {
            alert("Please select a time range first.")
        }
    }

    const editEvent = async (e) => {
        const modal = await DayPilot.Modal.prompt("Update event text:", e.text())
        if (!modal.result) {
            return
        }
        e.data.text = modal.result
        calendar.events.update(e)
    }

    return (
        <div style={styles.wrap}>
            <div>
                <DayPilotNavigator
                    selectMode={"Day"}
                    showWeekNumbers={true}
                    showMonths={1}
                    skipMonths={1}
                    selectionDay={startDate}
                    weekStarts={1}
                    onTimeRangeSelected={(args) => {
                        setStartDate(args.day)
                        setReload((prev) => !prev)
                    }}
                />
            </div>
            <div style={styles.main}>
                <DayPilotCalendar
                    {...config}
                    events={events}
                    startDate={startDate}
                    controlRef={setCalendar}
                    viewType='Days'
                    days={3}
                />
                {selectedRange && (
                    <button style={styles.button} onClick={handleDoSlot}>
                        Merkitse vuoro
                    </button>
                )}
                {!selectedRange && <p>Valitse ensin aika kalenterista</p>}
            </div>
        </div>
    )
}

export default MobileCalendar
