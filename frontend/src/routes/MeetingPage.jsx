import React, { useState, useEffect, useMemo } from "react"
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
import { FiEdit } from "react-icons/fi"
import { MdDeleteForever } from "react-icons/md"
import { Alert, Snackbar, styled } from "@mui/material"
import { getAuth } from "firebase/auth"

export function MeetingPage() {
    const { meetingId } = useParams()
    const [meetingDetails, setMeetingDetails] = useState('')
    const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false)
    const [isDeleteMeetingOpen, setIsDeleteMeetingOpen] = useState(false)
    const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false)
    const [isEditingAvailability, setIsEditingAvailability] = useState(false)
    const [newInvite, setNewInvite] = useState('')
    const [selectedSlots, setSelectedSlots] = useState(new Set())
    const [meetingStart, setMeetingStart] = useState(null)
    const [meetingEnd, setMeetingEnd] = useState(null)
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const inviteList = Array.isArray(meetingDetails.invites) ? meetingDetails.invites : []
    const auth = getAuth()
    const user = auth.currentUser
    const navigate = useNavigate()

    const isAdmin = (userId) => {
        return meetingDetails.user_id === userId
    }

    const handleInviteChange = (e) => {
        setNewInvite(e.target.value)
    }

    const isAccepted = (invite) => {
        for (const userId in meetingDetails.accepted) {
            if (meetingDetails.accepted[userId].email === invite) {
              return true;
            }
          }
          return false;
    }

    const handleInputClick = (e) => {
        if (e.target.tagName === 'INPUT') {
            e.stopPropagation()
        }
    }

    const handleScheduleMeetingClick = () => {
        if (isScheduleMeetingOpen) {
            handleUpdateMeetingTimes(meetingStart, meetingEnd)
        }
        setIsScheduleMeetingOpen(!isScheduleMeetingOpen)
    }

    const handleEditAvailabilityClick = () => {
        if (isEditingAvailability) {
            handleSaveAvailability(selectedSlots)
        }
        setIsEditingAvailability(!isEditingAvailability)
    }

    const handleEditMeetingClick = () => {
        setIsEditMeetingOpen(!isEditMeetingOpen)
    }

    const handleDeleteMeetingClick = () => {
        setIsDeleteMeetingOpen(!isDeleteMeetingOpen)
    }

    const updateSelectedSlots = (slots) => {
        setSelectedSlots(slots);
    }

    const updateMeetingTimes = (start, end) => {
        setMeetingStart(start);
        setMeetingEnd(end);
    }

    const flashEditButton = () => {
        const button = document.querySelector('.edit-availability-button');
        button.classList.add('flash');
        setTimeout(() => {
            button.classList.remove('flash');
        }, 1000);
    }

    const handleCloseSchedule = () => {
        setIsScheduleMeetingOpen(false)
        setMeetingStart(meetingDetails.meeting_start || null)
        setMeetingEnd(meetingDetails.meeting_end || null)
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
                    setAlertOpen(false)
                    setAlertMessage("Invite sent!")
                    setAlertOpen(true)
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
        try {
            const availabilityData = {
                meetingId: meetingDetails.id, 
                userId: user.uid,
                newAvailability: Array.from(slots)
            }

            const response = await axios.post('http://localhost:3000/api/edit-availability', availabilityData)
            setMeetingDetails(prevState => ({
                ...prevState,
                availability: response.data.updatedAvailability
            }))
            setAlertOpen(false)
            setAlertMessage("Availability saved")
            setAlertOpen(true)
        } catch (error) {
            console.error("Error editing availability (MeetingPage.jsx): ", error)
        }
    }

    const handleUpdateMeetingTimes = async (start, end) => {
        try {
            const meetingTimeData = {
                meetingId: meetingDetails.id,
                newStartTime: start,
                newEndTime: end
            }

            const response = await axios.post('http://localhost:3000/api/edit-meeting-time', meetingTimeData)
            setMeetingDetails(prevState => ({
                ...prevState,
                meeting_start: response.data.updatedStartTime,
                meeting_end: response.data.updatedEndTime
            }))
            setAlertOpen(false)
            setAlertMessage('Meeting scheduled')
            setAlertOpen(true)
        } catch (error) {
            console.error("Error editing meeting times (MeetingPage.jsx): ", error)
        }
    }

    const handleMeetingUpdate = async (newMeetingDetails) => {
        try {
            console.log("newMeetingDetails before API call: ", newMeetingDetails)
            const response = await axios.post('http://localhost:3000/api/edit-meeting', newMeetingDetails)
            setMeetingDetails(prevState => ({
                ...prevState,
                title: response.data.newTitle,
                description: response.data.newDescription,
                days: response.data.newDays,
                start_time: response.data.newStartTime,
                end_time: response.data.newEndTime
            }))
            setIsEditMeetingOpen(false)
            setAlertOpen(false)
            setAlertMessage('Meeting details updated')
            setAlertOpen(true)
        } catch (error) {
            console.error("Error editing meeting (MeetingPage.jsx): ", error)
        }
    }
    
    useEffect(() => {
        const fetchMeetingDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/get-meeting-details`, {
                    params: { meetingId: meetingId }
                })
                setMeetingDetails(response.data.meeting)
                setMeetingStart(response.data.meeting.meeting_start || null)
                setMeetingEnd(response.data.meeting.meeting_end || null)
            } catch (error) {
                console.error('Error fetching meeting details (MeetingPage.jsx): ', error)
            }
        }

        fetchMeetingDetails()
    }, [meetingId])

    const CustomAlert = styled(Alert)(({ theme }) => ({
        backgroundColor: 'rgba(0, 123, 255)',
        color: 'white',
        borderRadius: '8px',
        '.MuiAlert-action': {
          color: 'white',
        },
    }));

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlertOpen(false);
    };

    const memoAvailability = useMemo(() => meetingDetails.availability || [], [meetingDetails.availability])

    return (
        <div className="meeting-page">
            <HomeHeader></HomeHeader>
            <div className="meeting-sub-header">
                <div className="sub-header-first-row">
                    <div className="meeting-sub-header-text">{meetingDetails.title}</div>
                        {isAdmin(user.uid) &&
                        <div className="meeting-sub-header-buttons">
                            <FiEdit size={40} className="meeting-edit-button" onClick={handleEditMeetingClick} alt="Edit"/>
                            <MdDeleteForever size={48} className="meeting-delete-button" onClick={handleDeleteMeetingClick} alt="Delete"/>
                        </div>
                        }
                    </div>
                {isAdmin(user.uid) &&
                    <div className="meeting-info-invites">
                        {inviteList.length > 0 && (
                            <div className="invite-icons">
                                {inviteList.map((invite, index) => (
                                    <div key={index} className="invite">
                                        <BsPersonFill className={isAccepted(invite) ? "invite-icon-accepted" : "invite-icon"}/>
                                        <span className="tooltip">{invite}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {inviteList.length < 10 && (
                            <div className="add-invite-container">                                
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
                            </div>
                        )}
                    </div>
                }
                <div className="admin-buttons">
                    <button 
                        className={`edit-availability-button ${isScheduleMeetingOpen ? 'disabled' : ''} `} 
                        onClick={handleEditAvailabilityClick}
                        disabled={isScheduleMeetingOpen}>
                        {isEditingAvailability ? "Save availability" : "Edit availability"}
                    </button>
                    {isAdmin(user.uid) && 
                        <div className="schedule-buttons">
                            <button 
                                className={`edit-availability-button ${isEditingAvailability ? 'disabled' : ''} `} 
                                onClick={handleScheduleMeetingClick}
                                disabled={isEditingAvailability}>
                                {isScheduleMeetingOpen ? "Schedule" : "Schedule meeting"}
                            </button>
                            {isScheduleMeetingOpen && 
                                <button className="close-scheduling-button" onClick={() => handleCloseSchedule()}>Cancel</button>
                            }
                        </div>
                    }
                </div>
            </div>
            {isEditMeetingOpen && (
                <div className="overlay">
                    <EditMeeting 
                        onCancel={handleEditMeetingClick} 
                        onSubmit={(newDetails) => handleMeetingUpdate(newDetails)} 
                        meetingDetails={meetingDetails || null}/>
                </div>
            )}
            {isDeleteMeetingOpen && (
                <div className="overlay">
                    <DeleteMeeting onDelete={handleDeleteMeeting} onCancel={handleDeleteMeetingClick}/>
                </div>
            )}
            {!isEditingAvailability && (
                <AvailabilityCalendar 
                    userId={user.uid}
                    admin={isAdmin(user.uid)}
                    title={meetingDetails.title || "New meeting"}
                    description={meetingDetails.description || "Event from MeetUp"}
                    invites={meetingDetails.invites || []}
                    days={meetingDetails.days || []}
                    frequency={meetingDetails.frequency}
                    display={'all'}
                    availability={memoAvailability}
                    updateSelectedSlots={(slots) => updateSelectedSlots(slots)}
                    startTime={meetingDetails.start_time}
                    endTime={meetingDetails.end_time}
                    meetingStart={meetingStart}
                    meetingEnd={meetingEnd}
                    updateMeetingTimes={(meetingStart, meetingEnd) => updateMeetingTimes(meetingStart, meetingEnd)}
                    accepted={meetingDetails.accepted || []}
                    flashEditButton={flashEditButton}
                    isScheduling={isScheduleMeetingOpen}>
                </AvailabilityCalendar>
            )}
            {isEditingAvailability &&(
                <AvailabilityCalendar 
                    userId={user.uid}
                    admin={isAdmin(user.uid)}
                    title={meetingDetails.title || "New meeting"}
                    description={meetingDetails.description || "Event from MeetUp"}
                    invites={meetingDetails.invites || []}
                    days={meetingDetails.days || []}
                    frequency={meetingDetails.frequency}
                    display={'user'}
                    availability={memoAvailability}
                    updateSelectedSlots={(slots) => updateSelectedSlots(slots)}
                    startTime={meetingDetails.start_time}
                    endTime={meetingDetails.end_time}
                    meetingStart={null}
                    meetingEnd={null}
                    updateMeetingTimes={(meetingStart, meetingEnd) => updateMeetingTimes(meetingStart, meetingEnd)}
                    accepted={meetingDetails.accepted || []}
                    >
                </AvailabilityCalendar> 
            )}
            <Snackbar
                open={alertOpen}
                autoHideDuration={5000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <CustomAlert onClose={handleClose} severity="success" sx={{ width: '100%' }} variant="filled">
                    {alertMessage}
                </CustomAlert>
            </Snackbar>
        </div>
    )
}