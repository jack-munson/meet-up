import "./DeleteMeeting.css"

export function DeleteMeeting({ onCancel, onDelete}) {
    return (
        <div className="delete-meeting-container">
            <div className="delete-meeting-text">Are you sure you want to delete this meeting?</div>
            <div className="delete-meeting-subtext">This action cannot be undone</div>
            <div className="delete-meeting-buttons">
                <button className="delete-button" onClick={onDelete}>Yes, delete</button>
                <button className="cancel-button" onClick={onCancel}>No, cancel</button>
            </div>
        </div>
    )
}