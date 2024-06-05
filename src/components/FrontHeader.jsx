import "./FrontHeader.css"
import MainLogo from "../public/MeetUp-main-logo-white.png"
import { useNavigate } from 'react-router-dom'

export function FrontHeader(){
    const navigate = useNavigate()

    return (
        <div className="banner">
            <img src={MainLogo} className="header-logo" alt="MeetUp logo" />
            <div className = "nav-buttons">
                <div className="menu-button" >HOW TO USE</div>
                <div className="menu-button" onClick={() => navigate("/signup")}>SIGN UP</div>
                <div className="menu-button" onClick={() => navigate("/signin")}>SIGN IN</div>
            </div>
        </div>
    )
}