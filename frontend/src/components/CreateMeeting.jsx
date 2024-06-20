import EditIcon from "../public/MeetUp-edit-icon.png"
import { useNavigate } from 'react-router-dom'
import React, { useState } from "react"
import axios from "axios"
import Select from 'react-select'
import "./CreateMeeting.css"
import { getAuth } from "firebase/auth"
import { DatePicker } from './DatePicker'

const times = [];
for (let hour = 0; hour < 24; hour++) {
    const ampm = hour < 12 ? 'am' : 'pm';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const timeString = `${hour12} ${ampm}`;
    times.push({ value: hour, label: timeString });
}

export function CreateMeeting({customClassName, onCreateSuccess}){
    const [meetingTitle, setMeetingTitle] = useState('')
    const [meetingDescription, setMeetingDescription] = useState('')
    const [startTime, setStartTime] = useState({ value: 9, label: '9 am' })
    const [endTime, setEndTime] = useState({ value: 17, label: '5 pm' })
    const [invites, setInvites] = useState(['', '', '', '', '', '', '', ''])
    const [recurring, setRecurring] = useState(false)
    const [showTitleError, setShowTitleError] = useState(false)
    const [showDescriptionError, setShowDescriptionError] = useState(false)
    const [showInvitesError, setShowInvitesError] = useState(false)
    const auth = getAuth()
    const user = auth.currentUser
    const navigate = useNavigate()

    const handleNewInvite = (index, email) => {
        const newInvites = [...invites]
        newInvites[index] = email
        setInvites(newInvites)
    }

    const handleCheckboxChange = () => {
        setRecurring(!recurring)
    }

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!meetingTitle) {
            setShowTitleError(true);
            return;
        } else {
            setShowTitleError(false);
        }

        if (!meetingDescription) {
            setShowDescriptionError(true);
            return;
        } else {
            setShowDescriptionError(false);
        }

        const filteredInvites = invites.filter(email => email);
        if (filteredInvites.length === 0) {
            alert("At least one invitee is required")
            return;
        }

        try {
            const meetingData = {
                userId: user.uid,
                title: meetingTitle,
                description: meetingDescription,
                startTime: startTime.label,
                endTime: endTime.label,
                invites: filteredInvites,
                recurring: recurring
            }
    
            const response = await axios.post('http://localhost:3000/api/create-meeting', meetingData)
    
            console.log('Meeting created successfully (CreateMeeting.jsx)')
            
            if (onCreateSuccess) {
                onCreateSuccess(response.data.newMeeting)
            }
            navigate('/home');
        } catch (error) {
            console.error('Error creating meeting (CreateMeeting.jsx):', error)
        }
    }
    
    

    return (
        <div className={`create-meeting-box ${customClassName}`}>
            <div className={`meeting-box-header ${showTitleError ? 'error' : ''}`}>
                <input 
                    onChange={(e) => {setMeetingTitle(e.target.value); setShowTitleError(!e.target.value.trim())}}
                    className="meeting-title-input" 
                    type="text" 
                    maxLength="55"
                    placeholder="Meeting Title"
                />
                {showTitleError && (
                    <span className="error-tooltip">Meeting title is required</span>
                )}
                <img className="edit-icon" src={EditIcon} alt="Edit"/>
            </div>
            <form action="" className="meeting-form">
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
                    {invites.map((email, index) => (
                        <input
                            key={index}
                            className="invite-input"
                            type="text"
                            placeholder="email@domain.com"
                            value={email}
                            onChange={(e) => handleNewInvite(index, e.target.value)}
                        />
                    ))}
                </div>
                <div className="meeting-recurring">
                    <input onChange={handleCheckboxChange} recurring={recurring} className="recurring-checkbox" type="checkbox"/>
                    <div className="meeting-description-text" style={{ marginTop: '0px', marginLeft: '0px' }}>This meeting is recurring</div>
                </div>
                <button type="button" onClick={(e) => {handleCreate(e)}} className="create-meeting-button">Create meeting</button>
            </form>
        </div>
    )
}