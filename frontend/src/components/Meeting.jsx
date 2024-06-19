import "./Meeting.css"
import { BsPersonFill, BsPlusCircle } from "react-icons/bs"
import { MdSend } from "react-icons/md";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function Meeting({ meetingId, title, invites, scheduledDay, scheduledTime, onClick }) {
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [newInvite, setNewInvite] = useState('')
    const inviteList = Array.isArray(invites) ? invites : []

    const handleAddInviteClick = (e) => {
        e.stopPropagation()
        setShowInviteModal(!showInviteModal)
    }

    const handleInviteChange = (e) => {
        setNewInvite(e.target.value)
    }

    const handleInputClick = (e) => {
        if (e.target.tagName === 'INPUT') {
            e.stopPropagation();
        }
    }

    const handleAddNewInvite = async (e) => {
        e.stopPropagation()

        if (newInvite) {
            try {
                console.log(newInvite)
                const response = await axios.post('http://localhost:3000/api/add-invite', {
                    meetingId: meetingId,
                    newInvite: newInvite
                })

                if (response.status === 200) {
                    inviteList.push(newInvite)
                    setNewInvite('')
                    setShowInviteModal(false)
                } else {
                    console.error('Failed to add invite')
                }
            }
            catch (error) {
                console.error('Error adding invite: ', error)
            }
        }
    }

    return (
        <div className="meeting-container" onClick={onClick}>
            <div className="meeting-info">
                <div className="meeting-info-title">
                    {title}
                </div>
                <div className="meeting-info-invites">
                    <div className="invite-icons">
                        {inviteList.map((invite, index) => (
                            <div key={index} className="invite">
                                <BsPersonFill className="invite-icon"/>
                                <span className="tooltip">{invite}</span>
                            </div>
                        ))}
                    </div>
                    {inviteList.length < 8 && (
                        <div className="add-invite-container">
                            <BsPlusCircle className="add-invite-icon" onClick={handleAddInviteClick}/>
                            {showInviteModal && (
                                <div className="invite-modal">
                                    <div className="invite-modal-content">
                                        <input 
                                            type="email" 
                                            value={newInvite} 
                                            style={{marginBottom: "0px"}}
                                            onChange={(e) => handleInviteChange(e)}
                                            onClick={handleInputClick}
                                            placeholder="email@domain.com" 
                                        />
                                    </div>
                                    <MdSend className="send-invite-icon" onClick={handleAddNewInvite}></MdSend>
                                </div>
                            )}
                        </div>
                    )}
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