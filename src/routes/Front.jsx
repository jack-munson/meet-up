import { FrontHeader } from "../components/FrontHeader"
import { CreateMeeting } from "../components/CreateMeeting"
import "../components/FrontHeader.css"
import "../styles/Front.css"

export function Front() {
    return (
        <div className="front-page">
            <FrontHeader></FrontHeader>
            <div className="page-content">
                <div className="welcome-message">
                    Welcome
                </div>
                <CreateMeeting></CreateMeeting>
            </div>
        </div>
    )
}