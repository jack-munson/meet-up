import React, { useState } from "react"
import { HomeHeader } from "../components/HomeHeader"
import { CreateMeeting } from "../components/CreateMeeting"
import { Meeting } from "../components/Meeting"
import { IoAddOutline } from "react-icons/io5"
import "../styles/Home.css"

export function Home() {
    const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false)

    const handleCreateMeeting = () => {
        setIsCreateMeetingOpen(true)
        console.log("New")
    }

    const handleCloseCreateMeeting = () => {
        setIsCreateMeetingOpen(false)
    }
    
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
                        <CreateMeeting customClassName="custom-create-meeting"/>
                        <button onClick={handleCloseCreateMeeting} className="close-button">Cancel</button>
                    </div>
                </div>
            )}
            <Meeting></Meeting>
        </div>
    )
}