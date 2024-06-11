import "./Meeting.css"
import { BsPersonFill, BsPlusCircle } from "react-icons/bs"

export function Meeting({ title, invites, scheduledDay, scheduledTime }) {
    const inviteList = Array.isArray(invites) ? invites : []

    return (
        <div className="meeting-container">
            <div className="meeting-info">
                <div className="meeting-info-title">
                    {title}
                </div>
                <div className="meeting-info-invites">
                    {inviteList.map((invite, index) => (
                        <div key={index} className="invite">
                            <BsPersonFill className="invite-icon"/>
                        </div>
                    ))}
                    <div>
                        <BsPlusCircle className="add-invite-icon"/>
                    </div>
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