import "./Meeting.css"

export function Meeting({ title, scheduledDay, scheduledTime, onClick }) {

    return (
        <div className="meeting-container" onClick={onClick}>
            <div className="meeting-info">
                <div className="meeting-info-title">
                    {title}
                </div>
            </div>
            <div className="scheduled">
                <div className="divider"> </div>
                <div className="scheduled-info">
                    <div className="scheduled-day">
                        {scheduledDay || "No meeting"}
                    </div>
                    <div className="scheduled-time">
                        {scheduledTime || "scheduled"}
                    </div>
                </div>
            </div>
        </div>
    )
}