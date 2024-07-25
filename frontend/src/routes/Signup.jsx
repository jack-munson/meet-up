import { useState, useEffect } from "react"
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup} from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { Icon } from 'react-icons-kit'
import { eyeOff } from 'react-icons-kit/feather/eyeOff'
import { eye } from 'react-icons-kit/feather/eye'
import { Alert, Snackbar, styled } from "@mui/material"
import MainLogo from "../public/MeetUp-main-logo-green.svg"
import GoogleLogo from "../public/google-logo.webp"
import axios from "axios"
import "../styles/Authentication.css"

export function Signup() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [type, setType] = useState('password')
    const [icon, setIcon] = useState(eyeOff)
    const [inviteToken, setInviteToken] = useState('')
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [firstNameError, setFirstNameError] = useState(false)
    const [lastNameError, setLastNameError] = useState(false)
    const auth = getAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        if (token) {
            setInviteToken(token)
        }
    }, [location.search])

    async function handleSignUp(e) {
        e.preventDefault()
        let userId = ''

        try {
            if (firstName === "") {
                throw { code: "invalid-first-name" };
              }
              if (lastName === "") {
                throw { code: "invalid-last-name" };
              }
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            userId = userCredential.user.uid

            const userData = {
                userId: userId,
                firstName: firstName,
                lastName: lastName,
                email: email
            };
    
            const response = await axios.post('http://localhost:3000/api/create-user', userData);
            
            if (inviteToken) {
                handleInviteAcceptance(response.data, inviteToken)
            } else {
                navigate('/home')
            } 
        } catch (error) {
            console.log(error.code)
            if (error.code === "invalid-first-name") {
                setAlertOpen(false)
                setFirstNameError(true)
                setAlertMessage('First name field cannot be empty')
                setAlertOpen(true)
            } else if (error.code === "invalid-last-name") {
                setAlertOpen(false)
                setLastNameError(true)
                setAlertMessage('Last name field cannot be empty')
                setAlertOpen(true)
            } else if (error.code === "auth/invalid-email") {
                setAlertOpen(false)
                setEmailError(true)
                setAlertMessage('Inavid email')
                setAlertOpen(true)
            }
            else if (error.code === "auth/weak-password" || error.code === "auth/missing-password") {
                setAlertOpen(false)
                setPasswordError(true)
                setAlertMessage('Password should be at least 6 characters')
                setAlertOpen(true)
            } else if (error.code === "auth/email-already-in-use") {
                setAlertOpen(false)
                setEmailError(true)
                setAlertMessage('Email is already in use')
                setAlertOpen(true)
            } else {
                setAlertOpen(false)
                setAlertMessage('Error signing up')
                setAlertOpen(true)
            }
        }
    }

    async function handleGoogle(e) {
        e.preventDefault()
        const provider = new GoogleAuthProvider()
        try {
            const result = await signInWithPopup(auth, provider)
            const user = result.user

            const { uid, displayName, email} = user
            const [firstName, lastName] = displayName.split(' ')

            const userData = {
                userId: uid,
                firstName: firstName,
                lastName: lastName || '',
                email: email
            }

            const response = await axios.post('http://localhost:3000/api/create-user', userData)
            
            if (inviteToken) {
                handleInviteAcceptance(response.data, inviteToken)
            } else {
                navigate('/home')
            }
        } catch {
            console.error('Error during Google sign-in:', error)
        }
    }

    const handleInviteAcceptance = async (user, token) => {
        try {
            console.log("User: ", user)
            const name = user.firstName + ' ' + user.lastName
            
            await axios.post('http://localhost:3000/api/accept-invite', {
                userId: user.userId,
                email: user.email,
                name: name,
                token: token
            });
            navigate('/home');
        } catch (error) {
            console.error('Error accepting invite: ', error);
        }
    }

    const CustomAlert = styled(Alert)(({ theme }) => ({
        backgroundColor: '#DADADAD',
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
        } else if (input === "first") {
            setFirstNameError(false)
        } else if (input === "last") {
            setLastNameError(false)
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
            <form action="">
                <input 
                    onChange={(e) => {setFirstName(e.target.value)}} 
                    onFocus={() => handleFocus('first')}
                    type="text" 
                    placeholder="First name" 
                    className={`auth-input ${firstNameError ? "input-error" : ""}`}
                />
                <input 
                    onChange={(e) => {setLastName(e.target.value)}} 
                    onFocus={() => handleFocus('last')}
                    type="text" 
                    placeholder="Last name" 
                    className={`auth-input ${lastNameError ? "input-error" : ""}`}
                />
                <input 
                    onChange={(e) => {setEmail(e.target.value)}} 
                    onFocus={() => handleFocus('email')}
                    type="text" 
                    placeholder="email@domain.com"
                    className={`auth-input ${emailError ? "input-error" : ""}`}
                />
                <div className="input-container">
                    <input 
                        onChange={(e) => {setPassword(e.target.value)}} 
                        onFocus={() => handleFocus('password')}
                        type={type} 
                        placeholder="Password" 
                        className={`auth-input ${passwordError ? "input-error" : ""}`}
                    />
                    <Icon onClick={() => {handleToggle()}} icon={icon} className="eye-icon"/>
                </div>
                <button className="signup-button" style={{ marginBottom: '0px' }} type="button" onClick={(e) => {handleSignUp(e)}}>Sign Up</button>
                <span className="instruction-small">or continue with</span>
                <button className="signin-google-button" onClick={(e) => {handleGoogle(e)}}>
                    <img src={GoogleLogo} alt="Google logo" className="google-logo" />
                    Google
                </button>
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