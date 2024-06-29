import {FrontHeader} from "../components/FrontHeader"
import {Footer} from "../components/Footer"
import {CreateMeeting} from "../components/CreateMeeting"
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
                <div className="main-content">
                    <div className="how-to">
                        <div className="how-to-heading">How it works</div>
                        <div className="how-to-steps">
                            <div className="step">
                                <div className="step-number">1.</div>
                                <div className="step-text">Create a MeetUp event</div>
                            </div>
                            <div className="step">
                                <div className="step-number">2.</div>
                                <div className="step-text">Invite attendees and input availability</div>
                            </div>
                            <div className="step">
                                <div className="step-number">3.</div>
                                <div className="step-text">Let our alogorithm find the best time</div>
                            </div>
                        </div>
                    </div>
                    <CreateMeeting></CreateMeeting>
                </div>
            </div>
            <Footer/>
        </div>
    )
}