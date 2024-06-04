import { useState } from "react"
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup} from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { Icon } from 'react-icons-kit'
import { eyeOff } from 'react-icons-kit/feather/eyeOff'
import { eye } from 'react-icons-kit/feather/eye'
import MainLogo from "../public/MeetUp-main-logo.png"
import GoogleLogo from "../public/google-logo.webp"
import "../styles/Authentication.css"

export function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [type, setType] = useState('password');
    const [icon, setIcon] = useState(eyeOff);
    const auth = getAuth()
    const navigate = useNavigate()

    async function handleSignUp(e) {
        e.preventDefault()
        createUserWithEmailAndPassword(auth, email, password)
        .then((user) => {
            // Success...
            navigate("/home")
            console.log(user)
        })
        .catch((error) => {
            // Error
            console.log(error)
        })
    }

    async function handleGoogle(e) {
        e.preventDefault()
        const provider = new GoogleAuthProvider()
        signInWithPopup(auth, provider)
        .then(function (result) {
            const user = result.user
            navigate('/home')
            console.log(user)
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
            <img className="auth-logo" src={MainLogo} alt="MeetUp logo"></img>
            <form action="">
                <input onChange={(e) => {setEmail(e.target.value)}} type="text" placeholder="email@domain.com"/>
                <div className="input-container">
                    <input onChange={(e) => {setPassword(e.target.value)}} type={type} placeholder="Password"/>
                    <Icon onClick={() => {handleToggle()}} icon={icon} className="eye-icon"/>
                </div>
                <button className="signup-button" style={{ marginBottom: '0px' }} type="button" onClick={(e) => {handleSignUp(e)}}>Sign Up</button>
                <span className="instruction-small">or continue with</span>
                <button className="signin-google-button" onClick={(e) => {handleGoogle(e)}}>
                    <img src={GoogleLogo} alt="Google logo" className="google-logo" />
                    Google
                </button>
                <span className="instruction-medium">Already have an account?</span>
                <button className="signin-button" style={{ marginBottom: '20px' }} onClick={() => navigate("/signin")}>Sign in</button>
            </form>
        </div>
    )
}