import "./Meeting.css"

export function Meeting() {
    return (
        <div className="meetings">
            <div className="meeting-container">
                <div className="meeting-info">
                    <div className="meeting-info-title">
                        COMSPCI 250 Study Group
                    </div>
                    <div className="meeting-info-invites">
                        Jack, Esther, Ellora, Huy, Adam
                    </div>
                </div>
                <div className="scheduled">
                    <div className="divider"> </div>
                    <div className="scheduled-info">
                        <div className="scheduled-day">
                            Wednesday, June 3
                        </div>
                        <div className="scheduled-time">
                            3:30 pm - 4:00 pm 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}