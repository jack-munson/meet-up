import "./Calendar.css"
import { DayColumn } from "./DayColumn"

export function Calendar({ meetingDetails, editAvailability }) {
    const { days = [], frequency, start_time, end_time } = meetingDetails
    const times = []
    const timeInterval = end_time - start_time
    
    function formatDate(dateOrDay) {
        if (frequency === "one-time") {
            const date = new Date(parseInt(dateOrDay, 10))
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${month}/${day}`
        }
        else {
            return dateOrDay.charAt(0).toUpperCase() + dateOrDay.slice(1, 3).toUpperCase()
        }
    }

    for (let i = 0; i < timeInterval; i ++) {
        const time = parseInt(start_time) + i
        times.push(formatTime(time))
    }

    function formatTime(time) {
        const hour = time <= 12 ? time : time - 12
        const ampm = time < 12 ? "AM" : "PM"
        return `${hour} ${ampm}` 
    }

    return (
        <div className="availability-viewer">
            <div className="calendar-container">
                <div className="times">
                    {times.map((time) => (
                        <div>{time}</div>
                    ))}
                </div>
                <div className="days-grid">
                    {days.map((day) => (
                        <DayColumn 
                            day={formatDate(day)} 
                            timeInterval={timeInterval} 
                            startTime={start_time}
                            handleSlotClick={(date, time) => editAvailability(date, time)}>
                        </DayColumn>
                    ))}
                </div>
            </div>
        </div>
    )
}