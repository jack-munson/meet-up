import "./FrontHeader.css"
import MainLogo from "../public/MeetUp-main-logo-white.png"
import { useNavigate } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from "firebase/auth"

export function FrontHeader(){
    const auth = getAuth()
    const navigate = useNavigate()

    const checkSignIn = () => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Already signed in");
                navigate('/home');
            } else {
                navigate('/signin');
            }
        });
    };

    return (
        <div className="banner">
            <img src={MainLogo} className="header-logo" alt="MeetUp logo"/>
            <div className = "nav-buttons">
                <div className="menu-button" >HOW TO USE</div>
                <div className="menu-button" onClick={() => navigate("/signup")}>SIGN UP</div>
                <div className="menu-button" onClick={() => {checkSignIn()}}>SIGN IN</div>
            </div>
        </div>
    )
}