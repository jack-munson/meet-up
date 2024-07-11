import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AvailabilityViewer } from './AvailabilityViewer'
import SuggestedIcon from '../public/MeetUp-sparkle-icon.svg'
import { SiGooglemeet } from "react-icons/si"
import { SiZoom } from "react-icons/si"
import './AvailabilityCalendar.css'

export function AvailabilityCalendar({ userId, title, description, invites, days, frequency, display, availability, updateSelectedSlots, startTime, endTime, meetingStart, meetingEnd, updateMeetingTimes, accepted, flashEditButton, isScheduling }) {
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
    const location = useLocation();

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
                    const top = startSlotElement.offsetTop;
                    const left = startSlotElement.offsetLeft;
                    const width = endSlotElement.offsetWidth;
                    const height = endSlotElement.offsetTop + endSlotElement.offsetHeight - top - 1;

                    const meetingBlock = document.querySelector('.meeting-block');
                    if (meetingBlock) {
                        meetingBlock.style.top = `${top}px`;
                        meetingBlock.style.left = `${left}px`;
                        meetingBlock.style.height = `${height}px`;
                        meetingBlock.style.width = `${width}px`;
                    }
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call to set the size

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [meetingStartSlot, meetingEndSlot])

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

    const generateGoogleMeetURL = () => {
        const baseURL = 'https://calendar.google.com/calendar/u/0/r/eventedit';
        
        const parseDateTime = (dateTimeStr, pos) => {
            const [dayPart, timePart] = dateTimeStr.split('-');
            const [monthOrWeekday, day] = dayPart.split('/');
            const [hours, minutes] = timePart.split('.').map(Number);
            const date = new Date();
    
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
            console.log(date)
            return date;
        };
    
        const formatDateForGoogleCalendar = (date) => {
            return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        };
    
        const startDate = parseDateTime(meetingStart, "start");
        const endDate = parseDateTime(meetingEnd, "end");
    
        const params = new URLSearchParams({
            vcon: 'meet',
            hl: 'en',
            text: title,
            details: description,
            add: invites
        });

        const startDateStr = formatDateForGoogleCalendar(startDate);
        const endDateStr = formatDateForGoogleCalendar(endDate);
    
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
        // const urlParams = new URLSearchParams(window.location.search);
        // console.log("URL Parameters:", urlParams.toString());
        
        // // Check if zoomAccessToken is received via URL query params
        // const token = urlParams.get('zoomAccessToken');
        // console.log("Access Token from URL:", token);
        
        // if (token) {
        //     setZoomAccessToken(token);
            
        //     // Close the popup window (if any) after sending token to opener
        //     if (window.opener) {
        //         window.opener.postMessage({ zoomAccessToken: token }, window.location.origin);
        //         window.close();
        //     }
        // }
    
        const receiveMessage = (event) => {
            console.log("Received message")
            if (event.origin !== "http://localhost:3000") {
                return;
            }
            if (event.data.zoomAccessToken) {
                setZoomAccessToken(event.data.zoomAccessToken);
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
        const url = generateZoomURL();
        const popup = window.open(url, '_blank', 'width=600,height=800');
        if (window.focus) {
            popup.focus();
        }
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
                    backgroundColor = `rgba(30, 150, 92, ${Math.min(count / ((accepted.length / 2) + 1), 1)})`;
                } else {
                    backgroundColor = 'white';
                }
            }

            return (
                <div
                    key={slot}
                    data-slot={slot}
                    className={`calendar-time-slot ${isSelected ? 'selected' : ''} ${isDeselected ? 'deselecting' : ''} ${shouldBeSelected ? 'temp-selected' : ''} ${isHourSlot ? 'dashed' : ''}`}
                    onMouseDown={() => handleMouseDown(day, time)}
                    onMouseEnter={() => handleMouseEnter(day, time)}
                    onMouseUp={handleMouseUp}
                    style={{ backgroundColor }}
                >
                    {isBestTime && <img src={SuggestedIcon} alt='Suggested time' className='suggested-time-icon' />}
                </div>
            );
        });
    };

    const renderDays = () => {
        return days.map((day) => (
            <div key={day} className="calendar-day">
                <div className="calendar-day-label">{day}</div>
                <div className="day-slots">{renderTimeSlots(day)}</div>
            </div>
        ));
    };

    const renderMeetingBlock = () => {
        if (!meetingStartSlot || !meetingEndSlot) return null;
        
        const startSlotElement = document.querySelector(`[data-slot="${meetingStartSlot}"]`);
        const endSlotElement = document.querySelector(`[data-slot="${meetingEndSlot}"]`);

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
                }}
            >Meeting
            </div>
        );
    };

    return (
        <div className='availability-info'>
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
            <div className='right-panel-content'>
                {display === 'all' && (
                    <AvailabilityViewer
                        available={available}
                        responded={accepted}
                    />
                )}
                <div className='scheduling-buttons'>
                    <button 
                        className='google-meet-button' 
                        disabled={!meetingStart || !meetingEnd}
                        onClick={handleGoogleMeetClick}>
                        <SiGooglemeet className='google-meet-icon'/>
                        <div className='open-in-text'>Open in Google Meet</div>
                    </button>
                    <button 
                        className='zoom-button' 
                        disabled={!meetingStart || !meetingEnd}
                        onClick={handleZoomClick}>
                        <SiZoom size={30} className='zoom-icon'/>
                        <div className='open-in-text'>Schedule with Zoom</div>
                    </button>
                </div>
            </div>
        </div>
    );
}