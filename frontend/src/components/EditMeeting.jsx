import { useEffect, useState } from "react"
import { DatePicker } from "./DatePicker"
import Select from 'react-select'
import { IoClose } from "react-icons/io5"
import "./EditMeeting.css"

const times = [];
for (let hour = 0; hour < 24; hour++) {
    const ampm = hour < 12 ? 'am' : 'pm';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const timeString = `${hour12} ${ampm}`;
    times.push({ value: hour, label: timeString });
}

const formatTimeFromHour = (time) => {
    const hours = Math.floor(time);
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const ampm = hours >= 12 ? 'pm' : 'am';
    return `${formattedHours} ${ampm}`;
}

export function EditMeeting({ onCancel, onSubmit, meetingDetails }) {
    const { id, title, description, frequency, days, start_time, end_time } = meetingDetails
    const [updatedTitle, setUpdatedTitle] = useState(title)
    const [updatedDescription, setUpdatedDescription] = useState(description)
    const [updatedDays, setUpdatedDays] = useState(days)
    const [updatedStartTime, setUpdatedStartTime] = useState({ value: parseInt(start_time), label: formatTimeFromHour(start_time) })
    const [updatedEndTime, setUpdatedEndTime] = useState({ value: parseInt(end_time), label: formatTimeFromHour(end_time)})
    const [titleError, setTitleError] = useState(false)
    const [daysError, setDaysError] = useState(false)
    const [errors, setErrors] = useState(false)

    useEffect(() => {
        if (updatedTitle.length === 0) {
            setTitleError(true)
            setErrors(true)
        } else {
            setTitleError(false)
        }

        if (updatedDays.length === 0) {
            setDaysError(true)
            setErrors(true)
        } else {
            setDaysError(false)
        }
    }, [updatedTitle, updatedDays])

    function getDateAsObject(dateString) {
        const [month, day] = dateString.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear();
        let date = new Date(currentYear, month - 1, day);
        
        if (date < now) {
            date.setFullYear(currentYear + 1);
        }
        console.log("date returned from getDateAsObject: ", date)
        return date;
    }

    const toggleDay = (day) => {
        if (updatedDays.includes(day)) {
            setUpdatedDays(updatedDays.filter((d) => d !== day))
        } else {
            setUpdatedDays([...updatedDays, day])
        }
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    }

    const handleDateChange = (newValue) => {
        console.log("newValue: ", newValue.map(date => formatDate(date)))
        setUpdatedDays(newValue.map(date => formatDate(date)))
    }
    
    return (
        <div className="edit-meeting-box">
            <div className='zoom-box-header'>
                <div className='zoom-box-title'>Edit MeetUp</div>
                <IoClose size={20} className='close-zoom-button' onClick={onCancel}/>
            </div>
            <div className='create-meeting-content'>
                <div className='meeting-title'>
                    <input 
                        onChange={(e) => {setUpdatedTitle(e.target.value)}}
                        className={`meeting-title-input ${titleError ? 'error' : ''}`}
                        type="text" 
                        maxLength="55"
                        value={updatedTitle}
                        placeholder="Enter meeting title"
                    />
                    {titleError && 
                        <div className='small-error-message'>Title field cannot be empty</div>
                    }
                </div>
                <div className="meeting-form">
                    <div className="meeting-description">
                        <div className="meeting-description-text">What is your meeting about?</div>
                        <textarea 
                            onChange={(e) => {setUpdatedDescription(e.target.value)}} 
                            className="meeting-description-input" 
                            type="text" 
                            value={updatedDescription}
                            placeholder={"In this meeting we'll be discussing..."}
                        />
                    </div>
                    <div className="day-selection">
                        {frequency === 'one-time' ? (
                            <div className="meeting-description-text">What dates might work?</div>
                        ) : (
                            <div className="meeting-description-text">What days might work?</div>
                        )}
                        {frequency === 'one-time' ? (
                            <DatePicker handleDateChange={handleDateChange} dates={updatedDays.map(day => getDateAsObject(day))} daysError={daysError}/>
                        ) : (
                            <div className="days-of-the-week">
                                <div className={`day ${updatedDays.includes("SUN") ? "selected" : ""}`} onClick={() => toggleDay("SUN")}>S</div>
                                <div className={`day ${updatedDays.includes("MON") ? "selected" : ""}`} onClick={() => toggleDay("MON")}>M</div>
                                <div className={`day ${updatedDays.includes("TUE") ? "selected" : ""}`} onClick={() => toggleDay("TUE")}>T</div>
                                <div className={`day ${updatedDays.includes("WED") ? "selected" : ""}`} onClick={() => toggleDay("WED")}>W</div>
                                <div className={`day ${updatedDays.includes("THU") ? "selected" : ""}`} onClick={() => toggleDay("THU")}>T</div>
                                <div className={`day ${updatedDays.includes("FRI") ? "selected" : ""}`} onClick={() => toggleDay("FRI")}>F</div>
                                <div className={`day ${updatedDays.includes("SAT") ? "selected" : ""}`} onClick={() => toggleDay("SAT")}>S</div>
                            </div>
                        )}
                        {daysError && 
                            <div className='small-error-message'>Please select at least one {frequency === 'one-time' ? "date" : "day"}</div>
                        }
                    </div>

                    <div className="meeting-time">
                        <div className="meeting-description-text">What times would you like to meet between?</div>
                        <div className="meeting-times">
                            <Select 
                                onChange={(e) => {setUpdatedStartTime(e)}} 
                                className="meeting-time-input" 
                                classNamePrefix= "react-select" 
                                options={times}
                                isSearchable={false} 
                                value={updatedStartTime}
                                menuPlacement="top"/>
                            <div>to</div>
                            <Select 
                                onChange={(e) => {setUpdatedEndTime(e)}} 
                                className="meeting-time-input" 
                                classNamePrefix= "react-select" 
                                options={times} 
                                isSearchable={false} 
                                value={updatedEndTime}
                                menuPlacement="top"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className='create-meeting'>
                <button 
                    type="button" 
                    onClick={() => onSubmit({
                        id: id, 
                        newTitle: updatedTitle,
                        newDescription: updatedDescription,
                        newDays: updatedDays,
                        newStartTime: updatedStartTime.value,
                        newEndTime: updatedEndTime.value
                    })} 
                    className={`create-meeting-button ${daysError || titleError ? 'disabled' : ''}`}
                    disabled={daysError || titleError}
                >
                    Update meeting
                </button>
                {(daysError || titleError) && 
                    <div className='small-error-message'>Fix errors before continuing</div>
                }
            </div>
        </div>
    )
}