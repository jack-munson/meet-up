import React, { useState, useEffect } from 'react'
import moment from 'moment-timezone'
import { AvailabilityViewer } from './AvailabilityViewer'
import SuggestedIcon from '../public/MeetUp-sparkle-icon.svg'
import TimezoneSelect from 'react-timezone-select'
import { DateTime } from 'luxon'
import { SiGooglecalendar } from "react-icons/si"
import { SiZoom } from "react-icons/si"
import { FaRedoAlt } from "react-icons/fa"
import { FaRegCopy } from "react-icons/fa6"
import { IoClose } from "react-icons/io5"
import { IoChevronForward } from "react-icons/io5"
import { IoChevronBack } from "react-icons/io5"
import { Alert, Snackbar, styled } from "@mui/material"
import './AvailabilityCalendar.css'
import axios from 'axios'

export function AvailabilityCalendar({ userId, admin, title, description, invites, days, frequency, display, availability, updateSelectedSlots, startTime, endTime, meetingStart, meetingEnd, updateMeetingTimes, accepted, flashEditButton, isScheduling }) {
    const [selectedSlots, setSelectedSlots] = useState(new Set());
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startSlot, setStartSlot] = useState(null);
    const [currentTempSlots, setCurrentTempSlots] = useState(new Set());
    const [isDeselecting, setIsDeselecting] = useState(false);
    const [groupAvailability, setGroupAvailability] = useState({});
    const [bestMeetingTimes, setBestMeetingTimes] = useState(new Set());
    const [available, setAvailable] = useState([]);
    const [meetingStartSlot, setMeetingStartSlot] = useState(null);
    const [meetingEndSlot, setMeetingEndSlot] = useState(null);
    const [zoomAccessToken, setZoomAccessToken] = useState(null)
    const [isCreateZoomMeetingOpen, setIsCreateZoomMeetingOpen] = useState(false)
    const [zoomJoinURL, setZoomJoinURL] = useState('')
    const [isJoinURLDisplayed, setIsJoinURLDisplayed] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [selectedTimezone, setSelectedTimezone] = useState({
        abbrev: "EDT",
        altName: "Eastern Daylight Time",
        label: "(GMT-4:00) Eastern Time",
        offset: -4,
        value: "America/Detroit"
    })
    const [startIndex, setStartIndex] = useState(0)

    const handlePrev = () => {
        setStartIndex((prevIndex) => Math.max(prevIndex - 7, 0));
    };

    const handleNext = () => {
        setStartIndex((prevIndex) => Math.min(prevIndex + 7, days.length - 7));
    };

    const findBestTimes = (availability) => {
        let maxCount = 0; 
        for (const availableArr of Object.values(availability)) {
            if (availableArr.length > maxCount) {
                maxCount = availableArr.length
            }
        }

        const bestSlots = new Set()
        for (const [slot, availableArr] of Object.entries(availability)) {
            if (availableArr.length == maxCount) {
                bestSlots.add(slot)
            }
        }

        return bestSlots
    }
    
    useEffect(() => {
        if (display === 'all') {
            let availableSlots = {};
            for (const [userId, value] of Object.entries(availability)) {
                for (const slot of value) {
                    if (!availableSlots[slot]) {
                        availableSlots[slot] = [];
                    }
                    availableSlots[slot].push(userId);
                }
            }
            console.log(availableSlots)
            setGroupAvailability(availableSlots);
        } else {
            setSelectedSlots(new Set(availability[userId]));
        }
    }, [display, availability]);

    useEffect(() => {
        const bestTimes = findBestTimes(groupAvailability);
        setBestMeetingTimes(bestTimes);
    }, [groupAvailability]);

    useEffect(() => {
        updateSelectedSlots(selectedSlots);
    }, [selectedSlots]);

    useEffect(() => {
        if (isScheduling) {
            updateMeetingTimes(meetingStartSlot, meetingEndSlot)
        }
    }, [meetingStartSlot, meetingEndSlot])

    useEffect(() => {
        setMeetingStartSlot(meetingStart);
        setMeetingEndSlot(meetingEnd);
    }, [meetingStart, meetingEnd]);

    useEffect(() => {
        const handleResize = () => {
            if (meetingStartSlot && meetingEndSlot) {
                const startSlotElement = document.querySelector(`[data-slot="${meetingStartSlot}"]`);
                const endSlotElement = document.querySelector(`[data-slot="${meetingEndSlot}"]`);

                if (startSlotElement && endSlotElement) {
                    console.log("Start and end slots")
                    const top = startSlotElement.offsetTop;
                    const left = startSlotElement.offsetLeft;
                    const width = endSlotElement.offsetWidth;
                    const height = endSlotElement.offsetTop + endSlotElement.offsetHeight - top - 1;

                    const meetingBlock = document.querySelector('.meeting-block');
                    if (meetingBlock) {
                        console.log("Meeting block")
                        meetingBlock.style.display = 'block'
                        meetingBlock.style.top = `${top}px`;
                        meetingBlock.style.left = `${left}px`;
                        meetingBlock.style.height = `${height}px`;
                        meetingBlock.style.width = `${width}px`;
                    }
                } else {
                    const meetingBlock = document.querySelector('.meeting-block');

                    if (meetingBlock) {
                        meetingBlock.style.display = 'none';
                    }
                }
            }
        };

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [meetingStartSlot, meetingEndSlot, days, startIndex])

    let times = [];
    for (let i = parseInt(startTime) * 2; i < parseInt(endTime) * 2; i++) {
        times.push(i / 2);
    }

    const formatTime = (time) => {
        const hours = Math.floor(time);
        const minutes = (time % 1) * 60;
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${formattedHours}${minutes === 0 ? '' : ':30'} ${ampm}`;
    };

    const formatTimeFromHour = (time) => {
        const hours = Math.floor(time);
        const minutes = (time % 1) * 60;
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${formattedHours}${minutes === 0 ? '' : ':30'} ${ampm}`;
    }

    const getHour = (slot) => {
        const [date, time] = slot.split('-')
        return time
    }

    const getEndHour = (slot) => {
        const [date, time] = slot.split('-')
        return parseFloat(time) + .5
    }

    const formatTimeFromSlot = (slot) => {
        const [date, time] = slot.split('-');
        return formatTimeFromHour(time)
    }

    const formatEndTimeFromSlot = (slot) => {
        const [date, time] = slot.split('-');
        const correctTime = parseFloat(time) + .5
        return formatTimeFromHour(correctTime)
    }

    const formatMonthOrDay = (slot) => {
        const [date, time] = slot.split('-');
        const [month, day] = date.split('/');

        const dateObj = new Date(`2000-${month}-01`); // Year and day don't matter here

        const monthName = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();

        return monthName === "INVALID DATE" ? date : monthName.toUpperCase()
    }

    const formatDate = (slot) => {
        const [date, time] = slot.split('-');
        const [month, day] = date.split('/');

        return day
    }

    const parseDateTime = (dateTimeStr, pos, api) => {
        const [dayPart, timePart] = dateTimeStr.split('-');
        const [monthOrWeekday, day] = dayPart.split('/');
        const [hours, minutes] = timePart.split('.').map(Number);
    
        let date = new Date(); // Current datetime in local timezone
    
        if (day) {
            date.setMonth(Number(monthOrWeekday) - 1); // months are 0-indexed in JS Date
            date.setDate(Number(day));
        } else {
            const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            const dayIndex = daysOfWeek.indexOf(monthOrWeekday);
            date.setDate(date.getDate() + ((dayIndex - date.getDay() + 7) % 7));
        }
    
        date.setHours(hours);
        if (pos === 'end') {
            date.setMinutes((minutes ? 30 : 0) + 30)
        } else {
            date.setMinutes(minutes ? 30 : 0);
        }
        date.setSeconds(0);
    
        if (api === "Zoom") {
            const localOffset = date.getTimezoneOffset() * -1; // Local timezone offset in minutes
            const targetOffset = selectedTimezone.offset * 60 ; // Target timezone offset
            const offsetDiff = (localOffset - parseInt(targetOffset)) * 60000; // Difference in milliseconds
    
            date.setTime(date.getTime() + offsetDiff); // Adjust the time to match selected timezone
        }
    
        return date;
    };

    const formatDateForAPI = (date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const generateGoogleMeetURL = () => {
        const baseURL = 'https://calendar.google.com/calendar/u/0/r/eventedit';
    
        const startDate = parseDateTime(meetingStart, "start", "Google");
        const endDate = parseDateTime(meetingEnd, "end", "Google");
    
        const params = new URLSearchParams({
            vcon: 'meet',
            hl: 'en',
            text: title,
            details: description,
            add: invites
        });

        const startDateStr = formatDateForAPI(startDate);
        const endDateStr = formatDateForAPI(endDate);
    
        params.append('dates', `${startDateStr}/${endDateStr}`);
    
        if (frequency === 'recurring') {
            const daysOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
            const dayIndex = startDate.getUTCDay();
            const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${daysOfWeek[dayIndex]}`;
            params.append('recur', rrule);
        }
    
        return `${baseURL}?${params.toString()}`;
    }

    const handleGoogleMeetClick = () => {
        const url = generateGoogleMeetURL();
        window.open(url);
    };

    useEffect(() => {
        const receiveMessage = (event) => {
            console.log("Received message")
            if (event.origin !== "https://usemeetup-api.com/") {
                return;
            }
            if (event.data.zoomAccessToken) {
                setZoomAccessToken(event.data.zoomAccessToken);
                setIsCreateZoomMeetingOpen(true);
            }
        };
    
        window.addEventListener('message', receiveMessage);
    
        return () => {
            window.removeEventListener('message', receiveMessage);
        };
    }, []);

    const generateZoomURL = () => {
        const baseURL = 'https://zoom.us/oauth/authorize'

        const params = new URLSearchParams({
            client_id: import.meta.env.VITE_ZOOM_CLIENT_ID,
            response_type: 'code',
            redirect_uri: import.meta.env.VITE_ZOOM_REDIRECT_URL,
            state: window.location.href
        });

        return `${baseURL}?${params.toString()}`
    }

    const handleZoomClick = () => {
        if (zoomAccessToken) {
            setIsCreateZoomMeetingOpen(true)
            return
        }
        const url = generateZoomURL();

        const width = 550
        const height = 650
        const left = (window.innerWidth - width) / 2;
        const top = (window.outerHeight - height) / 2;
        const popup = window.open(url, '_blank', `width=${width},height=${height},left=${left},top=${top}`);

        if (window.focus) {
            popup.focus();
        }
    };

    const handleCreateZoom = async () => {
        console.log(selectedTimezone)
        let recurrence = null
        if (frequency === 'recurring') {

            const dayOfWeek = parseDateTime(meetingStart, "start", "Zoom").getDay()
            recurrence = {
                type: 2,
                repeat_interval: 1,
                weekly_days: `${dayOfWeek + 1}`,
                end_times: 15,
                first_occurance: parseDateTime(meetingStart, "start", "Zoom").toISOString()
            };
        }
        console.log(selectedTimezone)
        const zonedStartTime = DateTime.fromJSDate(parseDateTime(meetingStart, "start", "Zoom"), { zone: selectedTimezone.value });
        const formattedStartTime = zonedStartTime.toISO({ includeOffset: true });

        const getZoomValue = (value) => {
            if (value === "America/Boise") {
                return "America/Denver"
            } else if (value === "Etc/GMT") {
                return "UTC"
            } else {
                return value
            }
        }

        const zoomMeetingDetails = {
            topic: title,
            type: frequency === 'recurring' ? 8 : 2,
            start_time: formattedStartTime,
            duration: (getEndHour(meetingEnd) - getHour(meetingStart)) * 60,
            agenda: description,
            timezone: getZoomValue(selectedTimezone.value),
            recurrence: recurrence,
            settings: {
                participant_video: true,
                host_video: true,
                join_before_host: false,
                mute_upon_entry: true,
                approval_type: 1,
                registration_type: 1,
                audio: "both",
                auto_recording: "none",
                enforce_login: false,
                // alternative_hosts: invites.join(',')
            },
        };

        try {
            const response = await axios.post('https://usemeetup-api.com/api/create-zoom-meeting', {
                accessToken: zoomAccessToken, 
                meetingDetails: zoomMeetingDetails
            });
            setZoomJoinURL(response.data.joinURL)
            console.log('Meeting created:', response.data);
        } catch (error) {
            console.error('Error creating Zoom meeting:', error.response ? error.response.data : error.message);
        }

        setAlertMessage("Zoom meeting created!")
        setAlertOpen(true)
        setIsCreateZoomMeetingOpen(false)
        setIsJoinURLDisplayed(true)
    }

    const handleCopy = () => {
        setAlertMessage("URL copied to clipboard")
        setAlertOpen(false)
        navigator.clipboard.writeText(zoomJoinURL).then(() => {
          setAlertOpen(true);
        });
    };
    
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAlertOpen(false);
    };

    const handleMouseDown = (day, time) => {
        if (display === 'all' && !isScheduling) {
            flashEditButton();
            return;
        }
        const slot = `${day}-${time}`;
        const isSlotSelected = selectedSlots.has(slot);

        setIsMouseDown(true);
        setStartSlot(slot);
        setIsDeselecting(isSlotSelected);
        setCurrentTempSlots(new Set([slot]));
        if (isScheduling) {
            setMeetingStartSlot(slot);
            setMeetingEndSlot(slot);
        }
    };

    const handleMouseEnter = (day, time) => {
        const slot = `${day}-${time}`;
        
        setAvailable(groupAvailability[slot] || []);
    
        if (!isMouseDown) return;
    
        if (!startSlot) return;
    
        const startDayIndex = days.indexOf(startSlot.split('-')[0]);
        const currentDayIndex = days.indexOf(day);
        const [startTime] = startSlot.split('-').slice(-1).map(Number);
        const currentTime = time;
    
        const minDayIndex = Math.min(startDayIndex, currentDayIndex);
        const maxDayIndex = Math.max(startDayIndex, currentDayIndex);
        const minTime = Math.min(startTime, currentTime);
        const maxTime = Math.max(startTime, currentTime);
    
        const newTempSlots = new Set();
    
        for (let d = minDayIndex; d <= maxDayIndex; d++) {
            for (let t = minTime; t <= maxTime; t += 0.5) {
                newTempSlots.add(`${days[d]}-${t}`);
            }
        }
    
        setCurrentTempSlots(newTempSlots);
        if (isScheduling) {
            setMeetingEndSlot(slot);
        }
    };
    
    const handleMouseUp = () => {
        setIsMouseDown(false);

        if (!isScheduling) {
            const newSelectedSlots = new Set(selectedSlots);

            currentTempSlots.forEach((slot) => {
                if (isDeselecting) {
                    newSelectedSlots.delete(slot);
                } else {
                    newSelectedSlots.add(slot);
                }
            });

            setSelectedSlots(newSelectedSlots);
        }

        setStartSlot(null);
        setCurrentTempSlots(new Set());
        setIsDeselecting(false);
    };

    const renderTimeSlots = (day) => {
        return times.map((time) => {
            const slot = `${day}-${time}`;
            const isSelected = selectedSlots.has(slot);
            const isTempSelected = currentTempSlots.has(slot);
            const isDeselected = isDeselecting && isTempSelected;
            const shouldBeSelected = !isDeselecting && isTempSelected;
            const isBestTime = isScheduling && bestMeetingTimes.has(slot)
            const isHourSlot = time % 1 == 0;
            
            let backgroundColor = '';
            if (display === 'all') {
                const count = (groupAvailability[slot] && groupAvailability[slot].length) || 0;
                if (count) {
                    backgroundColor = `rgba(30, 150, 92, ${Math.min(count / Object.keys(accepted).length, 1)})`;
                } else {
                    backgroundColor = 'white';
                }
            }

            return (
                <div
                    key={slot}
                    data-slot={slot}
                    className={`calendar-time-slot ${isSelected ? 'selected' : ''} ${isDeselected ? 'deselecting' : ''} ${shouldBeSelected ? 'temp-selected' : ''} ${isHourSlot ? 'dashed' : ''} ${isBestTime ? 'best' : ''}`}
                    onMouseDown={() => handleMouseDown(day, time)}
                    onMouseEnter={() => handleMouseEnter(day, time)}
                    onMouseUp={handleMouseUp}
                    style={{ backgroundColor }}
                >
                    {/* {isBestTime && <img src={SuggestedIcon} alt='Suggested time' className='suggested-time-icon' />} */}
                </div>
            );
        });
    };

    function sortDays(days) {
        if (frequency === 'one-time') {
            const currentDate = new Date()
            const currentYear = currentDate.getFullYear()
            const currentMonth = currentDate.getMonth() + 1
        
            const parsedDates = days.map(date => {
                const [month, day] = date.split('/').map(Number)
                let year = currentYear
        
                if (month < currentMonth || (month === currentMonth && day < currentDate.getDate())) {
                    year++
                }
        
                return new Date(year, month - 1, day)
            });
        
            parsedDates.sort((a, b) => a - b)
        
            return parsedDates.map(date => `${date.getMonth() + 1}/${date.getDate()}`)
        } else {
            const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

            return days.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))
        }
    }

    const renderDays = () => {
        return sortDays(days).slice(startIndex, startIndex + 7).map((day) => (
            <div key={day} className="calendar-day">
                <div className="calendar-day-label">{day}</div>
                <div className="day-slots">{renderTimeSlots(day)}</div>
            </div>
        ));
    };

    const renderMeetingBlock = () => {
        console.log("Rendering")
        if (!meetingStartSlot || !meetingEndSlot) return null
        const startSlotElement = document.querySelector(`[data-slot="${meetingStartSlot}"]`);
        const endSlotElement = document.querySelector(`[data-slot="${meetingEndSlot}"]`);

        if (!startSlotElement || !endSlotElement) { // Scheduled meeting is no longer within user's selected days/times
            return (
                <div
                className={`meeting-block ${isScheduling ? 'transparent' : ''} `}
                style={{
                    top: 0,
                    left: 0,
                    height: 0,
                    width: 0
                }}>
                    Meeting
            </div>
            )
        }

        const top = startSlotElement.offsetTop;
        const left = startSlotElement.offsetLeft;
        const width = endSlotElement.offsetWidth;
        const height = endSlotElement.offsetTop + endSlotElement.offsetHeight - top - 1;

        return (
            <div
                className={`meeting-block ${isScheduling ? 'transparent' : ''} `}
                style={{
                    top: `${top}px`,
                    left: `${left}px`,
                    height: `${height}px`,
                    width: `${width}px`
                }}>
                    Meeting
            </div>
        );
    };

    const CustomAlert = styled(Alert)(({ theme }) => ({
        backgroundColor: 'rgba(0, 123, 255)',
        color: 'white',
        borderRadius: '8px',
        '.MuiAlert-action': {
          color: 'white',
        },
    }));

    return (
        <div className='availability-info'>
            <div className='calendar-with-nav'>
                {days.length > 7 && 
                    <IoChevronBack 
                        className={`calendar-nav-button ${startIndex === 0 ? 'disabled' : ''}`} 
                        onClick={handlePrev} 
                        size={30}
                        disabled={startIndex === 0}
                    />
                }
                <div className='times-and-calendar'>
                    <div className="time-axis">
                        {times.map((time, index) => (
                            <div key={index} className="hour-label">
                                {index % 2 === 0 && formatTime(time)}
                            </div>
                        ))}
                    </div>
                    <div className="calendar">
                        <div className="calendar-grid" onMouseLeave={handleMouseUp}>
                            {renderDays()}
                            {renderMeetingBlock()}
                        </div>
                    </div>      
                </div>
                {days.length > 7 && 
                    <IoChevronForward 
                        className={`calendar-nav-button ${startIndex === days.length - 7 ? 'disabled' : ''}`}
                        onClick={handleNext} 
                        size={30}
                        disabled={startIndex === days.length - 7}
                    />
                }
            </div>
            <div className='right-panel-content'>
                <AvailabilityViewer
                    userId={userId}
                    available={available}
                    responded={accepted}
                />
                {display === 'all' && admin &&
                    <div className='scheduling-buttons'>
                        <TimezoneSelect
                            onChange={setSelectedTimezone}
                            // options={modifiedTimezones}
                            value={selectedTimezone}
                            id="timezone-input"
                            className="meeting-time-input" 
                            classNamePrefix= "react-select" 
                            menuPlacement='top'
                            isSearchable={false}
                        />
                        <button 
                            className='google-meet-button' 
                            disabled={!meetingStart || !meetingEnd}
                            onClick={handleGoogleMeetClick}>
                            <SiGooglecalendar className='google-meet-icon'
                        />
                            <div className='open-in-text'>Open in Google Calendar</div>
                        </button>
                        <button 
                            className='zoom-button' 
                            disabled={!meetingStart || !meetingEnd}
                            onClick={handleZoomClick}>
                            <SiZoom size={30} className='zoom-icon'
                        />
                            <div className='open-in-text'>Schedule with Zoom</div>
                        </button>
                    </div>
                }
            </div>
            {isCreateZoomMeetingOpen && (
                <div className="overlay">
                    <div className='create-zoom-box'>
                        <div className='zoom-box-header'>
                            <div className='zoom-box-title'>Create Zoom meeting</div>
                            <IoClose size={20} className='close-zoom-button' onClick={() => setIsCreateZoomMeetingOpen(false)}/>
                        </div>
                        <div className='zoom-info'>
                            <div className='zoom-meeting-title'>{title}</div>
                            <div className='zoom-meeting-description'>{description}</div>
                            <div className='zoom-meeting-info'>
                                <div className='zoom-meeting-day'>
                                    <div className='zoom-meeting-day-text'>
                                        {formatMonthOrDay(meetingStart)}
                                    </div>
                                    {frequency === "one-time" ?
                                        <div className='zoom-meeting-day-text'>{formatDate(meetingStart)}</div> : 
                                        <FaRedoAlt size={18} className="zoom-recurring-icon"/>
                                    }
                                </div>
                                <div className='zoom-meeting-times'>{formatTimeFromSlot(meetingStart)} - {formatEndTimeFromSlot(meetingEnd)}</div>
                            </div>
                        </div>
                        <button className='create-zoom-button' onClick={handleCreateZoom}>Create</button>
                    </div>
                </div>
            )}
            {isJoinURLDisplayed && 
                <div className='overlay'>
                    <div className='create-zoom-box'>
                        <div className='zoom-box-header'>
                            <div className='zoom-box-title'>Meeting URL</div>
                            <IoClose size={20} className='close-zoom-button' onClick={() => setIsJoinURLDisplayed(false)}/>
                        </div>
                        <div className='url-container'>
                            <div className='url-container-text'>
                                <div>{zoomJoinURL}</div>
                            </div>
                            <div className='url-container-icon'>
                                <FaRegCopy className='copy-button' onClick={handleCopy}/>
                            </div>
                        </div>
                    </div>
                </div>
            }
            <Snackbar
                open={alertOpen}
                autoHideDuration={5000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <CustomAlert onClose={handleClose} severity="success" sx={{ width: '100%' }} variant="filled">
                    {alertMessage}
                </CustomAlert>
            </Snackbar>
        </div>
    );
}