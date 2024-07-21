import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { HomeHeader } from "../components/HomeHeader"
import { Footer } from "../components/Footer";
import { CreateMeeting } from "../components/CreateMeeting"
import { Meeting } from "../components/Meeting"
import { IoAddOutline } from "react-icons/io5"
import { Alert, Snackbar, styled } from "@mui/material"
import "../styles/Home.css"
import axios from "axios"
import { getAuth } from "firebase/auth"

export function Home() {
    const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false)
    const [meetings, setMeetings] = useState([])
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
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
        setAlertMessage("Meeting created!")
        setAlertOpen(true)
    }

    const handleMeetingClick = (meetingId) => {
        navigate(`/meeting/${meetingId}`)
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlertOpen(false);
    };

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

    const CustomAlert = styled(Alert)(({ theme }) => ({
        backgroundColor: 'rgba(0, 123, 255)',
        color: 'white',
        borderRadius: '8px',
        '.MuiAlert-action': {
          color: 'white',
        },
    }));
    
    return (
        <div className="home-page">
            <HomeHeader></HomeHeader>
            <div className="home-page-content">
                <div className="sub-header">
                    <div className="sub-header-text">Your MeetUps</div>
                    <IoAddOutline onClick={handleCreateMeeting} className="sub-header-icon"></IoAddOutline>
                </div>
                {isCreateMeetingOpen && (
                    <div className="overlay">
                        <div className="create-meeting-container">
                            <CreateMeeting onCreateSuccess={addMeeting} onCancel={handleCloseCreateMeeting}/>
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
            <Footer/>
        </div>
    )
}