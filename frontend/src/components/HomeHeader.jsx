import "./FrontHeader.css"
import MainLogo from "../public/MeetUp-main-logo-white.png"
import { useNavigate } from 'react-router-dom'
import { getAuth, signOut} from "firebase/auth"

export function HomeHeader(){
    const auth = getAuth()
    const navigate = useNavigate()

    async function handleSignOut(e) {
        e.preventDefault()
        try {
            await signOut(auth);
        }
        catch (e) {
            console.log(e)
        }
    }

    return (
        <div className="banner">
            <img src={MainLogo} className="header-logo" alt="MeetUp logo" onClick={() => navigate("/")}/>
            <div className = "nav-buttons">
                <div className="menu-button" onClick={() => navigate("/home")}>MEETINGS</div>
                <div className="menu-button" onClick={() => navigate("/profile")}>PROFILE</div>
                <div className="menu-button" onClick={(e) => {handleSignOut(e)}}>SIGN OUT</div>
            </div>
        </div>
    )
}