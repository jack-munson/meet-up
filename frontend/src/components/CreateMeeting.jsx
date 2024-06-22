import EditIcon from "../public/MeetUp-edit-icon.png"
import { useNavigate } from 'react-router-dom'
import React, { useState } from "react"
import axios from "axios"
import Select from 'react-select'
import "./CreateMeeting.css"
import { getAuth } from "firebase/auth"
import { DatePicker } from './DatePicker'
import { ToggleButton, ToggleButtonGroup } from "@mui/material"

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
    const [frequency, setFrequency] = useState('one-time')
    const [days, setDays] = useState([])
    const [dates, setDates] = useState([])
    const auth = getAuth()
    const user = auth.currentUser
    const navigate = useNavigate()

    const handleFrequencyChange = (event, newFreq) => {
        setFrequency(newFreq)
    }

    const toggleDay = (day) => {
        console.log(days)
        if (days.includes(day)) {
            setDays(days.filter((d) => d !== day))
        } else {
            setDays([...days, day])
        }
    }

    const handleDateChange = (newValue) => {
        setDates(newValue.map(date => date.toDate().getTime())); // Convert dates to timestamps
    }

    const handleCreate = async (e) => {
        e.preventDefault()

        const selectedDays = frequency === 'one-time' ? dates : days

        try {
            const meetingData = {
                userId: user.uid,
                title: meetingTitle,
                description: meetingDescription,
                startTime: startTime.value,
                endTime: endTime.value,
                frequency: frequency,
                days: selectedDays
            }
    
            const response = await axios.post('http://localhost:3000/api/create-meeting', meetingData)
    
            console.log('Meeting created successfully (CreateMeeting.jsx)')
            console.log(response.data.newMeeting)
            console.log(response.data.userMeetings)
            
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
            <input 
                onChange={(e) => {setMeetingTitle(e.target.value)}}
                className="meeting-title-input" 
                type="text" 
                maxLength="55"
                placeholder="Enter meeting title"
            />
            <div className="meeting-form">
                <div className="meeting-description">
                    <div className="meeting-description-text">What is your meeting about?</div>
                    <textarea 
                        onChange={(e) => {setMeetingDescription(e.target.value)}} 
                        className="meeting-description-input" 
                        type="text" 
                        placeholder="In this meeting we'll be discussing..."
                    />
                </div>
                
                <div className="meeting-frequency">
                    <div className="meeting-description-text">Is this a one-time or recurring meeting?</div>
                    <ToggleButtonGroup className="frequency-options" onChange={handleFrequencyChange} value={frequency} exclusive>
                        <ToggleButton className="frequency-option one-time" disableRipple value="one-time">One-time</ToggleButton>
                        <ToggleButton className="frequency-option recurring" disableRipple value="recurring">Recurring</ToggleButton>
                    </ToggleButtonGroup>
                </div>

                <div className="day-selection">
                    {frequency === 'one-time' ? (
                        <div className="meeting-description-text">What dates might work?</div>
                    ) : (
                        <div className="meeting-description-text">What days might work?</div>
                    )}
                    {frequency === 'one-time' ? (
                        <DatePicker handleDateChange={handleDateChange} dates={dates}/>
                    ) : (
                        <div className="days-of-the-week">
                            <div className={`day ${days.includes("sunday") ? "selected" : ""}`} onClick={() => toggleDay("sunday")}>S</div>
                            <div className={`day ${days.includes("monday") ? "selected" : ""}`} onClick={() => toggleDay("monday")}>M</div>
                            <div className={`day ${days.includes("tuesday") ? "selected" : ""}`} onClick={() => toggleDay("tuesday")}>T</div>
                            <div className={`day ${days.includes("wednesday") ? "selected" : ""}`} onClick={() => toggleDay("wednesday")}>W</div>
                            <div className={`day ${days.includes("thursday") ? "selected" : ""}`} onClick={() => toggleDay("thursday")}>T</div>
                            <div className={`day ${days.includes("friday") ? "selected" : ""}`} onClick={() => toggleDay("friday")}>F</div>
                            <div className={`day ${days.includes("saturday") ? "selected" : ""}`} onClick={() => toggleDay("saturday")}>S</div>
                        </div>
                    )}
                </div>

                <div className="meeting-time">
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
                </div>

            </div>
            <button type="button" onClick={(e) => {handleCreate(e)}} className="create-meeting-button">Create meeting</button>
        </div>
    )
}

{/* <div className={`create-meeting-box ${customClassName}`}>
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
</div> */}