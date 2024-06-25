import "./DayColumn.css"

export function DayColumn({ day, timeInterval, startTime, handleSlotClick }) {
    const hours = []

    const formatTime = (hour, minute) => {
        return `${hour}:${minute}`
    }
    
    for (let i = 0; i < timeInterval; i++) {
        const hour = parseInt(startTime) + i;
        hours.push(
            <div className="time-cell-hour">
                <div className="time-slot-30">
                    <div className="time-slot-15" onClick={() => handleSlotClick(day, formatTime(hour, 0))}></div>
                    <div className="time-slot-15" onClick={() => handleSlotClick(day, formatTime(hour, 15))}></div>
                </div>
                <div className="time-slot-30">
                    <div className="time-slot-15" onClick={() => handleSlotClick(day, formatTime(hour, 30))}></div>
                    <div className="time-slot-15" onClick={() => handleSlotClick(day, formatTime(hour, 45))}></div>
                </div>
            </div>
        )
    }

    return (
        <div className="day-column">
            <div className="day-title">{day}</div>
            {hours}
        </div>
    )
}