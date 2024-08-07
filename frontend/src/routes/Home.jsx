import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { HomeHeader } from "../components/HomeHeader"
import { Footer } from "../components/Footer";
import { CreateMeeting } from "../components/CreateMeeting"
import { Meeting } from "../components/Meeting"
import { IoAddOutline } from "react-icons/io5"
import { Alert, Snackbar, styled, CircularProgress, Box, ToggleButton, ToggleButtonGroup } from "@mui/material"
import "../styles/Home.css"
import axios from "axios"
import { getAuth } from "firebase/auth"

export function Home() {
    const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false)
    const [meetings, setMeetings] = useState([])
    const [createdMeetings, setCreatedMeetings] = useState([])
    const [joinedMeetings, setJoinedMeetings] = useState([])
    const [view, setView] = useState('all')
    const [currentViewingMeetings, setCurrentViewingMeetings] = useState([])
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)
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
                const response = await axios.get(`https://usemeetup-api.com/api/get-meetings`, {
                        params: { userId: user.uid }
                    })
                const sortedMeetings = response.data.meetings.sort((a, b) => a.id - b.id)
                setMeetings(sortedMeetings)
                setCurrentViewingMeetings(sortedMeetings)
                setCreatedMeetings(response.data.createdIds)
                setJoinedMeetings(response.data.joinedIds)
            } catch (error) {
                console.error('Error fetching meetings: ', error)
            } finally {
                setIsLoading(false)
            }
        };

        fetchMeetings()
    }, [user, isCreateMeetingOpen])

    const handleViewChange = (view) => {
        console.log(view)
        setIsLoading(true)
        if (view === 'all') {
            setView('all')
            setCurrentViewingMeetings(meetings)
        } else if (view === 'created') {
            setView('created')
            if (createdMeetings) {
                setCurrentViewingMeetings(meetings.filter((meeting) => createdMeetings.includes(meeting.id)) || [])
            } else {
                setCurrentViewingMeetings([])
            }
        } else if (view === 'joined') {
            setView('joined')
            if (joinedMeetings) {
                setCurrentViewingMeetings(meetings.filter((meeting) => joinedMeetings.includes(meeting.id)) || [])
            } else {
                setCurrentViewingMeetings([])
            }
        }
        setIsLoading(false)
    }

    const CustomAlert = styled(Alert)(({ theme }) => ({
        backgroundColor: 'rgba(0, 123, 255)',
        color: 'white',
        borderRadius: '8px',
        '.MuiAlert-action': {
          color: 'white',
        },
    }));

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress size={75} sx={{ color: '#1E965C' }}/>
            </Box>
        )
    }
    
    return (
        <div className="home-page">
            <HomeHeader></HomeHeader>
            <div className="home-page-content">
                <div className="sub-header">
                    <div className="sub-header-text">Your MeetUps</div>
                    <IoAddOutline onClick={handleCreateMeeting} className="sub-header-icon"></IoAddOutline>
                </div>
                <ToggleButtonGroup 
                    className="frequency-options" 
                    style={{ marginBottom: "25px", height: "40px" }} 
                    onChange={(e) => handleViewChange(e.target.value)} 
                    value={view} 
                    exclusive
                >
                    <ToggleButton className="frequency-option one-time" style={{ height: "40px", fontSize: "15px" }} disableRipple value="all">All</ToggleButton>
                    <ToggleButton className="frequency-option" style={{ height: "40px", fontSize: "15px" }} disableRipple value="created">Created</ToggleButton>
                    <ToggleButton className="frequency-option recurring" style={{ height: "40px", fontSize: "15px" }} disableRipple value="joined">Joined</ToggleButton>
                </ToggleButtonGroup>
                {isCreateMeetingOpen && (
                    <div className="overlay">
                        <div className="create-meeting-container">
                            <CreateMeeting onCreateSuccess={addMeeting} onCancel={handleCloseCreateMeeting}/>
                        </div>
                    </div>
                )}
                {currentViewingMeetings.length === 0 && 
                    <div className="no-meetings-blurb">
                        No MeetUps to display
                    </div>
                }
                <div className="meetings">
                    {currentViewingMeetings.map(meeting => (
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