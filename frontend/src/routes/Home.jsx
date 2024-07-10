import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { HomeHeader } from "../components/HomeHeader"
import { CreateMeeting } from "../components/CreateMeeting"
import { Meeting } from "../components/Meeting"
import { IoAddOutline } from "react-icons/io5"
import "../styles/Home.css"
import axios from "axios"
import { getAuth } from "firebase/auth"

export function Home() {
    const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false)
    const [meetings, setMeetings] = useState([])
    const auth = getAuth()
    const user = auth.currentUser
    const navigate = useNavigate()

    const handleCreateMeeting = () => {
        setIsCreateMeetingOpen(true)
    }

    const handleCloseCreateMeeting = () => {
        setIsCreateMeetingOpen(false)
    }

    const addMeeting = (newMeeting) => {
        setMeetings(prevMeetings => [...prevMeetings, newMeeting])
        setIsCreateMeetingOpen(false)
    }

    const handleMeetingClick = (meetingId) => {
        navigate(`/meeting/${meetingId}`)
    }

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/get-meetings`, {
                        params: { userId: user.uid }
                    });
                const sortedMeetings = response.data.meetings.sort((a, b) => a.id - b.id);
                setMeetings(sortedMeetings);
            } catch (error) {
                console.error('Error fetching meetings: ', error)
            }
        };

        fetchMeetings()
    }, [user, isCreateMeetingOpen])
    
    return (
        <div className="home-page">
            <HomeHeader></HomeHeader>
            <div className="page-content">
                <div className="sub-header">
                    <div className="sub-header-text">Your Meetings</div>
                    <IoAddOutline onClick={handleCreateMeeting} className="sub-header-icon"></IoAddOutline>
                </div>
                {isCreateMeetingOpen && (
                    <div className="overlay">
                        <div className="create-meeting-container">
                            <CreateMeeting customClassName="custom-create-meeting" onCreateSuccess={addMeeting}/>
                            <button onClick={handleCloseCreateMeeting} className="close-button">Cancel</button>
                        </div>
                    </div>
                )}
                {meetings.length === 0 && (
                    <div className="no-meetings-blurb">
                        Looks like you don't have any meetings yet!
                    </div>
                )}
                <div className="meetings">
                    {meetings.map(meeting => (
                        <Meeting
                            key={meeting.id}
                            meetingId={meeting.id}
                            title={meeting.title}
                            startTime={meeting.start_time || 9}
                            endTime={meeting.end_time || 17}
                            days={meeting.days || []}
                            meetingStart={meeting.meeting_start || null}
                            meetingEnd={meeting.meeting_end || null}
                            frequency={meeting.frequency || "one-time"}
                            onClick={() => handleMeetingClick(meeting.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}