import "./CreateMeeting.css"
import EditIcon from "../public/MeetUp-edit-icon.png"
import React, { useState } from "react"
import Select from 'react-select'

const times = [];
for (let hour = 0; hour < 24; hour++) {
    const ampm = hour < 12 ? 'am' : 'pm';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const timeString = `${hour12} ${ampm}`;
    times.push({ value: hour, label: timeString });
}

export function CreateMeeting(){
    const [meetingTitle, setMeetingTitle] = useState('')
    const [meetingDescription, setMeetingDescription] = useState('')
    const [startTime, setStartTime] = useState({ value: 9, label: '9 am' })
    const [endTime, setEndTime] = useState({ value: 17, label: '5 pm' })
    const [invites, setInvites] = useState([])
    const [recurring, setRecurring] = useState(false)

    const handleCheckboxChange = () => {
        setRecurring(!recurring); // Toggle the value of 'checked'
      };

    

    return (
        <div className="create-meeting-box">
            <div className="meeting-box-header">
                <input onChange={(e) => {setMeetingTitle(e.target.value)}} className="meeting-title-input" type="text" placeholder="Meeting Title"/>
                <img className="edit-icon" src={EditIcon} alt="Edit"/>
            </div>
            <form action="">
                <div className="meeting-description-text">What is your meeting about?</div>
                <textarea onChange={(e) => {setMeetingDescription(e.target.value)}} className="meeting-description-input" type="text" placeholder="In this meeting we'll be discussing..."/>
                <div className="meeting-description-text">What times would you like to meet between?</div>
                <div className="meeting-times">
                    <Select 
                        onChange={(e) => {setStartTime(e)}} 
                        className="meeting-time-input" 
                        classNamePrefix= "react-select" 
                        options={times} 
                        isSearchable={false} 
                        value={startTime}
                        menuPlacement="top">
                    </Select>
                    <div>to</div>
                    <Select 
                        onChange={(e) => {setEndTime(e)}} 
                        className="meeting-time-input" 
                        classNamePrefix= "react-select" 
                        options={times} 
                        isSearchable={false} 
                        value={endTime}
                        menuPlacement="top">
                    </Select>
                </div>
                <div className="meeting-description-text">Who would you like to invite?</div>
                <div className="invites">
                    <input className="invite-input" type="text" placeholder="email@domain.com"/>
                    <input className="invite-input" placeholder="email@domain.com"/>
                    <input className="invite-input" placeholder="email@domain.com"/>
                    <input className="invite-input" placeholder="email@domain.com"/>
                    <input className="invite-input" placeholder="email@domain.com"/>
                    <input className="invite-input" placeholder="email@domain.com"/>
                </div>
                <div className="meeting-recurring">
                    <input onChange={handleCheckboxChange} recurring={recurring} className="recurring-checkbox" type="checkbox"/>
                    <div>This meeting is recurring</div>
                </div>
                <button className="create-meeting-button">Create meeting</button>
            </form>
        </div>
    )
}