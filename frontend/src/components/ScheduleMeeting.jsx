import "./ScheduleMeeting.css"

export function ScheduleMeeting() {
    return (
        <div className="schedule-meeting-box">
            <div className="schedule-meeting-header">Schedule your meeting</div>
            <div className="meeting-length-buttons">
                <button>15 minutes</button>
                <button>30 minutes</button>
                <button>45 minutes</button>
                <button>1 hour</button>
            </div>
        </div>
    )
}