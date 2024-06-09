import { useState } from "react"
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup} from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { Icon } from 'react-icons-kit'
import { eyeOff } from 'react-icons-kit/feather/eyeOff'
import { eye } from 'react-icons-kit/feather/eye'
import MainLogo from "../public/MeetUp-main-logo.png"
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
    const userId = '';
    const auth = getAuth();
    const navigate = useNavigate()

    async function handleSignUp(e) {
        e.preventDefault()
        let userId = ''

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            userId = userCredential.user.uid

            const userData = {
                userId: userId,
                firstName: firstName,
                lastName: lastName,
                email: email
            };
    
            const response = await axios.post('http://localhost:3000/api/create-user', userData);
            
            navigate('/home'); 
        } catch (error) {
            alert('Error signing up. Please try again later.');
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

            navigate('/home')
        } catch {
            console.error('Error during Google sign-in:', error)
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
                <input onChange={(e) => {setFirstName(e.target.value)}} type="text" placeholder="First name"/>
                <input onChange={(e) => {setLastName(e.target.value)}} type="text" placeholder="Last name"/>
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
            </form>
        </div>
    )
}