import { IoClose } from "react-icons/io5"
import "./DeleteMeeting.css"

export function DeleteMeeting({ onCancel, onDelete}) {
    return (
        <div className="delete-meeting-container">
            <div className='zoom-box-header'>
                <div className='zoom-box-title'>Delete MeetUp</div>
                <IoClose size={20} className='close-zoom-button' onClick={onCancel}/>
            </div>
            <div className="delete-meeting-dialog">
                <div className="delete-meeting-text">Are you sure you want to delete this MeetUp?</div>
                <div className="delete-meeting-subtext">This action cannot be undone</div>
            </div>
            <button className="delete-button" onClick={onDelete}>Yes, delete</button>
        </div>
    )
}