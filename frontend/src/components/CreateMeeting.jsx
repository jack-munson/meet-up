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
        setDates(newValue.map(date => date.toDate().getTime()))
    }

    const formatDate = (timestamp) => {
        const date = new Date(parseInt(timestamp));
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
      }

    const handleCreate = async (e) => {
        e.preventDefault()

        const selectedDays = []
        if (frequency === 'one-time') {
            dates.forEach(date => selectedDays.push(formatDate(date)))
        } else {
            selectedDays.push(...days)
        }

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
                            <div className={`day ${days.includes("SUN") ? "selected" : ""}`} onClick={() => toggleDay("SUN")}>S</div>
                            <div className={`day ${days.includes("MON") ? "selected" : ""}`} onClick={() => toggleDay("MON")}>M</div>
                            <div className={`day ${days.includes("TUE") ? "selected" : ""}`} onClick={() => toggleDay("TUE")}>T</div>
                            <div className={`day ${days.includes("WED") ? "selected" : ""}`} onClick={() => toggleDay("WED")}>W</div>
                            <div className={`day ${days.includes("THU") ? "selected" : ""}`} onClick={() => toggleDay("THU")}>T</div>
                            <div className={`day ${days.includes("FRI") ? "selected" : ""}`} onClick={() => toggleDay("FRI")}>F</div>
                            <div className={`day ${days.includes("SAT") ? "selected" : ""}`} onClick={() => toggleDay("SAT")}>S</div>
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