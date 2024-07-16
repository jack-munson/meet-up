import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState } from "react"
import axios from "axios"
import Select from 'react-select'
import "./CreateMeeting.css"
import { getAuth } from "firebase/auth"
import { DatePicker } from './DatePicker'
import { ToggleButton, ToggleButtonGroup } from "@mui/material"
import { IoClose } from "react-icons/io5"

const times = [];
for (let hour = 0; hour < 24; hour++) {
    const ampm = hour < 12 ? 'am' : 'pm';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const timeString = `${hour12} ${ampm}`;
    times.push({ value: hour, label: timeString });
}

export function CreateMeeting({ onCreateSuccess, onCancel }){
    const [meetingTitle, setMeetingTitle] = useState('')
    const [meetingDescription, setMeetingDescription] = useState('')
    const [startTime, setStartTime] = useState({ value: 9, label: '9 am' })
    const [endTime, setEndTime] = useState({ value: 17, label: '5 pm' })
    const [frequency, setFrequency] = useState('one-time')
    const [days, setDays] = useState([])
    const [dates, setDates] = useState([])
    const [errors, setErrors] = useState(false)
    const [titleError, setTitleError] = useState(false)
    const [daysError, setDaysError] = useState(false)
    const auth = getAuth()
    const user = auth.currentUser
    const navigate = useNavigate()

    const handleFrequencyChange = (event, newFreq) => {
        setFrequency(newFreq)
    }

    const toggleDay = (day) => {
        if (daysError) {
            setDaysError(false)
        }
        if (days.includes(day)) {
            setDays(days.filter((d) => d !== day))
        } else {
            setDays([...days, day])
        }
    }

    useEffect(() => {
        if (!titleError && !daysError) {
            setErrors(false)
        }
    }, [titleError, daysError])

    const handleFocus = (input) => {
        if (input === "title") {
          setTitleError(false);
        } else if (input === "days") {
          setDaysError(false);
        }
    };

    const handleDateChange = (newValue) => {
        if (daysError) {
            setDaysError(false)
        }
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

        if (meetingTitle === '' || selectedDays.length === 0) {
            if (meetingTitle === '') {
                setErrors(true)
                setTitleError(true)
            } 
            if (selectedDays.length === 0) {
                setErrors(true)
                setDaysError(true)
            }
            return
        }

        try {
            const nameInfo = await axios.get('http://localhost:3000/api/get-user-name', { 
                params: { userId: user.uid }
            })
            const firstName = nameInfo.data.firstName
            const lastName = nameInfo.data.lastName
            const name = firstName + ' ' + lastName
            const meetingData = {
                userId: user.uid,
                title: meetingTitle,
                description: meetingDescription,
                startTime: startTime.value,
                endTime: endTime.value,
                frequency: frequency,
                days: selectedDays,
                accepted: {
                    [user.uid]: {
                        name: name,
                        email: user.email
                    }
                }
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
        <div className="create-meeting-box">
            {onCancel && 
                <div className='zoom-box-header'>
                    <div className='zoom-box-title'>Create MeetUp</div>
                    <IoClose size={20} className='close-zoom-button' onClick={onCancel}/>
                </div>
            }
            <div className='create-meeting-content'>
                <div className='meeting-title'>
                    <input 
                        onChange={(e) => {setMeetingTitle(e.target.value)}}
                        onFocus={() => handleFocus('title')}
                        className="meeting-title-input" 
                        type="text" 
                        maxLength="55"
                        placeholder="Enter meeting title"
                    />
                    {titleError && 
                        <div className='small-error-message'>Please enter a title for your meeting</div>
                    }
                </div>
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
                        {daysError && 
                            <div className='small-error-message'>Please select {frequency === 'one-time' ? "dates" : "days"}</div>
                        }
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
                                menuPlacement="top"/>
                            <div>to</div>
                            <Select 
                                onChange={(e) => {setEndTime(e)}} 
                                className="meeting-time-input" 
                                classNamePrefix= "react-select" 
                                options={times} 
                                isSearchable={false} 
                                value={endTime}
                                menuPlacement="top"/>
                        </div>
                    </div>

                </div>
            </div>
            <div className='create-meeting'>
                <button 
                    type="button" 
                    onClick={(e) => {handleCreate(e)}} 
                    className={`create-meeting-button ${errors ? 'disabled' : ''}`}
                    disabled={errors}
                >
                    Create meeting
                </button>
                {errors && 
                    <div className='small-error-message'>Fix errors before continuing</div>
                }
            </div>
        </div>
    )
}