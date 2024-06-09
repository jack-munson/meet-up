import "./Meeting.css"

export function Meeting({ title, invites, scheduledDay, scheduledTime }) {
    return (
        <div className="meeting-container">
            <div className="meeting-info">
                <div className="meeting-info-title">
                    {title}
                </div>
                <div className="meeting-info-invites">
                    {invites}
                </div>
            </div>
            <div className="scheduled">
                <div className="divider"> </div>
                <div className="scheduled-info">
                    <div className="scheduled-day">
                        {scheduledDay}
                    </div>
                    <div className="scheduled-time">
                        {scheduledTime}
                    </div>
                </div>
            </div>
        </div>
    )
}