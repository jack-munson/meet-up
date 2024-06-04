import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth'
import MainLogo from "../public/MeetUp-main-logo.png"
import "../styles/Authentication.css"

export function Signin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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

    return (
        <div className="auth-box">
            <form action="">
                <img className="auth-logo" src={MainLogo} alt="MeetUp logo"></img>
                <input onChange={(e) => {setEmail(e.target.value)}} type="text" placeholder="email@domain.com"/>
                <input onChange={(e) => {setPassword(e.target.value)}} type="text" placeholder="Password"/>
                <button className="signin-button" type="button" onClick={(e) => {handleSignIn(e)}}>Sign In</button>
                <span className="instruction-small">or continue with</span>
                <button className="signin-google-button" onClick={(e) => {handleGoogle(e)}}>Google</button>
                <span className="instruction-medium">Don't have an account?</span>
                <button className="signup-button">Sign up</button>
            </form>
        </div>
    )
}