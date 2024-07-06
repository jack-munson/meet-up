import React, { useState, useEffect } from 'react';
import { AvailabilityViewer } from './AvailabilityViewer';
import './AvailabilityCalendar.css';

export function AvailabilityCalendar({ userId, days, frequency, display, availability, updateSelectedSlots, startTime, endTime, meetingStart, meetingEnd, updateMeetingTimes, accepted, flashEditButton, isScheduling }) {
    const [selectedSlots, setSelectedSlots] = useState(new Set());
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startSlot, setStartSlot] = useState(null);
    const [currentTempSlots, setCurrentTempSlots] = useState(new Set());
    const [isDeselecting, setIsDeselecting] = useState(false);
    const [groupAvailability, setGroupAvailability] = useState({});
    const [available, setAvailable] = useState([]);
    const [meetingStartSlot, setMeetingStartSlot] = useState(null);
    const [meetingEndSlot, setMeetingEndSlot] = useState(null);

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
        updateSelectedSlots(selectedSlots);
    }, [selectedSlots]);

    useEffect(() => {
        updateMeetingTimes(meetingStartSlot, meetingEndSlot)
    }, [meetingStartSlot, meetingEndSlot])

    useEffect(() => {
        setMeetingStartSlot(meetingStart);
        setMeetingEndSlot(meetingEnd);
    }, [meetingStart, meetingEnd]);

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
        setMeetingStartSlot(slot);
        setMeetingEndSlot(slot);
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
        // if (isScheduling) {
        //     console.log("Start: ", meetingStartSlot)
        //     console.log("End: ", meetingEndSlot)
        // }
    };

    const renderTimeSlots = (day) => {
        return times.map((time) => {
            const slot = `${day}-${time}`;
            const isSelected = selectedSlots.has(slot);
            const isTempSelected = currentTempSlots.has(slot);
            const isDeselected = isDeselecting && isTempSelected;
            const shouldBeSelected = !isDeselecting && isTempSelected;

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
        console.log("meetingStart: ", meetingStart)
        console.log("meetingEnd: ", meetingEnd)
        console.log("meetingStartSlot: ", meetingStartSlot)
        console.log("meetingEndSlot: ", meetingEndSlot)
        if (!meetingStartSlot || !meetingEndSlot) return null;
        console.log("Start and end slot available")
        const startSlotElement = document.querySelector(`[data-slot="${meetingStartSlot}"]`);
        const endSlotElement = document.querySelector(`[data-slot="${meetingEndSlot}"]`);

        const top = startSlotElement.offsetTop;
        const left = startSlotElement.offsetLeft;
        const width = endSlotElement.offsetWidth;
        const height = endSlotElement.offsetTop + endSlotElement.offsetHeight - top - 1;

        return (
            <div
                className="meeting-block"
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
