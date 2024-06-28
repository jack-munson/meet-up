import { FrontHeader } from "../components/FrontHeader"
import { CreateMeeting } from "../components/CreateMeeting"
import "../components/FrontHeader.css"
import "../styles/Front.css"

export function Front() {
    return (
        <div className="front-page">
            <FrontHeader/>
            <div className="page-content">
                <div className="welcome-message">
                    <div className="welcome-text-main">Welcome to MeetUp!</div>
                    <div className="welcome-text-sub">We make group scheduling easy</div>
                </div>
                <CreateMeeting></CreateMeeting>
            </div>
        </div>
    )
}