import { useState, useEffect } from "react"
import { useNavigate, useLocation } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth'
import { Icon } from 'react-icons-kit'
import { eyeOff } from 'react-icons-kit/feather/eyeOff'
import { eye } from 'react-icons-kit/feather/eye'
import { Alert, Snackbar, styled } from "@mui/material"
import MainLogo from "../public/MeetUp-main-logo-green.svg"
import GoogleLogo from "../public/google-logo.webp"
import axios from "axios"
import "../styles/Authentication.css"

export function Signin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [type, setType] = useState('password')
    const [icon, setIcon] = useState(eyeOff)
    const [inviteToken, setInviteToken] = useState('')
    const [meetingTitle, setMeetingTitle] = useState('')
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const auth = getAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        if (token) {
            setInviteToken(token)
            const fetchMeetingTitle = async () => {
                const response = await axios.get(`http://localhost:3000/api/get-meeting-details`, {
                params: { token: token }
                })
                setMeetingTitle(response.data.meeting.title)
            }
            fetchMeetingTitle()
        }
    }, [location.search])

    async function handleSignIn(e) {
        e.preventDefault()
        signInWithEmailAndPassword(auth, email, password)
        .then((user) => {
            console.log(user)
            if (inviteToken) {
                handleInviteAcceptance(user.user, inviteToken, "Firebase")
            }
            else {
                navigate('/home')
            }
        })
        .catch((error) => {
            console.log(error)
            if (error.code === "auth/invalid-email") {
                setAlertOpen(false)
                setEmailError(true)
                setAlertMessage('Inavid email')
                setAlertOpen(true)
            }
            else if (error.code == "auth/invalid-credential") {
                setAlertOpen(false)
                setEmailError(true)
                setPasswordError(true)
                setAlertMessage('Those credentials do not match any known users')
                setAlertOpen(true)
            } else if (error.code === "auth/missing-password") {
                setAlertOpen(false)
                setAlertMessage('Please enter your password')
                setPasswordError(true)
                setAlertOpen(true)
            } else {
                setAlertOpen(false)
                setAlertMessage("Error signing in")
                setAlertOpen(true)
            }
        })
    }

    async function handleGoogle(e) {
        e.preventDefault()
        const provider = new GoogleAuthProvider()
        signInWithPopup(auth, provider)
        .then(function (result) {
            const user = result.user
            const additionUserInfo = getAdditionalUserInfo(result)
            if (additionUserInfo.isNewUser) {
                if (inviteToken) {
                    navigate(`/signup?token=${inviteToken}`)
                } else {
                    navigate('/signup')
                }
            }
            else {
                if (inviteToken) {
                    handleInviteAcceptance(user, inviteToken, "Google");
                } else {
                    navigate('/home');
                }
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    const handleInviteAcceptance = async (user, token, method) => {
        if (method === "Google") {
            const { uid, displayName, email} = user

            try {
                await axios.post('http://localhost:3000/api/accept-invite', {
                    userId: uid,
                    email: email,
                    name: displayName,
                    token: token
                });
                navigate('/home');
            } catch (error) {
                console.error('Error accepting invite: ', error);
            }
        } else {
            const { uid, email } = user
            console.log(user)
            console.log("uid: ", uid)
            const response = await axios.get('http://localhost:3000/api/get-user-name', { 
                params: { userId: uid }
            })
            const firstName = response.firstName
            const lastName = response.lastName
            const name = firstName + ' ' + lastName

            try {
                await axios.post('http://localhost:3000/api/accept-invite', {
                    userId: uid,
                    email: email,
                    name: name,
                    token: token
                });
                navigate('/home');
            } catch (error) {
                console.error('Error accepting invite: ', error);
            }
        }
    }

    const CustomAlert = styled(Alert)(({ theme }) => ({
        backgroundColor: '#DA2A2A',
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

    const handleFocus = (input) => {
        if (input === "email") {
          setEmailError(false);
        } else if (input === "password") {
          setPasswordError(false);
        }
    };

    const handleToggle = () => {
        if (type==='password'){
           setIcon(eye);
           setType('text')
        } else {
           setIcon(eyeOff)
           setType('password')
        }
    }



    return (
        <div className="auth-box">
            <img className="auth-logo" onClick={() => navigate("/")} src={MainLogo} alt="MeetUp logo"></img>
            {inviteToken && (
                <div className="invitation-text">
                    <div className="invited-text">You have been invited to join</div>
                    <div className="invited-meeting-title">{meetingTitle}</div>
                </div>
            )}
            <form action="">
                <input 
                    onChange={(e) => {setEmail(e.target.value)}}
                    onFocus={() => handleFocus("email")} 
                    type="email" 
                    placeholder="email@domain.com" 
                    className={`auth-input ${emailError ? "input-error" : ""}`}
                />
                <div className="input-container">
                    <input 
                        onChange={(e) => {setPassword(e.target.value)}} 
                        onFocus={() => handleFocus("password")}
                        type={type} 
                        placeholder="Password" 
                        className={`auth-input ${passwordError ? "input-error" : ""}`}
                    />
                    <Icon onClick={() => {handleToggle()}} icon={icon} className="eye-icon"/>
                </div>
                <button className="signin-button" type="button" onClick={(e) => {handleSignIn(e)}}>Sign In</button>
                <span className="instruction-small">or continue with</span>
                <button className="signin-google-button" style={{ marginBottom: '25px' }} onClick={(e) => {handleGoogle(e)}}>
                    <img src={GoogleLogo} alt="Google logo" className="google-logo" />
                    Google
                    </button>
                <span className="instruction-medium">Don't have an account?</span>
                <button className="signup-button" onClick={() => navigate(inviteToken ? `/signup?token=${inviteToken}` : "/signup")}>Sign up</button>
            </form>
            <Snackbar
                open={alertOpen}
                autoHideDuration={5000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <CustomAlert onClose={handleClose} severity="error" sx={{ width: '100%' }} variant="filled">
                    {alertMessage}
                </CustomAlert>
            </Snackbar>
        </div>
    )
}