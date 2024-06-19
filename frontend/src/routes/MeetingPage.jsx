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

export function MeetingPage() {
    const { meetingId } = useParams()
    const [meetingDetails, setMeetingDetails] = useState('')
    const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false)
    const [isDeleteMeetingOpen, setIsDeleteMeetingOpen] = useState(false)
    const navigate = useNavigate()

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
                    params: { meetingId }
                })
                setMeetingDetails(response.data.meeting)
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
                <div className="meeting-sub-header-text">{meetingDetails.title}</div>
                <div className="meeting-sub-header-icons">
                    <img className="meeting-edit-icon" onClick={handleEditMeetingClick} src={EditIcon} alt="Edit"/>
                    <img className="meeting-delete-icon" onClick={handleDeleteMeetingClick} src={DeleteIcon} alt="Delete"/>
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
        </div>
    )
}
