import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth'
import { Icon } from 'react-icons-kit'
import { eyeOff } from 'react-icons-kit/feather/eyeOff'
import { eye } from 'react-icons-kit/feather/eye'
import MainLogo from "../public/MeetUp-main-logo.png"
import GoogleLogo from "../public/google-logo.webp"
import "../styles/Authentication.css"

export function Signin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [type, setType] = useState('password');
    const [icon, setIcon] = useState(eyeOff);
    const auth = getAuth()
    const navigate = useNavigate()

    async function handleSignIn(e) {
        e.preventDefault()
        signInWithEmailAndPassword(auth, email, password)
        .then((user) => {
            // Success
            console.log(user)
            navigate('/home')
        })
        .catch((error) => {
            console.log(error)
            if (error.code === "auth/invalid-email") {
                // "Invalid email, please try again"
            }
            else if (error.code == "auth/invalid-credential") {
                // "Those credentials do not match any known user. Please try again."
            }
            // Error
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
                navigate('/home')
            }
        })
        .catch((error) => {
            console.log(error)
        })
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
                <input onChange={(e) => {setEmail(e.target.value)}} type="text" placeholder="email@domain.com"/>
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