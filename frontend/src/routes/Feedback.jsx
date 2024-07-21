import { FrontHeader } from "../components/FrontHeader"
import { HomeHeader } from "../components/HomeHeader"
import { Footer } from "../components/Footer"
import "../styles/Feedback.css"
import { useState } from "react"
import { Alert, Snackbar, styled } from "@mui/material"
import axios from "axios"
import { getAuth } from "firebase/auth"

export function Feedback() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [feedback, setFeedback] = useState('')
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertMessage, setAlertMessage] =useState('')
    const auth = getAuth()
    const user = auth.currentUser

    const handleSubmitFeedback = async () => {
        try {
            await axios.post("http://localhost:3000/api/add-feedback", {
                name: name,
                email: email,
                feedback: feedback
            })
            setName('')
            setEmail('')
            setFeedback('')
            setAlertOpen(false)
            setAlertMessage('Thank you for submitting feedback')
            setAlertOpen(true)
        } catch (error) {
            console.error("Error submitting feedback: ", error)
        }
    }

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

    return (
        <div className="feedback-page">
            {user ? <HomeHeader /> : <FrontHeader />}
            <div className="feedback-page-content">
                <div className="sub-header">
                    <div className="sub-header-text">Feedback</div>
                </div>
                <div className="feedback-form">
                    <input 
                        type="text" 
                        placeholder="Name (optional)"
                        className="feedback-info-input"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                    />
                    <input 
                        type="text" 
                        placeholder="Email (optional)"
                        className="feedback-info-input"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />
                    <textarea 
                        type="text" 
                        placeholder="How can we improve MeetUp?"
                        className="feedback-input"
                        onChange={(e) => setFeedback(e.target.value)}
                        value={feedback}
                    />
                </div>
                <button 
                    className={`submit-feedback-button ${feedback === '' ? 'disabled' : ''}`} 
                    onClick={() => handleSubmitFeedback()}
                    disabled={feedback === ''}>
                        Submit
                </button>
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