import "./DayColumn.css"

export function DayColumn({ day, timeInterval }) {
    const hours = []
    
    for (let i = 0; i < timeInterval; i++) {
        hours.push(
            <div className="time-cell-hour">
                <div className="time-slot-30">
                    <div className="time-slot-15"></div>
                    <div className="time-slot-15"></div>
                </div>
                <div className="time-slot-30">
                    <div className="time-slot-15"></div>
                    <div className="time-slot-15"></div>
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