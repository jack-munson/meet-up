import { useState, useEffect } from "react"
import { useNavigate, useLocation } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth'
import { Icon } from 'react-icons-kit'
import { eyeOff } from 'react-icons-kit/feather/eyeOff'
import { eye } from 'react-icons-kit/feather/eye'
import MainLogo from "../public/MeetUp-main-logo.png"
import GoogleLogo from "../public/google-logo.webp"
import axios from "axios"
import "../styles/Authentication.css"

export function Signin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [type, setType] = useState('password');
    const [icon, setIcon] = useState(eyeOff);
    const auth = getAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [inviteToken, setInviteToken] = useState('')

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        if (token) {
            setInviteToken(token);
        }
    }, [location.search])

    async function handleSignIn(e) {
        e.preventDefault()
        signInWithEmailAndPassword(auth, email, password)
        .then((user) => {
            console.log(user)
            if (inviteToken) {
                handleInviteAcceptance(user.user, inviteToken)
            }
            else {
                navigate('/home')
            }
        })
        .catch((error) => {
            console.log(error)
            if (error.code === "auth/invalid-email") {
                alert("Invalid email, please try again")
            }
            else if (error.code == "auth/invalid-credential") {
                alert("Those credentials do not match any known user. Please try again.")
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
                navigate('/signup')
            }
            else {
                if (inviteToken) {
                    handleInviteAcceptance(user, inviteToken);
                } else {
                    navigate('/home');
                }
            }
        })
        .catch((error) => {
            console.log(error)
        })
    }

    async function handleInviteAcceptance(user, token) {
        try {
            console.log("User: ", user)
            console.log(user.uid)
            await axios.post('http://localhost:3000/api/accept-invite', {
                userId: user.uid,
                token: token
            });
            navigate('/home');
        } catch (error) {
            console.error('Error accepting invite: ', error);
        }
    }

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
                <input onChange={(e) => {setEmail(e.target.value)}} type="email" placeholder="email@domain.com"/>
                <div className="input-container">
                    <input onChange={(e) => {setPassword(e.target.value)}} type={type} placeholder="Password"></input>
                    <Icon onClick={() => {handleToggle()}} icon={icon} className="eye-icon"/>
                </div>
                <button className="signin-button" type="button" onClick={(e) => {handleSignIn(e)}}>Sign In</button>
                <span className="instruction-small">or continue with</span>
                <button className="signin-google-button" onClick={(e) => {handleGoogle(e)}}>
                    <img src={GoogleLogo} alt="Google logo" className="google-logo" />
                    Google
                    </button>
                <span className="instruction-medium">Don't have an account?</span>
                <button className="signup-button" onClick={() => navigate("/signup")}>Sign up</button>
            </form>
        </div>
    )
}