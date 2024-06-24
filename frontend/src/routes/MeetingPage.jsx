import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import EditIcon from "../public/MeetUp-edit-icon-blue.svg"
import DeleteIcon from "../public/MeetUp-delete-icon-blue.svg"
import { HomeHeader } from "../components/HomeHeader"
import "../styles/MeetingPage.css"
import { EditMeeting } from "../components/EditMeeting"
import { DeleteMeeting } from "../components/DeleteMeeting"
import { Calendar } from "../components/Calendar"
import { BsPersonFill, BsPlusCircle } from "react-icons/bs"
import { MdSend } from "react-icons/md"

export function MeetingPage() {
    const { meetingId } = useParams()
    const [meetingDetails, setMeetingDetails] = useState('')
    const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false)
    const [isDeleteMeetingOpen, setIsDeleteMeetingOpen] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [newInvite, setNewInvite] = useState('')
    const inviteList = Array.isArray(meetingDetails.invites) ? meetingDetails.invites : []
    const acceptedList = Array.isArray(meetingDetails.accepted) ? meetingDetails.accepted : []
    const navigate = useNavigate()

    const handleAddInviteClick = (e) => {
        e.stopPropagation()
        setShowInviteModal(!showInviteModal)
    }

    const handleInviteChange = (e) => {
        setNewInvite(e.target.value)
    }

    const handleInputClick = (e) => {
        if (e.target.tagName === 'INPUT') {
            e.stopPropagation()
        }
    }

    const handleEditMeetingClick = () => {
        setIsEditMeetingOpen(true)
    }

    const handleCloseEditMeetingClick = () => {
        setIsEditMeetingOpen(false)
    }
    
    const handleDeleteMeetingClick = () => {
        setIsDeleteMeetingOpen(true)
    }

    const handleCloseDeleteMeetingClick = () => {
        setIsDeleteMeetingOpen(false)
    }

    const isAccepted = (invite) => {
        return acceptedList.includes(invite)
    }

    const handleAddNewInvite = async (e) => {
        e.stopPropagation()

        if (newInvite) {
            try {
                const response = await axios.post('http://localhost:3000/api/add-invite', {
                    meetingId: meetingId,
                    newInvite: newInvite
                })

                if (response.status === 200) {
                    const updatedInviteList = [...inviteList, newInvite];
                    setMeetingDetails(prevState => ({
                        ...prevState,
                        invites: updatedInviteList
                    }))
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

    const handleDeleteMeeting = async () => {
        try {
            await axios.delete('http://localhost:3000/api/delete-meeting', {
                data: { meetingId }
            })
            navigate('/home')
        } catch (error) {
            console.error("Error deleting meeting: ", error)
        }

        setIsDeleteMeetingOpen(false)
    }
    
    useEffect(() => {
        const fetchMeetingDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/get-meeting-details`, {
                    params: { meetingId: meetingId }
                })
                setMeetingDetails(response.data.meeting)
                console.log("MeetingPage.jsx: ", response.data.meeting)
            } catch (error) {
                console.error('Error fetching meeting details (MeetingPage.jsx): ', error)
            }
        }

        fetchMeetingDetails()
    }, [meetingId])

    return (
        <div className="meeting-page">
            <HomeHeader></HomeHeader>
            <div className="meeting-sub-header">
                <div className="sub-header-first-row">
                    <div className="meeting-sub-header-text">{meetingDetails.title}</div>
                        <div className="meeting-sub-header-icons">
                            <img className="meeting-edit-icon" onClick={handleEditMeetingClick} src={EditIcon} alt="Edit"/>
                            <img className="meeting-delete-icon" onClick={handleDeleteMeetingClick} src={DeleteIcon} alt="Delete"/>
                        </div>
                    </div>
                <div className="meeting-info-invites">
                    <div className="invite-icons">
                        {inviteList.map((invite, index) => (
                            <div key={index} className="invite">
                                <BsPersonFill className={isAccepted(invite) ? "invite-icon-accepted" : "invite-icon"}/>
                                <span className="tooltip">{invite}</span>
                            </div>
                        ))}
                    </div>
                    {inviteList.length < 10 && (
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
            {isEditMeetingOpen && (
                <div className="overlay">
                    <EditMeeting/>
                </div>
            )}
            {isDeleteMeetingOpen && (
                <div className="overlay">
                    <DeleteMeeting onDelete={handleDeleteMeeting} onCancel={handleCloseDeleteMeetingClick}/>
                </div>
            )}
            <Calendar meetingDetails={meetingDetails}></Calendar>
        </div>
    )
}