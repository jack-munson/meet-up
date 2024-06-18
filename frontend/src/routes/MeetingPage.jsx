import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { HomeHeader } from "../components/HomeHeader"
import "../styles/MeetingPage.css"

export function MeetingPage() {
    const { meetingId } = useParams()
    const [meetingDetails, setMeetingDetails] = useState('')
    
    useEffect(() => {
        const fetchMeetingDetails = async () => {
            try {
                console.log("MeetingID (MeetingPage.jsx): ", meetingId)
                const response = await axios.get(`http://localhost:3000/api/get-meeting-details`, {
                    params: { meetingId }
                })
                console.log("Meeting (MeetingPage.jsx): ", response.data.meeting)
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
            </div>
        </div>
    )
}
