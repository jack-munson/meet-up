import {FrontHeader} from "../components/FrontHeader"
import {Footer} from "../components/Footer"
import { FiEdit } from "react-icons/fi"
import { MdOutlineMailOutline } from "react-icons/md"
import { TbPlaylistAdd } from "react-icons/tb"
import { FaRegCalendarCheck } from "react-icons/fa"
import CreatePage from "../public/create-page.png"
import InvitePage from "../public/invite-page.png"
import AddPage from "../public/add-page.png"
import SchedulePage from "../public/schedule-page.png"
import "../components/FrontHeader.css"
import "../styles/Front.css"
import { useState } from "react"

export function Front() {
    const [view, setView] = useState('create')

    return (
        <div className="front-page">
            <FrontHeader/>
            <div className="main-page-content">
                <div className="welcome-message">
                    <div className="welcome-text-main">Welcome to MeetUp!</div>
                    <div className="welcome-text-sub">We make group scheduling easy</div>
                </div>
                <div className="main-content">
                    <div className="step-buttons">
                        <div className={`step-button ${view === 'create' ? 'selected' : ''}`} onClick={() => setView('create')}>
                            <FiEdit size={25} className="step-icon"/>
                            <div className="step-text">Create</div>
                        </div>
                        <div className={`step-button ${view === 'invite' ? 'selected' : ''}`} onClick={() => setView('invite')}>
                            <MdOutlineMailOutline size={25} className="step-icon"/>
                            <div className="step-text">Invite</div>
                        </div>
                        <div className={`step-button ${view === 'add' ? 'selected' : ''}`} onClick={() => setView('add')}>
                            <TbPlaylistAdd size={27} className="step-icon"/>
                            <div className="step-text">Add</div>
                        </div>
                        <div className={`step-button ${view === 'schedule' ? 'selected' : ''}`} onClick={() => setView('schedule')}>
                            <FaRegCalendarCheck size={23} className="step-icon"/>
                            <div className="step-text">Schedule</div>
                        </div>
                    </div>
                    {view === 'create' &&
                        <div className="step-content">
                            <div className="step-sub-text"> 
                                Start by entering the details for your MeetUp event.
                            </div>
                            <img src={CreatePage} alt="Create" className="step-image"/>
                        </div>
                    }
                    {view === 'invite' &&
                        <div className="step-content">
                            <div className="step-sub-text"> 
                                Invite your friends, colleagues, or classmates to join by simply adding their email addresses.
                            </div>
                            <img src={InvitePage} alt="Create" className="step-image"/>
                        </div>
                    }
                    {view === 'add' &&
                        <div className="step-content">
                            <div className="step-sub-text"> 
                                Use our intuitive calendar to highlight your availability, making it easy for others to see when you're free.
                            </div>
                            <img src={AddPage} alt="Create" className="step-image"/>
                        </div>
                    }
                    {view === 'schedule' &&
                        <div className="step-content">
                            <div className="step-sub-text"> 
                                Find the best time to meet based on everyone's availability and schedule your meeting. It's that easy!
                            </div>
                            <img src={SchedulePage} alt="Create" className="step-image"/>
                        </div>
                    }
                </div>
            </div>
            <Footer/>
        </div>
    )
}