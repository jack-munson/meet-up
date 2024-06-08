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
                    <div className="welcome-text-main">Welcome to</div>
                    <div className="welcome-text-main" style={{ color: "#0040B4" }}>MeetUp!</div>
                    <div className="welcome-text-sub">We make group scheduling easy</div>
                    <div className="welcome-message-text-steps">
                        <div className="message-step">
                            <div className="step-number">1.</div>
                            <div className="step-messages">
                                <div className="step-message">Create a meeting and invite</div>
                                <div className="step-message">the attendees.</div>
                            </div>
                        </div>
                        <div className="message-step">
                            <div className="step-number">2.</div>
                            <div className="step-messages">
                                <div className="step-message">Once everyone has input </div>
                                <div className="step-message">their availability, let our </div>
                                <div className="step-message">algorithm find the best time </div>
                                <div className="step-message">for your group to meet.</div>
                            </div>
                        </div>
                        <div className="message-step">
                            <div className="step-number">3.</div>
                            <div className="step-messages">
                                <div className="step-message">Choose a time and generate </div>
                                <div className="step-message">a Zoom or GoogleMeet link </div>
                                <div className="step-message">right from MeetUp.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <CreateMeeting></CreateMeeting>
            </div>
        </div>
    )
}