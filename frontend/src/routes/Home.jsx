import React, { useState, useEffect } from "react"
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
    const user = auth.currentUser; 

    const handleCreateMeeting = () => {
        setIsCreateMeetingOpen(true)
        console.log("New")
    }

    const handleCloseCreateMeeting = () => {
        setIsCreateMeetingOpen(false)
    }

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                console.log(user.uid)
                const response = await axios.get(`http://localhost:3000/api/get-meetings`, {
                        params: { userId: user.uid }
                    });
                setMeetings(response.data.meetings);
                console.log("Home.jsx: ", meetings)
            } catch (error) {
                console.error('Error fetching meetings:', error);
            }
        };

        fetchMeetings();
    }, [user]);
    
    return (
        <div className="home-page">
            <HomeHeader></HomeHeader>
            <div className="sub-header">
                <div className="sub-header-text">Your Meetings</div>
                <IoAddOutline onClick={() => {handleCreateMeeting()}} className="sub-header-icon"></IoAddOutline>
            </div>
            {isCreateMeetingOpen && (
                <div className="overlay">
                    <div className="create-meeting-container">
                        <CreateMeeting customClassName="custom-create-meeting" onCreateSuccess={handleCloseCreateMeeting}/>
                        <button onClick={handleCloseCreateMeeting} className="close-button">Cancel</button>
                    </div>
                </div>
            )}
            <div className="meetings">
                {meetings.map(meeting => (
                    <Meeting
                        key={meeting.id}
                        title={meeting.title}
                        invites={meeting.invites}
                        scheduledDay={meeting.scheduledDay}
                        scheduledTime={meeting.scheduledTime}
                    />
                ))}
            </div>
        </div>
    )
}