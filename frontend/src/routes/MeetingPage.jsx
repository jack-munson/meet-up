import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { HomeHeader } from "../components/HomeHeader"
import "../styles/MeetingPage.css"
import { EditMeeting } from "../components/EditMeeting"
import { DeleteMeeting } from "../components/DeleteMeeting"
import { AvailabilityCalendar } from "../components/AvailabilityCalendar"
import { BsPersonFill, BsPlusCircle } from "react-icons/bs"
import { MdSend } from "react-icons/md"
import { getAuth } from "firebase/auth"

export function MeetingPage() {
    const { meetingId } = useParams()
    const [meetingDetails, setMeetingDetails] = useState('')
    const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false)
    const [isDeleteMeetingOpen, setIsDeleteMeetingOpen] = useState(false)
    const [isEditingAvailability, setIsEditingAvailability] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [newInvite, setNewInvite] = useState('')
    const [selectedSlots, setSelectedSlots] = useState(new Set())
    const inviteList = Array.isArray(meetingDetails.invites) ? meetingDetails.invites : []
    const acceptedList = Array.isArray(meetingDetails.accepted) ? meetingDetails.accepted : []
    const auth = getAuth()
    const user = auth.currentUser
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

    const handleEditingAvailability = () => {
        if (isEditingAvailability) {
            handleSaveAvailability(selectedSlots)
        }
        setIsEditingAvailability(!isEditingAvailability)
    }

    const updateSelectedSlots = (slots) => {
        setSelectedSlots(slots);
    }

    const flashEditButton = () => {
        const button = document.querySelector('.edit-availability-button');
        button.classList.add('flash');
        setTimeout(() => {
            button.classList.remove('flash');
        }, 1000);
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

    const handleSaveAvailability = async (slots) => {
        console.log("newAvailability (start of handleSaveAvailability): ", Array.from(slots))

        try {
            const availabilityData = {
                meetingId: meetingDetails.id, 
                userId: user.uid,
                newAvailability: Array.from(slots)
            }

            const response = await axios.post('http://localhost:3000/api/edit-availability', availabilityData)
            console.log("MeetingPage.jsx (handleSaveAvailability): ", response.data.updatedAvailability)
            setMeetingDetails(prevState => ({
                ...prevState,
                availability: response.data.updatedAvailability
            }))
        } catch (error) {
            console.error("Error adding availability (MeetingPage.jsx): ", error)
        }
    }
    
    useEffect(() => {
        const fetchMeetingDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/get-meeting-details`, {
                    params: { meetingId: meetingId }
                })
                setMeetingDetails(response.data.meeting)
                console.log(response.data.meeting)
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
                        <div className="meeting-sub-header-buttons">
                            <button className="meeting-edit-button" onClick={handleEditMeetingClick} alt="Edit">Edit meeting</button>
                            <button className="meeting-delete-button" onClick={handleDeleteMeetingClick} alt="Delete">Delete meeting</button>
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
                                            className="invite-modal-popout"
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
                <button className="edit-availability-button" onClick={handleEditingAvailability}>{isEditingAvailability ? "Save availability" : "Edit availability"}</button>
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
            {!isEditingAvailability && (
                <AvailabilityCalendar 
                    userId={user.uid}
                    days={meetingDetails.days || []}
                    frequency={meetingDetails.frequency}
                    display={'all'}
                    availability={meetingDetails.availability || []}
                    updateSelectedSlots={(slots) => updateSelectedSlots(slots)}
                    startTime={meetingDetails.start_time}
                    endTime={meetingDetails.end_time}
                    accepted={meetingDetails.accepted || []}
                    flashEditButton={flashEditButton}>
                </AvailabilityCalendar>
            )}
            {isEditingAvailability &&(
                <AvailabilityCalendar 
                    userId={user.uid}
                    days={meetingDetails.days || []}
                    frequency={meetingDetails.frequency}
                    display={'user'}
                    availability={meetingDetails.availability || []}
                    updateSelectedSlots={(slots) => updateSelectedSlots(slots)}
                    startTime={meetingDetails.start_time}
                    endTime={meetingDetails.end_time}
                    accepted={meetingDetails.accepted || []}
                    >
                </AvailabilityCalendar> 
            )}
        </div>
    )
}