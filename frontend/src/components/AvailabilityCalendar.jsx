import React, { useState, useEffect } from 'react';
import { AvailabilityViewer } from './AvailabilityViewer';
import SuggestedIcon from '../public/MeetUp-sparkle-icon.svg'
import './AvailabilityCalendar.css';

export function AvailabilityCalendar({ userId, days, display, availability, updateSelectedSlots, startTime, endTime, meetingStart, meetingEnd, updateMeetingTimes, accepted, flashEditButton, isScheduling }) {
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
                    className={`calendar-time-slot ${isSelected ? 'selected' : ''} ${isDeselected ? 'deselecting' : ''} ${shouldBeSelected ? 'temp-selected' : ''}`}
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
            ></div>
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
            {display === 'all' && (
                <AvailabilityViewer
                    available={available}
                    responded={accepted}
                />
            )}
        </div>
    );
}